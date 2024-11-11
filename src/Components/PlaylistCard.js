import { useFocusable, pause, resume } from '@noriginmedia/norigin-spatial-navigation';
import {ReactComponent as Plus} from '../images/plus.svg';
import './PlaylistCard.css'
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Loading from './Loading';
import axios from 'axios';

// Function to fetch and organize data
async function fetchAndOrganizeData(setLoadStatus, loadinfo) {
    try {
        setLoadStatus('loading'); // Set loading status to 'loading'
        pause();
        const playlist = JSON.parse(sessionStorage.getItem('playlist'));

        // Fetch all groups
        loadinfo('Loading All TV Groupes')
        const groupsResponse = await axios.get(`${playlist.host}/player_api.php?username=${playlist.username}&password=${playlist.password}&action=get_live_categories`);
        const groups = groupsResponse.data;

        // Fetch all channels
        loadinfo('Loading All TV Channels')
        const channelsResponse = await axios.get(`${playlist.host}/player_api.php?username=${playlist.username}&password=${playlist.password}&action=get_live_streams`);
        const channels = channelsResponse.data;

        // Organize channels by groupe_id
        const channelsByGroup = groups.reduce((acc, group) => {
            acc[group.category_id] = channels.filter(channel => channel.category_id === group.category_id);
            return acc;
        }, {});

        // Store in sessionStorage
        sessionStorage.setItem('tvGroups', JSON.stringify(groups));
        sessionStorage.setItem('tvChannelsByGroup', JSON.stringify(channelsByGroup));

        console.log('Groups and channels fetched and organized in sessionStorage.');
        setLoadStatus('finished'); // Set loading status to 'finished'
        resume();
    } catch (error) {
        console.error('Error fetching data:', error);
        setLoadStatus('error'); // Set loading status to 'error' if fetching fails
    }
}





export default function PlaylistCard({playlist}) 
{

    const [isSelected, setIsSelected] = useState(false);
    const [loadStatus, setLoadStatus] = useState('none'); // Track the loading status
    const [loadInfo, setLoadInfo] = useState('undefined'); // Track the phase of loading
    const navigate = useNavigate();
    const handleSelect = () => {
        setIsSelected(true);
        sessionStorage.setItem('playlist', JSON.stringify(playlist))
        fetchAndOrganizeData(setLoadStatus, setLoadInfo).then(() => {
            navigate('/lyt/tv') 
        })
    }


    const { ref, focused, focusSelf } = useFocusable({
        onEnterPress: () => handleSelect(),
        onFocus: () => {
            if (ref.current) {
                ref.current.focus();
                ref.current.scrollIntoView({
                    // behavior: 'smooth',
                    block: 'nearest',
                    inline: 'center'
                });
            }
        }
    });

    useEffect( () => {
        focusSelf()
    }, [focusSelf])



    
    return (

        <>
            {loadStatus === 'loading' && (
                <Loading loadInfo={loadInfo}/>
            )}
            <div className={"playlist-card"+ (focused ? ' focused' : '')} ref={ref} data-id={playlist?.id}>
                <div className={'playlist-card-content' + (focused ? ' focused' : '')}>
                    <div className="playlist-card_header">
                        <h2 className="playlist-card_title">{playlist?.name}</h2>
                    </div>
                    <div>
                        <p className={"playlist-card_items" + (focused ? ' focused' : '')}>Status : {playlist?.status}</p>
                        <p className={"playlist-card_items" + (focused ? ' focused' : '')} >Creation : {playlist?.createdAt}</p>
                        <p className={"playlist-card_items" + (focused ? ' focused' : '')} >Expiration : {playlist?.expiredAt}</p>
                        <p className={"playlist-card_items" + (focused ? ' focused' : '')} >Connections : {playlist?.currentConnection +'/'+ playlist?.maxConnection}</p>
                        <p className={"playlist-card_items" + (focused ? ' focused' : '')} >Is Trial : {playlist?.isTrial === '1' ? 'true' : 'false'}</p>
                    </div>
                </div>
                <div className='playlist-status'>
                    {isSelected && <h2 className='is-selected'>SELECTED</h2>}
                </div>
            </div>
        </>


    )
}



export function PlaylistAdd() 
{
    const navigate = useNavigate()

    function handleClick() {
        console.log('Button - ADD - clicked');
        navigate('/add-playlist')
    }


    const { ref, focused } = useFocusable({
        onEnterPress: () => handleClick(),
        onFocus: () => {
            if (ref.current) {
                ref.current.scrollIntoView({
                    // behavior: 'smooth',
                    block: 'nearest',
                    inline: 'center'
                });
            }
        }
        
    });
    
    return (

        <div className="playlist-card" ref={ref}>
            <div className={'playlist-add-content' + (focused ? ' focused' : '')}>
                <div>
                    <Plus className='plus-svg'/>
                </div>
                <div className="playlist-card_header">
                    <h2 className="playlist-card_title">Add Playlist</h2>
                </div>
            </div>
        </div>

    )
}