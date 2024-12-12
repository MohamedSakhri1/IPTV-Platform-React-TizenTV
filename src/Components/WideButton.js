import './WideButton.css';
import { useFocusable } from '@noriginmedia/norigin-spatial-navigation';

export default function WideButton({ content = 'Hi! I am a Wide button', action , id}) 
{



    const { ref, focused } = useFocusable({
        onEnterPress: action, // Trigger the action on "Enter"
        onFocus: () => {
            if (ref.current) {
                ref.current.focus();
                ref.current.scrollIntoView({
                    // behavior: 'smooth',
                    block: 'center',
                    inline: 'nearest'
                });
            }
        },
        focusKey: 'wide-button-' + id
    });

    return (
        <div className="wide-button-container" ref={ref}>
            <button
                className={"wide-button" + (focused ? ' focused' : '')}
                onClick={action} // Also trigger action on click
            >
                {content}
            </button>
        </div>
    );
}
