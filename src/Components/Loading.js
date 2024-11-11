import './Loading.css'
import LoadingGif from '../images/Gifs/LoadingGif.gif';


export default function Loading({loadInfo}) {

    return (
        <div className="loading-bar">
            <div className="loading-bar__inner">
                <img className='loading-gif' src={LoadingGif} alt='Loading...'></img>
                <div className="loading-label">{loadInfo}</div>
            </div>
        </div>
    );
}