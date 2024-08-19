import React, { useState } from 'react'
import './Note.css'
import NoteEntry from './NoteEntry'
import UploadNote from './UploadNote'
import GenerateNote from './GenerateNote'

const Note = ({ savedNote, setSavedNote }) => {
    const [saved, setSaved] = useState(false)
    const [editNote, setEditNote] = useState("")

    const handleSave = () => {
        setSaved(true)
        setSavedNote(editNote)
    }

    return (
        <div className="note-page">
            <div className="left-column">
                <GenerateNote 
                    className="generate-note" 
                    setEditNote={setEditNote} 
                />
                <UploadNote 
                    className="upload-note"
                    saved={saved}
                    setEditNote={setEditNote}
                />
            </div>
            <NoteEntry 
                className="note-entry"
                saved={saved}
                setSaved={setSaved}
                editNote={editNote}
                setEditNote={setEditNote}
                handleSave={handleSave}
            />
        </div>
    )

}

export default Note