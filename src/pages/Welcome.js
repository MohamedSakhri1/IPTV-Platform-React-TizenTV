

import './Welcome.css'
import MyButton from '../Components/Button';
import logo from '../images/GalaxyIcon.svg';
import { useEffect } from 'react';
import { useFocusable, FocusContext } from '@noriginmedia/norigin-spatial-navigation';


export default function Welcome()
{


  const { ref, focusKey,focusSelf } = useFocusable({ trackChildren: true });

  useEffect(() => {
    focusSelf();
    }, [focusSelf]);
    

    return (
        <FocusContext.Provider value={focusKey}>
        <div ref={ref}>
          <img
              className="Logo"
              src={logo}
              alt="App logo"
            />
            <h1>
              Welcome to <strong>Galaxy TV</strong>
            </h1>
            <h4>
              Your streaming platform of all your IPTVs playlists completely for free
            </h4>
            <div style={{'marginTop': 'min(145px, 5rem)'}}>
              <MyButton content='Select a playlist' href='/playlists' type='href'/>
            </div>
            <h5>Made by Mohamed Sakhri 2024</h5>
        </div>
            
        </FocusContext.Provider>
    );
}