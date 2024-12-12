import React from 'react';
import './BottomActions.css';

export default function BottomActions({children}) {
    return (
        <div className="bottom-fixed-container">
            {children}
        </div>
    );
}
