import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate} from "react-router-dom";
import mpegts from "mpegts.js";
import { ReactComponent as Logo} from '../images/ChannelImage.svg';
import { ReactComponent as Fav} from '../images/favorits.svg';
import { ReactComponent as Lock} from '../images/locked.svg';
import { ReactComponent as Back} from '../images/X.svg';
import { ReactComponent as Audio} from '../images/audio.svg';
import { ReactComponent as Subtitle} from '../images/subtitels.svg';
import { ReactComponent as Home} from '../images/Home.svg';
import { ReactComponent as Green } from '../images/remote actions/green.svg';
import { ReactComponent as Yellow } from '../images/remote actions/yellow.svg';
import { ReactComponent as ChangeCh } from '../images/remote actions/ChUpDown.svg';

import './player.css';
import BottomActions from "./BottomActions";
import Action from "./Action";
import PlayerAction from "./PlayerAction";
import { addToFav, db, deleteFromFav } from "../Database/db";
/* global webapis */

export default function TvPlayer() {

    return (
        <>
        {
            (window.webapis && window.webapis.avplay)
            ? <SamsungPlayer />
            : <LivePlayer />
        }
            
        </>
    );
}





export function SamsungPlayer() {
    const playlist = JSON.parse(sessionStorage.getItem('playlist'));

    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const timeoutRef = useRef(null); // Reference to store the timeout ID

    const location = useLocation();
    
    var channel = location.state.channel;
    const [CH, setCH] = useState(channel);
    const channelId = channel.stream_id;
    var url = playlist.host + '/live/' + playlist.username + '/' + playlist.password + '/' + channelId + '.ts';
    var nextCh = channel;
    var prevCh = channel;
    const thisGroupe = JSON.parse(sessionStorage.getItem('thisGroupe'))

    const [bufferCount, setBufferCount] = useState(0);
    const [buffering, setBuffering] = useState(false);
    const [LoadFail, setLoadFail] = useState(false);

    console.log(channelId);
    
    
    
    var objElem
    const initializePlayer = () =>
    {
        if (window.webapis && window.webapis.avplay) {
            
            try {
                objElem = document.createElement('object');
                objElem.type = 'application/avplayer';
                objElem.style.left = 0 + 'px';
                objElem.style.top = 0 + 'px';
                objElem.style.width = 100 + 'vw';
                objElem.style.height = 100 + 'vh';
                document.body.appendChild(objElem);
                // Open the media file for AVPlay
                webapis.avplay.open(url);

                // Set player display area to fit the screen or desired area
                webapis.avplay.setDisplayRect(0, 0, 1920, 1080); // Fullscreen
                webapis.avplay.setDisplayMethod('PLAYER_DISPLAY_MODE_FULL_SCREEN'); // _LETTER_BOX

                // Prepare the player asynchronously and start playback
                webapis.avplay.prepareAsync(() => {
                    console.log('Player prepared successfully');
                    webapis.avplay.play();
                }, (error) => {
                    setLoadFail(true)
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
            if (window.webapis !== undefined && window.webapis.avplay) {
                webapis.avplay.stop();
                webapis.avplay.close();
            }
        }
    }, [])

    /** NAIBOUR CHANNELS */

    async function naibourChannels() {
        console.log(channel);
        const groupeLength = thisGroupe.length
        console.log(thisGroupe)
    
        // Update nextCh and prevCh based on the current channel index
        if (channel.index === groupeLength - 1) {
            nextCh = {...thisGroupe[0], index: 0 }; // First channel
            prevCh = { ...thisGroupe[channel.index - 1], index: (channel.index - 1) };
        } else if (channel.index === 0) {
            nextCh = { ...thisGroupe[channel.index + 1], index: (channel.index + 1) };
            prevCh = { ...thisGroupe[groupeLength - 1], index: (groupeLength - 1) }; // Last channel
        } else {
            nextCh = { ...thisGroupe[channel.index + 1],  index: (channel.index + 1) }
    
            prevCh = { ...thisGroupe[channel.index - 1], index: (channel.index - 1) };
        }
    }

    /** HANDLE CHANNEL CHANGE */
    const handleChannelChange = (channelPosition) => {
        var ch;
        setBuffering(false)
        setLoadFail(false)
        naibourChannels();
        if (channelPosition === 'next')
            ch = nextCh;
        else if (channelPosition === 'prev')
            ch = prevCh;
        // changing the stream
        webapis.avplay.stop();
        webapis.avplay.close();
        url = playlist.host + '/live/' + playlist.username + '/' + playlist.password + '/' + ch.stream_id + '.ts'
        // Update the current channel
        channel = ch;
        setCH(() => ch);
        webapis.avplay.open(url)
        webapis.avplay.prepareAsync(() => {
            console.log('Player prepared successfully');
            webapis.avplay.play();
        }, (error) => {
            setLoadFail(true)
            // alert('Error during player preparation:', error);
        });
        sessionStorage.setItem('lastChannelKey', 'wide-button-' + ch.stream_id)
    }

    useEffect(() => {
        const handleKeyDown = async (event) => {
            switch (event.keyCode) {
                case 10009: // back button
                case 27:
                    document.body.removeChild(objElem)
                    break;
                case 427: // channel up
                    handleChannelChange('next');
                    break;
                case 428: // channel down
                    handleChannelChange('prev');
                    break;
                 case 404: // green button
                    const favChannel = await db.favorits.get({'playlistId': playlist.id, 'channelId': channel.stream_id});
                    if (favChannel === undefined){
                        addToFav(channel, playlist.id)
                        setFav(true)
                    } else {
                        deleteFromFav(favChannel.id)
                        sessionStorage.setItem('favDeleted', 'true')
                        setFav(false)
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
                setBuffering(true);
            },
            onbufferingprogress: function(percent) {
                console.log("Buffering progress: " + percent);
                setBufferCount(percent); // Update buffering progress
            },
            onbufferingcomplete: function() {
                console.log("Buffering complete.");
                setBuffering(false);
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
    const [thisMoment, setThisMoment] = useState(new Date().toLocaleString());

    useEffect(() => {
        const interval = setInterval(() => {
            setThisMoment(new Date().toLocaleString(undefined, {hour12: true, timeStyle: 'short'}));
        }, 1000);
        return () => clearInterval(interval);
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
                            const extra_info = JSON.parse(track.extra_info)
                            const res = extra_info.Width + 'x' + extra_info.Height;
                            setResolution(res);
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
        const intervalId = setInterval(() => {
            if (window.webapis && window.webapis.avplay) {
                const playerState = webapis.avplay.getState();
                if (["READY", "PLAYING", "PAUSED"].includes(playerState)) {
                    // If the state is correct, fetch the resolution
                    fetchResolution();
                    clearInterval(intervalId); // Stop polling
                }
            } else {
                alert("AVPlay API is not available.");
                clearInterval(intervalId); // Stop polling if the API is not available
            }
        }, 500); // Check every 500ms

        // Cleanup interval on component unmount
        return () => clearInterval(intervalId);
    };

    // Start polling for the correct state
    const cleanup = waitForCorrectState();

    // Cleanup interval on component unmount
    return cleanup;
}, [CH]);




    /** HANDLING ACTIONS */
    function handleHide() {
        setIsMenuVisible(false)
        console.log('hide button clicked.')
    }

    /** Handle favorits -Green Button- */
    const [isFav, setFav] = useState(false)
    const favState = async () => {
        const favChannel = await db.favorits.get({'playlistId': playlist.id, 'channelId': channel.stream_id})
        const responce = favChannel === undefined ? false : true;
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
            <div className={"player-shadow" + (isMenuVisible || buffering || LoadFail ? '' : ' hidden')} >
                { buffering && 
                    <h1 className="buffer-count">{bufferCount}%</h1>
                }
                { LoadFail &&
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
                                    <p className="player-time" >{thisMoment}</p>
                                </div>
                            </div>


                            <div className="player-footer">
                                <div className="player-footer-wrapper">
                                    <div className="player-channel-logo">
                                        <ChannelLogo channel={CH}/>
                                    </div>
                                    <div className="player-channel-info">
                                        <label className="player-ch-name">{CH.name}</label>
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










export function LivePlayer() {
    const videoRef = useRef(null);
    let player;
    const playlist = JSON.parse(sessionStorage.getItem('playlist'))
    const navigate = useNavigate()
    const location = useLocation();
    const [channel, setChannel] = useState(location.state.channel)
    const channelId = channel.stream_id;
    var url = playlist.host + '/live/' + playlist.username + '/' + playlist.password + '/' + channelId + '.ts'
    console.log(channel)
    const [isMenuVisible, setIsMenuVisible] = useState(true)
    const timeoutRef = useRef(null); // Reference to store the timeout ID
    var nextCh = channel
    var prevCh = channel;
    const thisGroupe = JSON.parse(sessionStorage.getItem('thisGroupe'))

    const initializePlayer = () => {
        const videoElement = videoRef.current;

        if (mpegts.getFeatureList().mseLivePlayback && videoElement) {
            const mediaDataSource = {
                type: 'mpegts', 
                isLive: true,
                url: url, // Your stream URL
                cors: true,
            };

            const config = {
                stashInitialSize: (1024 * 1024) * 3, // 2MB initial buffer
                // liveBufferLatencyChasing: true,
                // liveBufferLatencyMaxLatency: 1 * 60, // 5mins latency max
                // liveSync: true,
                // liveSyncMaxLatency: 1 * 60, // 5mins
                // liveSyncTargetLatency: 2.5 * 60, // Target latency 30 seconds
                autoCleanupSourceBuffer: true,
                seekType: 'range',
                accurateSeek: true,
            };

            try {
                player = mpegts.createPlayer(mediaDataSource, config);

                player.attachMediaElement(videoElement);

                player.load();
                videoElement.addEventListener('canplay', () => {
                    player.play().catch(err => {
                        alert('Playback start error:', err);
                    })
                });

                player.on(mpegts.Events.ERROR, (type, details) => {
                    console.error('Playback error detected:', type, details);
                });

            } catch (err) {
                console.error("Error initializing player:", err);
            }
        } else {
            console.error('MSE Live Playback is not supported in this browser.');
        }
    };

    const handleReplay = () => {
        if (player) {
            player.unload();
            player.load();
            player.play();
        }
    };

    /** Handle favorits -Green Button- */
    const [isFav, setFav] = useState(false)
    const favState = async () => {
        const favChannel = await db.favorits.get({'playlistId': playlist.id, 'channelId': channel.stream_id})
        const responce = favChannel === undefined ? false : true;
        setFav(responce);
        console.log('fav status: '+ responce)
        return responce
    }

    useEffect(() => {
        initializePlayer();
        favState();

        computeChannels();

        const videoElement = videoRef.current;
        if (videoElement) {
            videoElement.addEventListener('ended', handleReplay);
        }

        return () => {
            if (player) {
                player.unload();
                player.destroy();
                player.detachMediaElement();
            }
            if (videoElement) {
                videoElement.removeEventListener('ended', handleReplay);
            }
        };
    }, [url, channel]);


    /** TIME */
    const [thisMoment, setThisMoment] = useState(new Date().toLocaleString());
    useEffect(() => {
        const interval = setInterval(() => {
            setThisMoment(new Date().toLocaleString(undefined, {hour12: true, timeStyle: 'short'}));
        }, 1000);
        return () => clearInterval(interval);
    }, []);


    
    /** Update channels and navigation */
    function computeChannels() {
        const groupeLength = thisGroupe.length
        
        // Update nextCh and prevCh based on the current channel index
        if (channel.index === groupeLength - 1) {
            nextCh = {...thisGroupe[0], index: 0 }; // First channel
            prevCh = { ...thisGroupe[channel.index - 1], index: (channel.index - 1) };
        } else if (channel.index === 0) {
            nextCh = { ...thisGroupe[channel.index + 1], index: (channel.index + 1) };
            prevCh = { ...thisGroupe[groupeLength - 1], index: (groupeLength - 1) }; // Last channel
        } else {
            nextCh = { ...thisGroupe[channel.index + 1],  index: (channel.index + 1) }
            
            prevCh = { ...thisGroupe[channel.index - 1], index: (channel.index - 1) };
        }
        
        console.log('next : ' + nextCh.index + "\nprev : " + prevCh.index);
    }
    
    
    /** KEYDOWN EVENT */
    useEffect( () => {
        const handleKeyDown = async (event) => {
            
            switch (event.keyCode) {
                case 13:  // Enter
                break;
                case 38: // arrow up
                    console.log('arrow up - streamid: ' + prevCh.stream_id)
                    if(prevCh.stream_id)
                        sessionStorage.setItem('lastChannelKey', 'wide-button-' + prevCh.stream_id)
                    setChannel(prevCh)
                    url = playlist.host + '/live/' + playlist.username + '/' + playlist.password + '/' + nextCh.stream_id + '.ts'

                    break;
                case 40: // arrow down
                    setChannel(nextCh)
                    if(nextCh.stream_id)
                        sessionStorage.setItem('lastChannelKey', 'wide-button-' + nextCh.stream_id)
                    url = playlist.host + '/live/' + playlist.username + '/' + playlist.password + '/' + nextCh.stream_id + '.ts'
                    break;
                case 71: // g button
                    const favChannel = await db.favorits.get({'playlistId': playlist.id, 'channelId': channel.stream_id});
                    if (favChannel === undefined){
                        addToFav(channel, playlist.id)
                        setFav(true)
                    } else {
                        deleteFromFav(favChannel.id)
                        sessionStorage.setItem('favDeleted', 'true')
                        setFav(false)
                    }break;
                default:
                    console.log('default buttton');
                    break;
                }
            }
            computeChannels()     
        document.addEventListener('keydown', handleKeyDown)

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [ channel, url]); // Add dependencies to re-run effect when any of these changes


    /** RESOLUTION */
    const [resolution, setResolution] = useState('N/A');
    useEffect(() => {
        const videoElement = videoRef.current;
        

        const updateVideoResolution = () => {
            if (videoElement) {
                const width = videoElement.videoWidth;
                const height = videoElement.videoHeight;
                setResolution(`${width}x${height}`);
            }
        };

        // Listen for the loadedmetadata event
        videoElement.addEventListener('loadedmetadata', updateVideoResolution);

        // Cleanup event listeners on component unmount
        return () => {
            videoElement.removeEventListener('loadedmetadata', updateVideoResolution);
        };
    }, []);


    /** HANDLING ACTIONS */
    function handleHide()
    {
        setIsMenuVisible(false)
        console.log('hide button clicked.')
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
        const handleKeyPress = () => {
            console.log("Key pressed, restarting timeout.");
            setIsMenuVisible(true); // Show the menu
            startHideMenuTimeout(); // Restart the timeout
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
            <video ref={videoRef} style={{ width: '100%' }} height='100%' controls autoPlay ></video>




                <div className={"player-shadow" + (isMenuVisible ? '' : ' hidden')} >
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
                                    <p className="player-time" >{thisMoment}</p>
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
                                            <Lock className={"player-icons"} />
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



export function ChannelLogo({ channel }) {
    const [imageExists, setImageExists] = useState(false);

    useEffect(() => {
        if (channel.stream_icon) {
            // Create a new Image object to check if the image exists
            const img = new Image();
            img.src = channel.stream_icon;
            
            // Set up event handlers for loading success and error
            img.onload = () => setImageExists(true);  // Image loaded successfully
            img.onerror = () => setImageExists(false); // Error loading image
        } else {
            setImageExists(false);
        }
    }, [channel.stream_icon]);

    return (
        <div>
            {imageExists ? (
                <img 
                    src={channel.stream_icon} 
                    style={{height: '256px', width: '256px', objectFit: 'contain' }} 
                    alt="Channel Logo"
                />
            ) : (
                <Logo />
            )}
        </div>
    );
}