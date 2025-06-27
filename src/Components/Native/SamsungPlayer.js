import {useEffect, useRef, useState} from "react";
import {useLocation} from "react-router-dom";
import {addToFav, db, deleteFromFav} from "../../Database/db";
import PlayerAction from "../PlayerAction";
import {ReactComponent as Audio} from "../../images/audio.svg";
import { ReactComponent as Subtitle} from '../../images/subtitels.svg';
import { ReactComponent as Home} from '../../images/Home.svg';
import { ReactComponent as Back} from '../../images/X.svg';
import { ReactComponent as Fav} from '../../images/favorits.svg';
import { ReactComponent as Lock} from '../../images/locked.svg';
import { ReactComponent as Green } from '../../images/remote actions/green.svg';
import { ReactComponent as Yellow } from '../../images/remote actions/yellow.svg';
import { ReactComponent as ChangeCh } from '../../images/remote actions/ChUpDown.svg';
import {ChannelLogo} from "../player";
import BottomActions from "../BottomActions";
import Action from "../Action";

/* global webapis */

export function SamsungPlayer() {
    const selectedPlaylist = JSON.parse(sessionStorage.getItem('playlist'));

    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const timeoutRef = useRef(null); // Reference to store the timeout ID

    const location = useLocation();

    var channelFromMenu = location.state.channel;
    const [channel, setChannel] = useState(channelFromMenu);
    const channelId = channelFromMenu.stream_id;
    var streamUrl = selectedPlaylist.host + '/live/' + selectedPlaylist.username + '/' + selectedPlaylist.password + '/' + channelId + '.ts';
    var nextCh = channelFromMenu;
    var prevCh = channelFromMenu;
    const selectedChannelGroupe = JSON.parse(sessionStorage.getItem('thisGroupe'))

    const [bufferCount, setBufferCount] = useState(0);
    const [isBuffering, setIsBuffering] = useState(false);
    const [isLoadingFail, setIsLoadingFail] = useState(false);

    console.log(channelId);



    var nativeStreamContainer
    const initializePlayer = () =>
    {
        if (window.webapis && window.webapis.avplay) {

            try {
                nativeStreamContainer = document.createElement('object');
                nativeStreamContainer.type = 'application/avplayer';
                nativeStreamContainer.style.left = 0 + 'px';
                nativeStreamContainer.style.top = 0 + 'px';
                nativeStreamContainer.style.width = 100 + 'vw';
                nativeStreamContainer.style.height = 100 + 'vh';
                document.body.appendChild(nativeStreamContainer);
                // Open the media file for AVPlay
                webapis.avplay.open(streamUrl);

                // Set player display area to fit the screen or desired area
                webapis.avplay.setDisplayRect(0, 0, 1920, 1080); // Fullscreen
                webapis.avplay.setDisplayMethod('PLAYER_DISPLAY_MODE_FULL_SCREEN'); // _LETTER_BOX

                // Prepare the player asynchronously and start playback
                webapis.avplay.prepareAsync(() => {
                    console.log('Player prepared successfully');
                    webapis.avplay.play();
                }, (error) => {
                    setIsLoadingFail(true)
                    console.error('Error during player preparation:', error);
                });
                // Calculate the naibour ch 1st call
                // naibourChannels(true)
            } catch (err) {
                console.error("Error initializing player:", err);
            }
        } else {
            console.error('Samsung AVPlay is not supported in this environment.');
        }
    };

    useEffect( () => {
        setIsMenuVisible(true)
        initializePlayer();
        return () => {
            // Clean up on unmount
            if (window.webapis?.avplay) {
                webapis.avplay.stop();
                webapis.avplay.close();
            }
        }
    }, [])

    /** NAIBOUR CHANNELS */

    async function computeNaibourChannels() {
        console.log(channelFromMenu);
        const groupeSize = selectedChannelGroupe.length
        console.log(selectedChannelGroupe)

        // Update nextCh and prevCh based on the current channel index
        let isLastChannelInGroupe = channelFromMenu.index === groupeSize - 1
        let isFirstChannelInGroupe = channelFromMenu.index === 0
        if (isLastChannelInGroupe) {
            nextCh = {...selectedChannelGroupe[0], index: 0 }; // First channel
            prevCh = { ...selectedChannelGroupe[channelFromMenu.index - 1], index: (channelFromMenu.index - 1) };
        } else if (isFirstChannelInGroupe) {
            nextCh = { ...selectedChannelGroupe[channelFromMenu.index + 1], index: (channelFromMenu.index + 1) };
            prevCh = { ...selectedChannelGroupe[groupeSize - 1], index: (groupeSize - 1) }; // Last channel
        } else {
            nextCh = { ...selectedChannelGroupe[channelFromMenu.index + 1],  index: (channelFromMenu.index + 1) }
            prevCh = { ...selectedChannelGroupe[channelFromMenu.index - 1], index: (channelFromMenu.index - 1) };
        }
    }

    /** HANDLE CHANNEL CHANGE */
    const handleChannelChange = (channelPosition) => {
        var nextSelectedChannel;
        setIsBuffering(false)
        setIsLoadingFail(false)
        computeNaibourChannels();
        if (channelPosition === 'next')
            nextSelectedChannel = nextCh;
        else if (channelPosition === 'prev')
            nextSelectedChannel = prevCh;
        // changing the stream
        webapis.avplay.stop();
        webapis.avplay.close();
        streamUrl = selectedPlaylist.host + '/live/' + selectedPlaylist.username + '/' + selectedPlaylist.password + '/' + nextSelectedChannel.stream_id + '.ts'
        // Update the current channel
        channelFromMenu = nextSelectedChannel;
        setChannel(() => nextSelectedChannel);
        webapis.avplay.open(streamUrl)
        webapis.avplay.prepareAsync(() => {
            console.log('Player prepared successfully');
            webapis.avplay.play();
        }, (error) => {
            setIsLoadingFail(true)
            // alert('Error during player preparation:', error);
        });
        sessionStorage.setItem('lastChannelKey', 'wide-button-' + nextSelectedChannel.stream_id)
    }

    useEffect(() => {
        const handleKeyDown = async (event) => {
            switch (event.keyCode) {
                case 10009: // back button
                case 27:
                    document.body.removeChild(nativeStreamContainer)
                    break;
                case 427: // channel up
                    handleChannelChange('next');
                    break;
                case 428: // channel down
                    handleChannelChange('prev');
                    break;
                 case 404: // green button
                    const favChannel = await db.favorits.get({'playlistId': selectedPlaylist.id, 'channelId': channelFromMenu.stream_id});
                    if (favChannel === undefined){
                        await addToFav(channelFromMenu, selectedPlaylist.id)
                        setFav(() => true)
                    } else {
                        await deleteFromFav(favChannel.id)
                        sessionStorage.setItem('favDeleted', 'true')
                        setFav(() => false)
                    }break;
                default:
                    console.log('default buttton');
                    break;
            }
        }
        document.addEventListener('keydown', handleKeyDown);
        // Cleanup function
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };

    }, []);



    /** Initialize the AVPlay listener for buffering */
    useEffect(() => {
        const listener = {
            onbufferingstart: function() {
                console.log("Buffering start.");
                setIsBuffering(true);
            },
            onbufferingprogress: function(percent) {
                console.log("Buffering progress: " + percent);
                setBufferCount(percent); // Update buffering progress
            },
            onbufferingcomplete: function() {
                console.log("Buffering complete.");
                setIsBuffering(false);
                setBufferCount(0); // Set to 100% on complete
            },
            onstreamcompleted: function() {
                console.log("Stream Completed");
                webapis.avplay.stop();
            },
            oncurrentplaytime: function(currentTime) {
                console.log("Current playtime: " + currentTime);
            },
            onerror: function(eventType) {
                console.log("Event type error: " + eventType);
            },
            onevent: function(eventType, eventData) {
                console.log("Event type: " + eventType + ", data: " + eventData);
            },
            onsubtitlechange: function(duration, text, data3, data4) {
                console.log("Subtitle text: " + text);
            },
            ondrmevent: function(drmEvent, drmData) {
                console.log("DRM callback: " + drmEvent + ", data: " + drmData);
            }
        };

        // Set the AVPlay listener
        webapis.avplay.setListener(listener);

        // Cleanup the listener on component unmount
        return () => {
            webapis.avplay.setListener(null); // Remove the listener
        };
    }, []);

    /** TIME */
    const [currentLocalTime, setCurrentLocalTime] = useState(new Date().toLocaleString());

    useEffect(() => {
        const oneSecondRefreshingInterval = setInterval(() => {
            setCurrentLocalTime(new Date().toLocaleString(undefined, {hour12: true, timeStyle: 'short'}));
        }, 1000);
        return () => clearInterval(oneSecondRefreshingInterval);
    }, []);


 /** RESOLUTION */
