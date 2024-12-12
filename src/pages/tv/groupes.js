import Card, { FavoriesCard, RecentCard } from "../../Components/Card";
import { useFocusable, FocusContext, getCurrentFocusKey, setFocus } from "@noriginmedia/norigin-spatial-navigation";
import { useEffect, useState } from "react";
import './groupes.css';

import Action from "../../Components/Action";
import { ReactComponent as Green } from '../../images/remote actions/green.svg';
import { ReactComponent as Yellow } from '../../images/remote actions/yellow.svg';

import BottomActions from "../../Components/BottomActions";
import { db } from "../../Database/db";

export default function GroupPage() {
    sessionStorage.setItem('lastChannelKey', null);
    const playlist = JSON.parse(sessionStorage.getItem('playlist'));

    /** DATA */
    async function getLiveCategories() {
        try {
            return await JSON.parse(sessionStorage.getItem('tvGroups'))
        } catch (error) {
            console.error(error);
        }
    }

    const [categories, setCategories] = useState([]);
    const [togglePinEffect, setTogglePinEffect] = useState(false); // New state to trigger re-fetch
    
    useEffect(() => {
        async function fetchCategories() {
            const fetchedCategories = await getLiveCategories();
    
            // Get pinned groupes
            const pinnedGroupes = await db.groupes
                .where({isPinned: 1,playlistId: playlist.id})
                .toArray();
    
            // Map and update categories with isPinned status
            let updatedCategories = fetchedCategories.map((cat) => {
                const isPinned = pinnedGroupes.some((pinnedCat) => pinnedCat.groupeId === cat.category_id);
                return { ...cat, isPinned: isPinned ? 1 : 0 };
            });
    
            // Sort categories: pinned ones first
            updatedCategories = updatedCategories.sort((a, b) => b.isPinned - a.isPinned);
    
            setCategories(updatedCategories);
        }
    
        fetchCategories();
    }, [togglePinEffect, playlist.id]); // Re-fetch whenever togglePinEffect changes
    

    /** FOCUS */
    const { ref, focusKey, focusSelf } = useFocusable({
        trackChildren: true,
        focusKey: 'main-page-key',
        saveLastFocusedChild: true,
        isFocusBoundary: true,
        focusBoundaryDirections: ['up', 'down', 'right'],
        forceFocus: true,
    });

    const [initialFocusKey, setInitialFocusKey] = useState(null);

    useEffect(() => {
        const lastFocusedKey = sessionStorage.getItem('lastGroupeKey');
        if (lastFocusedKey) {
            setInitialFocusKey(lastFocusedKey);
        }
    }, []);

    useEffect(() => {
        if (initialFocusKey && initialFocusKey !== 'null') {
            const interval = setInterval(() => {
                const currentFocusedElement = document.querySelectorAll('div.card');
                if (currentFocusedElement) {
                    setFocus(initialFocusKey);
                    console.log('Focused on -> ' + initialFocusKey);
                    clearInterval(interval); // Stop checking once the element is found and focused
                }
            }, 100); // Check every 100ms until the element is found
        } else {
            setFocus('Groupes-card-Favories')
            console.log('Focused on -> ' + getCurrentFocusKey());
        }
    }, [initialFocusKey, focusSelf]);

    /** GREEN BUTTON - TOGGLE PINNED STATUS */
    async function togglePin(data) {
    try {
        // Search if the group exists for the specific playlist
        const myGroupe = await db.groupes
            .where({ groupeId: data.groupeId, playlistId: data.playlistId })
            .first();

        if (myGroupe) {
            // If the group exists for the specific playlist, toggle the pin status
            const newPinStatus = myGroupe.isPinned ? 0 : 1;
            await db.groupes.update(myGroupe.id, { isPinned: newPinStatus });
            console.log(`${data.groupeId} in playlist ${data.playlistId} is ${newPinStatus ? 'pinned' : 'unpinned'} with success!`);
            return newPinStatus;
        } else {
            // Add new group for the specific playlist if it doesn't exist and pin it
            await db.groupes.add({
                groupeId: data.groupeId,
                isPinned: 1,
                isLocked: 0,
                playlistId: data.playlistId,
            });
            console.log(`${data.groupeId} in playlist ${data.playlistId} is pinned with success!`);
            setTogglePinEffect(() => !togglePinEffect)
            return 1;
        }
    } catch (e) {
        console.error('TOGGLE PIN ERROR: ' + e);
    }
    return null;
}

    async function handleGreenButton() {
        const focusedElement = document.querySelector('.card.focused');
        const groupeId = focusedElement?.dataset.id;
        const data = {
            groupeId,
            playlistId: JSON.parse(sessionStorage.getItem('playlist')).id,
        };

        if (groupeId) {
            try {
                const newPinStatus = await togglePin(data);
                console.log(`Groupe with ID ${groupeId} ${newPinStatus ? 'pinned' : 'unpinned'}.`);
            } catch (error) {
                console.error('Failed to toggle pin status for groupe:', error);
            }
        }
    }

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.keyCode === 404 || event.key === 'g') {
                console.log('green button pressed.');
                handleGreenButton();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleGreenButton]);

    return (
        <FocusContext.Provider value={focusKey}>
            <div className="group-page" ref={ref}>
                <div className="quick-access-items">
                    <FavoriesCard className='card' label="Favories" playlist={playlist}  distination='/lyt/channels-menu'/>
                    <RecentCard className='card' label="Recently Watched" playlist={playlist} distination='/lyt/channels-menu'/>
                </div>
                <div className="tv-groupes-container">
                    <label className="tv-groupes-label">TV Groupes</label>
                </div>
                <div className="grid-container">
                    {categories?.map((cat) => (
                        <Card
                            className='card'
                            key={cat.category_id}
                            label={cat.category_name}
                            categorieId={cat.category_id}
                            isPined={cat.isPinned === 1}
                            playlist={playlist}
                        />
                    ))}
                </div>
            </div>
            <BottomActions>
                <Action Svg={Yellow} label='Lock' />
                <Action Svg={Green} label='Add Pin' />
            </BottomActions>
        </FocusContext.Provider>
    );
}
