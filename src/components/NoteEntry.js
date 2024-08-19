import React, { useState } from 'react'
import './NoteEntry.css'
import axios from 'axios'

const NoteEntry = ({ saved, setSaved, editNote, setEditNote, handleSave }) => {

    return (
        <div className="note-entry">
            <div className="note-text-box-container">
                <textarea
                    className="note-entry-box"
                    id="note-entry-box"
                    rows="50"
                    cols="100"
                    placeholder='Type your notes here...'
                    disabled={saved}
                    onChange={(e) => setEditNote(e.target.value)}
                    value={editNote} // Controlled component
                />
            </div>
            <div className="button-container">
                {!saved && <button onClick={() => handleSave()}>Save</button>}
                {saved && <button onClick={() => setSaved(false)}>Edit</button>}
            </div>
        </div>
    )
}

export default NoteEntry