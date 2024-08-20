import React, { useState } from 'react';
import './NoteEntry.css';
import { ReactComponent as CopyIcon } from '../assets/icons/copy-icon.svg'; // Adjust the path as necessary
import { ReactComponent as ViewIcon } from '../assets/icons/view-icon.svg'; // Adjust the path as necessary
import { ReactComponent as EditIcon } from '../assets/icons/edit-icon.svg'; // Adjust the path as necessary

const NoteEntry = ({ editNote, setEditNote, loading }) => {
    const [isEditing, setIsEditing] = useState(true); // State to toggle between edit and view mode

    const copyToClipboard = () => {
        navigator.clipboard.writeText(editNote).then(() => {
            console.log('Text copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
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