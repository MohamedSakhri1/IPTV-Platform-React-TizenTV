import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Popup from '../Components/Popup';
/* global tizen */


// New Component for handling back button logic
export default function BackButtonHandler() {
  const [showPopup, setPopup] = useState(false)

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleBackButton = (event) => {
      if (event.keyCode === 10009 || event.keyCode === 27) {
        switch (location.pathname) {
          case '/':
            // If on the home page, exit the app
            try {
              setPopup(true)
            } catch (e) {
              console.error('Error exiting the app:', e);
            }
            break;
            case '/playlists':
            try {
              const canQuit = sessionStorage.getItem('PlaylistLoadDone');
              console.log('MEE 3 ' + canQuit)
              if (canQuit === 'true')
                setPopup(true)
            } catch (e) {
              console.error('Error exiting the app:', e);
            }
            break;
          case '/lyt/tv':
            sessionStorage.setItem('lastGroupeKey', null)
            navigate('/playlists'); // Navigate to home or another specific route
            break;
          // Add more cases as needed
          default:
            // Default action for all other routes
            navigate(-1); // Navigate back in history
            break;
        }
      }
    };

    document.addEventListener('keydown', handleBackButton);

    return () => {
      document.removeEventListener('keydown', handleBackButton);
    };
  }, [navigate, location.pathname]);

  return (
    <> {
      showPopup 
      && <Popup 
        title='Exit' 
        message='Do you realy want to exit Galaxy TV ?' 
        closeLabel='No' 
        confirmLabel='Yes'
        onConfirm={() => { tizen.application.getCurrentApplication().exit(); }}
        onClose={() => {setPopup(false); window.location.reload()}}
        />
    }
    </>
  ); // This component doesn't render any UI
}