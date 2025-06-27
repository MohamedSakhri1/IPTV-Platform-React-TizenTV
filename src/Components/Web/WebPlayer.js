import {useEffect, useRef, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import mpegts from "mpegts.js";
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

export function WebPlayer() {
    const videoRef = useRef(null);
    let player;
    const playlist = JSON.parse(sessionStorage.getItem('playlist'))
    const navigate = useNavigate()
    const location = useLocation();
    const [channel, setChannel] = useState(location.state.channel)
    const channelId = channel.stream_id;
    let url = playlist.host + '/live/' + playlist.username + '/' + playlist.password + '/' + channelId + '.ts';
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
        const responce = favChannel !== undefined;
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