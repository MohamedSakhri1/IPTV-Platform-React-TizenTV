import React, { useEffect } from 'react';
import './Popup.css';
import Button from './Button';
import { FocusContext, useFocusable } from '@noriginmedia/norigin-spatial-navigation';

const Popup = ({ title = 'Title', message = 'message message message', onClose, closeLabel = 'Cancel', onConfirm , confirmLabel = 'OK', children}) => {

    const {ref, focusKey, focusSelf} = useFocusable({
        trackChildren:true,
        isFocusBoundary:true,
        focusBoundaryDirections: ['down', 'left', 'right', 'up'],

    });

    useEffect(() => {
        focusSelf();
    }, [focusSelf])

    return (
        <FocusContext.Provider value={focusKey}>
            <div className="popup-overlay" ref={ref}>
                <div className="popup-container">
                    <h2 className='popup-title'>{title}</h2>
                    <p className='popup-message'>{message}</p>
                    <form onSubmit={onConfirm}>
                        <div className='popup-inputs'>
                            {children}
                        </div>
                        <div className="popup-buttons">
                            <Button type='submit' content={confirmLabel} />
                            <Button type='action' content={closeLabel}  action={onClose}/>
                        </div>
                    </form>
                </div>
            </div>
        </FocusContext.Provider>
    );
};

export default Popup;
