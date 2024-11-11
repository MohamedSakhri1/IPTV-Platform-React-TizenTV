import { useLocation, useNavigate } from "react-router-dom";
import WideButton from "../../Components/WideButton";
import { useEffect, useState } from "react";
import './ChannelsMenu.css';
import { FocusContext, setFocus, useFocusable, getCurrentFocusKey } from "@noriginmedia/norigin-spatial-navigation";
import { ReactComponent as ChannelIcon } from '../../images/channelLogo.svg';
import { ChannelLogo } from "../../Components/player";
import { db } from "../../Database/db";

export default function ChannelsMenu() {
    const location = useLocation();
    const navigate = useNavigate();
    const [channels, setChannels] = useState([]);
    const [currFocus, setCurrFocus] = useState(getCurrentFocusKey());  // Tracks the current focused element
    const [currCh, setCurrCh] = useState('');  // Tracks the currently selected channel

    const data = location.state;

    // Handle channel click and navigate to the player
    const handleChannelClick = (channel, index) => {
        console.log('Channel clicked:', channel.stream_id);

        // Store the last clicked channel in session storage and navigate to the player
        sessionStorage.setItem('lastChannelKey', `wide-button-${channel.stream_id}`);
        const dataToSend = {...channel, index: index }
        navigate('/tv-player', { state: { channel: dataToSend } });
    };

    useEffect(() => {
        async function fetchChannels() {
            var channels1;
            switch (data.type) {
                case 'groupe':
                    const AllchannelsByGroupe = await JSON.parse(sessionStorage.getItem('tvChannelsByGroup'));
                    channels1 = AllchannelsByGroupe[data.categorieId];
                    break;
                case 'fav':
                    const AllFavChannels = await db.favorits.where({'playlistId' : data.playlist.id}).toArray();
                    const AllchannelsData = [];
                    AllFavChannels.map((item, index) => {
                        const itemData = JSON.parse(item.channelData)
                        AllchannelsData[index] = itemData;
                    })
                    channels1 = AllchannelsData;
                    break;
                case 'recent-watch':
                    break;
            }
            
            setChannels(channels1);
            sessionStorage.setItem('thisGroupe', JSON.stringify(channels1));
        }
        fetchChannels();
    }, [data.categorieId]);

    /** FOCUS */
    const { ref, focusSelf, focusKey } = useFocusable({
        saveLastFocusedChild: true,
        trackChildren: true,
        focusBoundaryDirections: ['right'],
        focusKey: 'main-page-key',
    });

    useEffect(() => {
        let retryCount = 0;
        const maxRetries = 10;

        const focusInterval = setInterval(() => {
            if (retryCount >= maxRetries) {
                clearInterval(focusInterval);
                console.warn("Max retries reached, stopping focus attempts.");
                return;
            }

            const lastFocusedKey = sessionStorage.getItem('lastChannelKey');
            const favDeleted = sessionStorage.getItem('favDeleted')
            if (lastFocusedKey !== 'null' && (favDeleted === null || (favDeleted && data.type !== 'fav'))) { // existance d'une encien chaine et non supression de fav || supression et non type = fav
                if (document.querySelector('.wide-button')) {
                    setFocus(lastFocusedKey);
                    console.log(`Focused on -> ${lastFocusedKey}`);
                    clearInterval(focusInterval);  // Stop the interval once focus is set
                }
            } else {
                sessionStorage.removeItem('favDeleted');
                const firstChannelFocusKey = `wide-button-${channels[0]?.stream_id}`;
                if (channels.length > 0) {
                    setFocus(firstChannelFocusKey);
                    console.log(`Focused on the first channel -> ${firstChannelFocusKey}`);
                    clearInterval(focusInterval);  // Stop the interval once focus is set
                } else {
                    focusSelf();
                    console.log(`Focused on the first available item.`);
                    clearInterval(focusInterval);  // Stop the interval
                }
            }
            retryCount += 1;
        }, 100);  // Check every 100ms

        return () => clearInterval(focusInterval);  // Cleanup the interval on component unmount

    }, [channels, focusSelf]);

    /** TRACK FOCUS CHANGES */
    useEffect(() => {
        const interval = setInterval(() => {
            const focusKey = getCurrentFocusKey();

            // Extract the stream_id from the focusKey using split instead of slicing
            try {
                const ChannelID = focusKey.split('-')[2];  // Extract the stream_id from focusKey
                const channel = channels.find(channel => String(channel.stream_id) === ChannelID);
    
                if (channel) {
                    setCurrCh(channel);  // Set the current channel if found
                }
    
                if (focusKey) {
                    setCurrFocus(focusKey);  // Update the current focus state
                }
            } catch (error) {
                console.error('Error tracking focus changes:', error);
            }
        }, 100);  // Check focus every 100ms

        return () => clearInterval(interval);  // Cleanup interval
    }, [channels]);

    return (
        <FocusContext.Provider value={focusKey}>
            <div className="channels-menu">
                <div className="left-half">
                    <label className="groupe-label">
                        {data.label}
                    </label>
                    <div className="menu-content">
                        <div className="menu-channels" ref={ref}>
                            {channels?.map((ch, index) => (
                                <WideButton
                                    id={ch.stream_id}
                                    key={ch.stream_id}
                                    focusKey={`wide-button-${ch.stream_id}`}
                                    content={ch.name}
                                    action={() => handleChannelClick(ch, index)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
                <div className="channel-overview">
                    <div className="channel-essensals" style={{ height: '300px', marginBlock: '20px'}}>
                        <ChannelLogo channel={currCh} />
                        <h2 className="ch-name">{currCh.name}</h2>
                    </div>
                </div>
            </div>
        </FocusContext.Provider>
    );
    
}
