import React from 'react'
import './Note.css'
import NoteEntry from './NoteEntry'
import UploadNote from './UploadNote'
import GenerateNote from './GenerateNote'

const Note = ({ savedNote, setSavedNote, setCurrentLocation, pdfFile, setPdfFile, setIsPdfSummary }) => {

    return (
        <div className="note-page">
            <div className="left-column">
                <GenerateNote 
                    className="generate-note" 
                    setEditNote={setSavedNote} 
                />
                <UploadNote 
                    className="upload-note"
                    setEditNote={setSavedNote}
                    setCurrentLocation={setCurrentLocation}
                    pdfFile={pdfFile}
                    setPdfFile={setPdfFile}
                    setIsPdfSummary={setIsPdfSummary}
                />
            </div>
            <NoteEntry 
                className="note-entry"
                editNote={savedNote}
                setEditNote={setSavedNote}
                setCurrentLocation={setCurrentLocation}
                setIsPdfSummary={setIsPdfSummary}
            />
        </div>
    )

}

export default Note