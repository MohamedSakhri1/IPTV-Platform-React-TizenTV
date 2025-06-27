import { useEffect, useRef, useState } from "react";
import { ReactComponent as Logo} from '../images/ChannelImage.svg';
import './player.css';
import {SamsungPlayer} from "./Native/SamsungPlayer";
import {WebPlayer} from "./Web/WebPlayer";
/* global webapis */

export default function TvPlayer() {

    return (
        <>
        {
            (window.webapis && window.webapis.avplay)
            ? <SamsungPlayer />
            : <WebPlayer />
        }
            
        </>
    );
}



export function ChannelLogo({ channel }) {
    const [imageExists, setImageExists] = useState(false);

    useEffect(() => {
        if (channel.stream_icon) {
            // Create a new Image object to check if the image exists
            const img = new Image();
            img.src = channel.stream_icon;
            
            // Set up event handlers for loading success and error
            img.onload = () => setImageExists(true);  // Image loaded successfully
            img.onerror = () => setImageExists(false); // Error loading image
        } else {
            setImageExists(false);
        }
    }, [channel.stream_icon]);

    return (
        <div>
            {imageExists ? (
                <img 
                    src={channel.stream_icon} 
                    style={{height: '256px', width: '256px', objectFit: 'contain' }} 
                    alt="Channel Logo"
                />
            ) : (
                <Logo />
            )}
        </div>
    );
}