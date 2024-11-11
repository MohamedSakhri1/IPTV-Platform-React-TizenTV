
import { useFocusable, FocusContext } from "@noriginmedia/norigin-spatial-navigation";
import PlaylistCard, { PlaylistAdd } from "../Components/PlaylistCard";
import { useEffect, useState, useRef } from "react";
import './Playlists.css';
import { db } from '../Database/db';
import { useLiveQuery } from "dexie-react-hooks";
import BottomActions from "../Components/BottomActions";
import Action from "../Components/Action";

import { ReactComponent as Red} from '../images/remote actions/red.svg'
import axios from "axios";
import { useLocation } from "react-router-dom";

export default function PlaylistsPage() {
    const location = useLocation();

    useEffect(()=> {
        sessionStorage.setItem('PlaylistLoadDone', 'false');
        return () => {
            sessionStorage.setItem('PlaylistLoadDone', 'false');
        } 
    }, [location.pathname])


    /** FOCUS */
    const { ref, focusKey, focusSelf } = useFocusable({
        trackChildren: true,
        focusKey: 'main-page-key',
        focusBoundaryDirections: ['up', 'down'],
        focusable: false,
    });

    /** TIME */
    const [thisMoment, setThisMoment] = useState(new Date().toLocaleString());

    useEffect(() => {
        const interval = setInterval(() => {
            setThisMoment(new Date().toLocaleString());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    /** DATA */
    const playlists = useLiveQuery(async () => {
        sessionStorage.setItem('PlaylistLoadDone', 'false')
        const myPlaylists = await db.playlists.toArray();
        const upToDatePlaylists = []
        myPlaylists.map(async (element, index) => {
            await axios.get(element.host +'/player_api.php?username='+ element.username + '&password=' + element.password + '&action=user_info', { timeout: 2000 })
            .then(
                response => {
                    const data = response.data;
                    upToDatePlaylists[index] = { ...element, status: data.user_info.status, currentConnection: data.user_info.active_cons }
                }
            )
            .catch( (error) => {
                    console.log(error);
                    upToDatePlaylists[index] = { ...element, status: 'Not Responding' }
            });
        });
        return upToDatePlaylists.reverse();
    });


    /** RED BUTTON */
    const handleRedButtonPress = async () => {
        const focusedElement = document.querySelector('.playlist-card.focused');
        const playlistId = focusedElement?.dataset.id;

        if (playlistId) {
            try {
                await db.playlists.delete(Number(playlistId));
                console.log(`Playlist with ID ${playlistId} deleted.`);
            } catch (error) {
                console.error('Failed to delete playlist:', error);
            }
        } else {
            console.log('No playlist is focused for deletion.');
        }
    };

    useEffect(() => {
        focusSelf();  // Ensure focus is set to the grid when this page loads

        const handleKeyDown = (event) => {
            if (event.keyCode === 82 || event.keyCode === 403) { // Assuming 82 is the Red button key code
                console.log('red button pressed')
                handleRedButtonPress();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [focusSelf]);

    const renderCount = useRef(0);
    const allRendered = useRef(false); // Flag to ensure session storage is set once

    // Callback ref function to be called after each playlist is rendered
    const handleRendered = () => {
        renderCount.current += 1;
        if (renderCount.current === playlists.length && !allRendered.current) {
            // When all playlists are rendered, set sessionStorage
            sessionStorage.setItem('PlaylistLoadDone', 'true');
            allRendered.current = true;
        }
    };
    
    return (
        <FocusContext.Provider value={focusKey}>
            <div className="playlist-page-wrapper">
                <div className="playlist-page">
                    <h1 className="playlist-page-header">My Playlists</h1>
                    <p className="current-date">{thisMoment}</p>
                </div>
                <div className="playlists-container" ref={ref}>
                    { playlists?.map((playlist) => (
                        <div key={playlist.id} ref={handleRendered}>
                            <PlaylistCard key={playlist.id} playlist={playlist} />
                        </div>
                        ))

                    }

                    <PlaylistAdd />
                </div>
            </div>
            <BottomActions>
                <Action Svg={Red} label={'Delete'}/>
            </BottomActions>
        </FocusContext.Provider>
    );
}
