import React from "react";
import './Menu.css'

const Menu = ({ authUser, docRef, setCurrentLocation, setIsNewSpace }) => {

    const handleNewSpace = () => {
        setIsNewSpace(true)
        setCurrentLocation("new-space-page")
    }

    return (
        <div class="menu-container">
            <button class="add-space" onClick={handleNewSpace}>Create New Study Space</button>
        </div>
    )
}

export default Menu