import { ReactComponent as Pin } from "./../images/pin.svg";
import { ReactComponent as Locked } from "./../images/locked.svg";
import { ReactComponent as Favories } from "./../images/favorits.svg";
import { ReactComponent as Recent } from "./../images/lastWatched.svg";
import './Card.css';
import { useFocusable } from '@noriginmedia/norigin-spatial-navigation';
import { useNavigate} from "react-router-dom";


export default function Card({ isLocked = false, isPined = false, label = 'DEFAULT', categorieId = 0, playlist }) {

    const navigate = useNavigate();
    const focusKey = 'Groupes-' + label + categorieId;

    const handleClick = () => {
        console.log('Card clicked: ' + label + ', with id of: ' + categorieId);
        const dataToSend = {
            categorieId: categorieId,
            label: label,
            playlist: playlist,
            type: 'groupe',
        }
        sessionStorage.setItem('lastGroupeKey', focusKey);
        navigate('/lyt/channels-menu', { state: dataToSend });
    }

    const { ref, focused } = useFocusable({
        onEnterPress: () => handleClick(),
        onFocus: () => {
            if (ref.current) {
                ref.current.scrollIntoView({
                    block: 'center',
                    inline: 'nearest'
                });
            }
        },
        focusKey: focusKey
    });

    return (
        <div className={'card' + (focused ? ' focused' : '')} ref={ref} data-id={categorieId}>
            <div className={'label' + (focused ? ' focused' : '')}>{label}</div>
            <div className="icons">
                <Pin className={'icon' + (isPined ? ' active' : '')} />
                <Locked className={'icon locked' + (isLocked ? ' active' : '')} />
            </div>
        </div>
    );
}





export function FavoriesCard({ label = 'Fav DEFAULT', distination = '/', playlist})
{
    const navigate = useNavigate();
    const focusKey = 'Groupes-card-' + label;

    const handleClick = () => {
        console.log('Card clicked: ' + label + ', with destination of: ' + distination);
        const dataToSend = {
            label: label,
            playlist: playlist,
            type: 'fav',
        };
        sessionStorage.setItem('lastGroupeKey', focusKey);
        navigate(distination, { state: dataToSend });
    };

    const { ref, focused } = useFocusable({
        onEnterPress: () => handleClick(),
        onFocus: () => {
            if (ref.current) {
                ref.current.scrollIntoView({
                    block: 'center',
                    inline: 'nearest',
                });
            }
        },
        focusKey: focusKey,
    });

    return (
        <div className={'card ' + (focused ? ' focused-fav' : '')} ref={ref}>
            <div className={'label ' + (focused ? ' focused' : '')}>{label}</div>
            <div className="icons">
                <Favories className="icon active" />
            </div>
        </div>
    );
}
export function RecentCard({ label = 'Recent DEFAULT', distination = '/', playlist})
{
    const navigate = useNavigate();
    const focusKey = 'Groupes-card-' + label;

    const handleClick = () => {
        console.log('Card clicked: ' + label + ', with destination of: ' + distination);
        const dataToSend = {
            label: label,
            playlist: playlist,
            type: 'recent-watch'
        };
        sessionStorage.setItem('lastGroupeKey', focusKey);
        navigate(distination, { state: dataToSend });
    };

    const { ref, focused } = useFocusable({
        onEnterPress: () => handleClick(),
        onFocus: () => {
            if (ref.current) {
                ref.current.scrollIntoView({
                    block: 'center',
                    inline: 'nearest',
                });
            }
        },
        focusKey: focusKey,
    });

    return (
        <div className={'card ' + (focused ? ' focused-recent' : '')} ref={ref}>
            <div className={'label ' + (focused ? ' focused' : '')}>{label}</div>
            <div className="icons">
                <Recent className="icon active" />
            </div>
        </div>
    );
}
