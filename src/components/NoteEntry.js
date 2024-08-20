import React, { useState, useRef } from 'react';
import './NoteEntry.css';
import { ReactComponent as CopyIcon } from '../assets/icons/copy-icon.svg'; // Adjust the path as necessary
import { ReactComponent as ViewIcon } from '../assets/icons/view-icon.svg'; // Adjust the path as necessary
import { ReactComponent as EditIcon } from '../assets/icons/edit-icon.svg'; // Adjust the path as necessary

const NoteEntry = ({ editNote, setEditNote, loading, isEditing, setIsEditing }) => {

    const displayRef = useRef(null)

    const copyToClipboard = () => {
        if (displayRef.current) {
            const text = displayRef.current.innerText; // Get the text content from the div
            navigator.clipboard.writeText(text).then(() => {
                console.log('Text copied to clipboard!'); // Confirmation message
            }).catch(err => {
                console.error('Failed to copy text: ', err);
            });
        }
    };

    const toggleEditView = () => {
        setIsEditing(!isEditing);
    };

    return (
        <div className="note-entry-container">
            <div className="back-drop-note"></div>
            <div className="note-text-box-container">
                {loading && <div className="loader"></div>}
                {isEditing ? (
                    <textarea
                        className="note-entry-box"
                        id="note-entry-box"
                        rows="10"
                        placeholder='Type your notes here...'
                        onChange={(e) => setEditNote(e.target.value)}
                        value={editNote} // Controlled component
                    />
                ) : (
                    <div
                        className="note-display-box"
                        ref={displayRef}
                        dangerouslySetInnerHTML={{ __html: editNote }} // Render HTML content
                    />
                )}
                <div className="button-container">
                    <button className="toggle-button" onClick={toggleEditView}>
                        {isEditing ? <ViewIcon className='view-icon' /> : <EditIcon className='edit-icon' />}
                    </button>
                    <button className="copy-button" onClick={copyToClipboard}>
                        <CopyIcon className="copy-icon" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NoteEntry;