const [resolution, setResolution] = useState("N/A");

useEffect(() => {
    // Function to get the current resolution
    favState();
    const fetchResolution = () => {
        if (window.webapis && window.webapis.avplay) {
            try {
                // Get total track info
                const trackInfo = webapis.avplay.getTotalTrackInfo();

                // Find the video track and extract resolution
                for (const track of trackInfo) {
                    // Debug each track by adding to trackInfoDisplay
                    // setTrackInfoDisplay(prev => prev + JSON.stringify(track, null, 2));

                    if (track.type === 'VIDEO') {
                            // If extra_info does not contain the resolution, check other properties
                            const videoMetaData = JSON.parse(track.extra_info)
                            const extractedResAsString = videoMetaData.Width + 'x' + videoMetaData.Height;
                            setResolution(extractedResAsString);
                            return;
                    }
                }

                // If resolution is not found
                alert(prev => prev + "\nVideo resolution not found in track info.");
            } catch (error) {
                alert("Error getting video resolution: " + error);
            }
        } else {
            alert("AVPlay API is not available.");
        }
    };

    // Polling function to wait for the correct state
    const waitForCorrectState = () => {
        const halfSecondRefreshingInterval = setInterval(() => {
            if (window.webapis?.avplay) {
                const playerState = webapis.avplay.getState();
                const isPlayerStateCorrect = ["READY", "PLAYING", "PAUSED"].includes(playerState)
                if (isPlayerStateCorrect) {
                    fetchResolution();
                    clearInterval(halfSecondRefreshingInterval); // Stop polling
                }
            } else {
                alert("AVPlay API is not available.");
                clearInterval(halfSecondRefreshingInterval); // Stop polling if the API is not available
            }
        }, 500); // Check every 500ms

        // Cleanup interval on component unmount
        return () => clearInterval(halfSecondRefreshingInterval);
    };

    // Start polling for the correct state
    const cleanup = waitForCorrectState();

    // Cleanup interval on component unmount
    return cleanup;
}, [channel]);




    /** HANDLING ACTIONS */
    function handleHide() {
        setIsMenuVisible(false)
        console.log('hide button clicked.')
    }

    /** Handle favorits -Green Button- */
    const [isFav, setFav] = useState(false)
    const favState = async () => {
        const favChannel = await db.favorits.get({'playlistId': selectedPlaylist.id, 'channelId': channelFromMenu.stream_id})
        const responce = favChannel !== undefined;
        setFav(responce);
        console.log('fav status: '+ responce)
        return responce
    }


    /** HANDELING HIDING THE MENU */
   // Function to start the 5-second timeout
    const startHideMenuTimeout = () => {
        // Clear the existing timeout, if any
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Start a new timeout to hide the menu after 5 seconds
        timeoutRef.current = setTimeout(() => {
            setIsMenuVisible(false);
            console.log("Menu hidden due to inactivity.");
        }, 5000);
    };
    // Handle key presses
    useEffect(() => {
        // Function to handle key press events
        const handleKeyPress = (event) => {
            if (event.keyCode !== 10009){
                console.log("Key pressed, restarting timeout.");
                setIsMenuVisible(true); // Show the menu
                startHideMenuTimeout(); // Restart the timeout
            }
        };

        // Attach keydown event listener
        document.addEventListener('keydown', handleKeyPress);

        // Start the initial timeout
        startHideMenuTimeout();

        // Cleanup: Remove event listener and clear the timeout on component unmount
        return () => {
            document.removeEventListener('keydown', handleKeyPress);
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []); // Empty dependency array, so this runs only on mount/unmount





    return (
        <>
            <div className={"player-shadow" + (isMenuVisible || isBuffering || isLoadingFail ? '' : ' hidden')} >
                { isBuffering &&
                    <h1 className="buffer-count">{bufferCount}%</h1>
                }
                { isLoadingFail &&
                    <h1 className="buffer-count" style={{ fontSize: '80px'}}>Stream not available !</h1>
                }

                { isMenuVisible &&
                    <>
                        <div className="player-container" >

                                <div className="player-header" >
                                <div className="player-header-wrapper" >
                                    <div className="player-header-action" >
                                        <PlayerAction Svg={Audio} />
                                        <PlayerAction Svg={Subtitle} />
                                        <PlayerAction Svg={Home} />
                                        <PlayerAction Svg={Back} handleClick={() => handleHide()}/>
                                    </div>
                                    <p className="player-time" >{currentLocalTime}</p>
                                </div>
                            </div>


                            <div className="player-footer">
                                <div className="player-footer-wrapper">
                                    <div className="player-channel-logo">
                                        <ChannelLogo channel={channel}/>
                                    </div>
                                    <div className="player-channel-info">
                                        <label className="player-ch-name">{channel.name}</label>
                                        <div className="player-ch-epg">
                                            <div className="player-epg-row">
                                                <p className="player-epg-row epg-time">NOW</p>
                                                <p className="player-epg-row epg-data">UCL : Real Madrid CF v FC Napoli </p>
                                            </div>
                                            <div className="player-epg-row">
                                                <p className="player-epg-row epg-time">22:00-22:30</p>
                                                <p className="player-epg-row epg-data">La Soirée des champions</p>
                                            </div>

                                        </div>
                                    </div>
                                    <div className="player-channel-status">
                                        <div className="player-ch-logos">
                                            <Fav className={'player-icons' + (isFav ? ' fav' : '')} />
                                            <Lock className="player-icons" />
                                        </div>
                                        <label className="player-ch-resolution">{resolution}</label>
                                    </div>

                                </div>
                            </div>

                        </div>
                        <BottomActions>
                            <Action label='Lock' Svg={Yellow} />
                            <Action label='Favories' Svg={Green} />
                            <Action label='Change Channel' Svg={ChangeCh} />
                        </BottomActions>
                    </>
                }
            </div>

        </>
    );
}