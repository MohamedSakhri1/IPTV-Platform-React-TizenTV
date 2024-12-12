import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import SideBar from "../Components/SideBar";
import { useFocusable, FocusContext} from "@noriginmedia/norigin-spatial-navigation";
import "./Layout.css";

export default function Layout()
{
    const { ref, focusKey, focusSelf } = useFocusable({
        trackChildren: true,
        focusKey: 'layout-key'
    });

    useEffect(() => {
        focusSelf();  // Focus the layout when it loads
    }, [focusSelf]);



    return (
        <FocusContext.Provider value={focusKey}>
            <div className="app-container" ref={ref}>
                <SideBar className='sidebar' />
                <div className="main-content">
                    <Outlet />   {/* This will render the matched child route */}
                </div>
            </div>
        </FocusContext.Provider>
    );
}
