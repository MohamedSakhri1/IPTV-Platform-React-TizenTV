import './Button.css';
import { useNavigate } from 'react-router-dom';
import { useFocusable } from '@noriginmedia/norigin-spatial-navigation';

export default function Button({ content = 'Hi! I am a button', href = '#', type = 'submit', action, focusable = true }) {
    const navigate = useNavigate();

    function makeAction() {
        if (typeof action === 'function') {
            action(); // Call the action function if provided
        }
    }

    const { ref, focused } = useFocusable({
        focusable: focusable,
        onEnterPress: () => {
            if (type === 'href') {
                navigate(href);
            } else if (type === 'submit') {
                // Trigger form submission by clicking the button programmatically
                ref.current?.click(); // This will trigger the form's onSubmit event
                console.log('Form submission triggered by Button component.');
            } else {
                makeAction();
            }
        },
    });

    return (
        <button
            ref={ref}
            className={'normal-button' + (focused ? ' focused' : '')}
            type={type} // Set button type (submit by default)
            onClick={type === 'submit' ? makeAction : undefined}
        >
            {content}
        </button>
    );
}
