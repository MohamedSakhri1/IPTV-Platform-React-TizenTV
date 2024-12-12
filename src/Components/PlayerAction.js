import { useEffect } from 'react';
import './PlayerAction.css'
import { useFocusable } from '@noriginmedia/norigin-spatial-navigation';

export default function PlayerAction({Svg, handleClick = () => {console.log('add Action')}}) {

    const { ref, focused, focusSelf } = useFocusable({
        onEnterPress: () => handleClick(),
        isFocusBoundary: true,
        focusBoundaryDirections: ['up', 'down'],
    });

    useEffect( () => {
        focusSelf();
    }, [focusSelf])


    return (
        <div className={"player-action-icon" + (focused ? ' focused' : '')} ref={ref}>
            {<Svg style={{stroke: focused ? 'black' : 'white', fill: 'none'}}/>}
        </div>
    );
}