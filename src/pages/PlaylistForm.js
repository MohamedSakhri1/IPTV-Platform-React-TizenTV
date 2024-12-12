import { useFocusable, FocusContext } from "@noriginmedia/norigin-spatial-navigation";
import { useEffect, useState } from "react";
import './PlaylistForm.css';
import { db } from '../Database/db';
import WideButton from "../Components/WideButton";
import Button from "../Components/Button";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export function InputField({ type, id, placeholder, autoComplete, value, onChange, focusable = true, inputMode = '' ,  maxLength = '' , style = undefined, pattern = undefined }) {
    const { ref, focused } = useFocusable({
        onEnterPress: () => {
            if (ref.current) {
                ref.current.focus();
            }
        },
        onBlur: () => {
            if (ref.current) {
                ref.current.blur();
                }
        },
        focusable: focusable,
    });

    return (
        <input
            className={"xtream-form-input" + (focused ? ' focused' : '')}
            type={type}
            id={id}
            placeholder={placeholder}
            ref={ref}
            onFocus={(e) => e.target.focus()}
            autoComplete={autoComplete}
            value={value}  // Controlled input
            onChange={onChange}  // Handle input change
            inputMode={inputMode}
            maxLength={maxLength}
            style={style}
            pattern={pattern}
        />
    );
}



function XtreamForm({ onSubmit }) 
{

    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [host, setHost] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        /** SUBMIT LOGIC : ADD TO PLAYLISTS IN THE IndexedDb */

        // Save the record to IndexedDB
        try {
            await AddXtreamPlaylist(name, username, password, host)
            alert('Form data saved:', name);
            navigate('/playlists')
        } catch (error) {
            alert('Failed to save form data:', error);
        }



        onSubmit({ name, username, password, host });
    };

    return (
        <form className="xtream-form" onSubmit={handleSubmit}>
            <label className="xtream-form-label" htmlFor="name">Playlist Name</label><br />
            <InputField
                type="text"
                id="name"
                placeholder="  Enter Playlist Name"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            /><br />
            <label className="xtream-form-label" htmlFor="username">Username</label><br />
            <InputField
                type="text"
                id="username"
                placeholder="  Enter Username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            /><br />
            <label className="xtream-form-label" htmlFor="password">Password</label><br />
            <InputField
                type="text"
                id="password"
                placeholder="  Enter your Password here"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            /><br />
            <label className="xtream-form-label" htmlFor="host">Server Address</label><br />
            <InputField
                type="text"
                id="host"
                placeholder="  Enter Server Address"
                autoComplete="url"
                value={host}
                onChange={(e) => setHost(e.target.value)}
            /><br />
            <Button content='Submit' className='form-button' type="submit" />
        </form>
    );
}

function M3uForm({ onSubmit })
{

    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [host, setHost] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        /** SUBMIT LOGIC : ADD TO PLAYLISTS IN THE IndexedDb */
        
        // Save the record to IndexedDB
        try {
            await AddM3UPlaylist(host, name)
            alert('Form data saved:', name);
            navigate('/playlists')
        } catch (error) {
            alert('Failed to save form data: ', error);
        }



        onSubmit({ name, host });
    };

    return (
        <form className="xtream-form" onSubmit={handleSubmit}>
            <label className="xtream-form-label" htmlFor="name">Playlist Name</label><br />
            <InputField
                type="text"
                id="name"
                placeholder="  Enter Playlist Name"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            /><br />
            <label className="xtream-form-label" htmlFor="host">Link To The Playlist</label><br />
            <InputField
                type='text'
                id='host'
                placeholder="  Enter your M3U Link here"
                autoComplete="url"
                value={host}
                onChange={(e) => setHost(e.target.value)}
            /><br />
            <Button content='Submit' className='form-button' type="submit" />
        </form>
    );
}



export default function PlaylistForm() {
    const [selectedForm, setSelectedForm] = useState('XtreamForm'); // State to manage which form is displayed

    const { ref, focusKey, focusSelf } = useFocusable({
        trackChildren: true,
        focusKey: 'main-page-key',
        focusBoundaryDirections: ['up', 'down'],
        focusable: false,
    });

    useEffect(() => {
        focusSelf();  // Ensure focus is set to the grid when this page loads
    }, [focusSelf]);

    const [thisMoment, setThisMoment] = useState(new Date().toLocaleString());

    useEffect(() => {
        const interval = setInterval(() => {
            setThisMoment(new Date().toLocaleString());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleFormSubmit = (data) => {
        alert('Form data:', data);
        // Add your form submission logic here, for example, saving to IndexedDB
    };

    return (
        <FocusContext.Provider value={focusKey}>
            <div className="playlist-page-wrapper">
                <div className="playlist-page-add">
                    <h1 className="playlist-page-header">Add New Playlist</h1>
                    <p className="current-date">{thisMoment}</p>
                </div>
                <div className="playlists-container-add" ref={ref}>
                    <div className="add-choises">
                        <WideButton content='Xtream Code Information' action={() => setSelectedForm('XtreamForm')} id='1'/>
                        <WideButton content='M3U Playlist Link' action={() => setSelectedForm('M3uForm')} id='2'/>
                    </div>
                    <div className="add-form">
                        {selectedForm === 'XtreamForm' ? <XtreamForm onSubmit={handleFormSubmit} /> : ''}
                        {selectedForm === 'M3uForm' ? <M3uForm onSubmit={handleFormSubmit} /> : ''}
                    </div>
                </div>
            </div>
        </FocusContext.Provider>
    );
}



async function AddXtreamPlaylist(name, username, password , host) {

    const responce = await axios.get(host + '/player_api.php?username=' + username + '&password=' + password );
    const data = responce.data;

    await db.playlists.add( { 
        name: name,
        host: host,
        username: username, 
        password: password,
        expiredAt: new Date(parseInt(data.user_info.exp_date) * 1000).toLocaleString(),
        createdAt: new Date(parseInt(data.user_info.created_at) * 1000).toLocaleString(),
        maxConnection: data.user_info.max_connections,
        currentConnection: data.user_info.active_cons,
        status: data.user_info.status,
        isTrial: data.user_info.isTrial, 
     });

}

async function AddM3UPlaylist(url, name) {
    const urlObj = new URL(url); // Create a URL object
    const host = urlObj.origin;
    // Extract query parameters
    const params = new URLSearchParams(urlObj.search);
    const username = params.get('username'); // e.g., 'butlerearl@yahoo.com'
    const password = params.get('password'); // e.g., 'NK9asfznpk'

    const responce = await axios.get(host + '/player_api.php?username=' + username + '&password=' + password + '&action=user_info');
    const data = responce.data;


    await db.playlists.add( { 
        name: name,
        host: host,
        username: username, 
        password: password,
        expiredAt: new Date(parseInt(data.user_info.exp_date) * 1000).toLocaleString(),
        createdAt: new Date(parseInt(data.user_info.created_at) * 1000).toLocaleString(),
        maxConnection: data.user_info.max_connections,
        currentConnection: data.user_info.active_cons,
        status: data.user_info.status,
        isTrial: data.user_info.isTrial, 
     });
}
