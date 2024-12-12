import { ReactComponent as Playlists } from "./../images/playlists.svg";
import { ReactComponent as Tv } from "./../images/liveStreams.svg";
import { ReactComponent as Films } from "./../images/films.svg";
import { ReactComponent as Series } from "./../images/series.svg";
import { ReactComponent as Settings } from "./../images/settings.svg";
import './SideBar.css';
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";  // Import useLocation
import { useFocusable, FocusContext, setFocus } from '@noriginmedia/norigin-spatial-navigation';

function Selection({ label, Svg, id, isActive }) {
    const navigate = useNavigate();
    
    const handleClick = (id) => {
        isActive.setActive(() => id);
        // Navigate to the corresponding page
        switch(id) {
            case 'playlists':
                navigate('/playlists');  // /layout/playlists
                break;
            case 'tv':
                navigate('/lyt/tv'); // true
                break;
            case 'films':
                navigate('/lyt/films'); //  /playlists/:id/layout/films
                break;
            case 'series':
                navigate('/lyt/series'); // /playlists/:id/layout/series
                break;
            case 'settings':
                navigate('/lyt/settings'); //  /playlists/:id/layout/films  
                break;
            default:
                break;
        }
        setFocus('main-page-key');  // Set focus to main content after navigation
    };

    const { ref, focused } = useFocusable({
        onEnterPress: () => handleClick(id)
    });

    return (
        <div
            ref={ref}
            className={
                'side-row' + 
                (focused ? ' focused' : '') + 
                (isActive.active === id ? ' active' : '')  // Ensure strict equality
            }
            id={id}
            onClick={() => handleClick(id)}  // Ensure onClick also works
        >
            <Svg className="icons" />
            <span className="icon-label">{label}</span>
        </div>
    );
}

export default function SideBar() {
    const [active, setActive] = useState(undefined);
    
    const location = useLocation();  // Get the current route

    useEffect(() => {
        // Set active state based on current route
        switch (location.pathname) {
            case '/playlists':
                setActive('playlists');
                break;
            case '/lyt/channels-menu':
            case '/lyt/tv':
                setActive('tv');
                break;
            case '/lyt/films':
                setActive('films');
                break;
            case '/lyt/series':
                setActive('series');
                break;
            case '/lyt/settings':
                setActive('settings');
                break;
            default:
                setActive(undefined);  // Handle any other routes
                break;
        }
    }, [location.pathname]);  // Update active state on route change



    const { ref, focusKey, focusSelf, hasFocusedChild } = useFocusable({ trackChildren: true, focusKey:'sidebar-key' });
    useEffect(() => {
        focusSelf();  // Ensure the sidebar receives focus when the component is loaded
    }, []);

    return (
        <FocusContext.Provider value={focusKey}>
            <div className={"sidebar" + (hasFocusedChild ? ' focused' : '')} ref={ref}>
                <Selection id='playlists' Svg={Playlists} label='Playlists' isActive={{active, setActive}} />
                <div className="sidebar-menu">
                    <Selection id='tv' Svg={Tv} label='Live TV' isActive={{active, setActive}} />
                    <Selection id='films' Svg={Films} label='Films' isActive={{active, setActive}} />
                    <Selection id='series' Svg={Series} label='Series' isActive={{active, setActive}} />
                </div>
                <Selection id='settings' Svg={Settings} label='Settings' isActive={{active, setActive}} />
            </div>
        </FocusContext.Provider>
    );
}
