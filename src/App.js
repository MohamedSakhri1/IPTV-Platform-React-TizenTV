
import Welcome from './pages/Welcome';
import Player from './Components/player'
import BackButtonHandler from './helpers/BackButton';
import { Route, HashRouter, Routes } from 'react-router-dom';
import {init} from '@noriginmedia/norigin-spatial-navigation';

import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import TvGroupes from './pages/tv/groupes';
import Layout from './helpers/layout';
import Playlists from './pages/Playlists';
import PlaylistForm from './pages/PlaylistForm';
import ChannelsMenu from './pages/tv/ChannelsMenu';
import Settings from './pages/Settings';
import { db } from './Database/db';
import Popup from './Components/Popup';

/* global tizen */
// Register the Red button to be recognized by your app
if (typeof tizen !== 'undefined') {
  tizen.tvinputdevice.registerKeyBatch(['ColorF0Red', 'ColorF1Green', 'ColorF2Yellow', 'ChannelUp', 'ChannelDown']);
  tizen.tvinputdevice.registerKeyBatch(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']);
}

init({
  // debug: true,
  // visualDebug:true,
});

export default function App()
{
  useEffect(() => {
    cleanner()
  }, [])

  return (
    <HashRouter>
      <BackgroundChanger>
      <BackButtonHandler/>
        <Routes>
          <Route path="/" element={<Welcome />} />

          <Route path='playlists' element={<Playlists />} />
          <Route path='add-playlist' element={<PlaylistForm />} />
          <Route path='/test' element={<Popup />} />


          <Route path="tv-player" element={<Player />} />
          <Route path="lyt" element={<Layout />} >
            <Route path="tv" element={<TvGroupes />} />
            <Route path='channels-menu' element={<ChannelsMenu />} />
            <Route path='settings' element={<Settings />} />
          </Route>

{/* Other routes 
            - playlists (  -- /playlists
              - add a playlist -- add
              - select/delete a playlist(id) -- show
              )

            --> within the same playlist id -- /playlists/:id/

            - tv ( -- /tv
              - groupes -- 
              - groupe channels -- :groupe-id
              + player (epg) -- /tv-player params(stream-id)
              )
            - films ( -- /films
              - groups --
              - film overview -- :film-id
              + film player (subtitels + AAC tracks) -- /films-player params(film-id)
              )
            - series ( -- series
              - groupes --
              - serie overview -- :series-id
              - serie season episodes -- :season-id
              + serie player (subtitels + AAC tracks), same as film -- /films-player params(episode-id)
              )
            - search -- /search
            - settings -- /settings
*/}
        </Routes>
      </BackgroundChanger>
    </HashRouter>
  );
}

const BackgroundChanger = ({ children }) => {
  const location = useLocation();

  React.useEffect(() => {
    document.body.style.backgroundColor = '#141218';
    document.body.style.backgroundAttachment = 'fixed';
    document.body.style.height = '100vh';
    document.body.style.width = '100vw';
    document.body.style.overflow = 'hidden';

    switch(location.pathname)
    {
      case '/' : document.body.style.backgroundImage = 'radial-gradient(circle at top left, rgba(36, 6, 74),rgba(21, 17, 33, 0) 40%), radial-gradient(circle at top right, #0669A1 -10%,rgba(21, 17, 33, 0) 40%), radial-gradient(circle at bottom, #5F0589 -100%,rgba(21, 17, 33, 0) 45%)';
      break;
      case '/tv-player' :  document.body.style.backgroundImage = 'none'
      break;
      default : document.body.style.backgroundImage = 'radial-gradient(circle at top left, rgba(36, 6, 74),rgba(21, 17, 33, 0) 60%)';
    }
  }, [location.pathname]);

  return <>{children}</>;
};

function cleanner() {
  /** cleaning groupes with no pin or lock */
  db.groupes.where({isLocked: 0, isPinned: 0}).delete()
}




/** CONSTANTS */
const EPG_REFRESH_PIRIOD_MINUTES = 24 * 60;
const STREAM_REFRESH_PIRIOD_MINUTES = 24 * 60;



