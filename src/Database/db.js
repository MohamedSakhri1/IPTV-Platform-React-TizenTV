import Dexie from 'dexie';


export const db = new Dexie('galaxyDB');
db.version(5).stores({
  playlists: '++id, name, host, username, password, createdAt, expiredAt, maxConnection, isTrial', // Primary key and indexed props
  favorits: '++id, channelData, channelId, playlistId',
  recentlyWatched: '++id, channelData, channelId, playlistId, createdAt',
  groupes: '++id, groupeId, isPinned, isLocked, playlistId',
  password: '++id, password, enabled',
  epgCach: '++id, playlistId, epgChannelId, createdAt',
  streamCach: '++id, playlistId, categoryType, streams',
});






export async function addPlaylist(data)
{
    try {
        const id = await db.playlists.add({
            name: data.user_info.username, // Use username as the playlist name
            host: data.server_info.server_protocol+'://'+data.server_info.url+':'+data.server_info.port, // Use the server URL as the protocol://host:port
            username: data.user_info.username,
            password: data.user_info.password,
            createdAt: new Date(parseInt(data.user_info.created_at) * 1000).toLocaleString(), // Convert Unix timestamp to ISO format
            expiredAt: new Date(parseInt(data.user_info.exp_date) * 1000).toLocaleString(), // Convert Unix timestamp to ISO format
            maxConnection: parseInt(data.user_info.max_connections), // Convert max_connections to an integer
            isTrial: data.user_info.is_trial === "1" // Convert "0"/"1" to boolean
        });
        console.log(`Playlist added with id: ${id}`);
        return id;
    } catch (error) {
        console.error('Failed to add playlist:', error);
    }
} // add here the file structure 'wgt-private/Playlists/[id-playlistname]/{films, series, tv}'

export async function addToFav(channel, playlistId) {
    try{
        const id = await db.favorits.add({
            channelData: JSON.stringify(channel),
            channelId: channel.stream_id,
            playlistId: playlistId
            });
        console.log(`Channel added to favorites with id: ${id}`);
        return id;
    } catch (error) {
        console.error('Failed to add channel to favorites:', error);
    }
}

export async function deleteFromFav(id) {
    try {
        await db.favorits.where('id').equals(id).delete();
        console.log(`Channel deleted from favorites with id: ${id}`);
    } catch (error) {
        console.error('Failed to delete channel from favorites:', error);
    }
}

// pour la 1er fois, fetching from Xtream Api
export async function importEPG(playlistId) {
    const thisPlaylist = await db.playlists.get(playlistId)
    // creating the file epg.xml in '[id-playlistname]/tv'
    // adding a line in 'wgt-private/metadata/epg-statues.json' -> status de chaque epg des playlists {playlist-id, created-at, updated-at}
    

}

