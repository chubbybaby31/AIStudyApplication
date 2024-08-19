import React from 'react';
import './NoteEntry.css';

const NoteEntry = ({ editNote, setEditNote, setCurrentLocation }) => {
    return (
        <div className="note-entry-container">
            <div className="note-text-box-container">
                <textarea
                    className="note-entry-box"
                    id="note-entry-box"
                    rows="10"
                    placeholder='Type your notes here...'
                    onChange={(e) => setEditNote(e.target.value)}
                    value={editNote} // Controlled component
                />
            </div>
            <div className="button-container">
                <button className="lesson-button" onClick={() => setCurrentLocation('lesson-page')}>Convert to Lesson</button>
                <button className="summary-button" onClick={() => setCurrentLocation('summary-page')}>Summarize</button>
            </div>
        </div>
    );
};

export default NoteEntry;
