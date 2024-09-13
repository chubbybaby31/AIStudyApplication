import React, { useState } from 'react';
import './Note.css';
import NoteEntry from './NoteEntry';
import UploadNote from './UploadNote';
import GenerateNote from './GenerateNote';

const Note = ({ savedNote, setSavedNote, setCurrentLocation, pdfFile, setPdfFile }) => {

    const [loading, setLoading] = useState(false)
    const [isEditing, setIsEditing] = useState(true);

    const handleSummaryTB = () => {
        setCurrentLocation('summary-page')
    }

    const handleLessonTB = () => {
        setCurrentLocation('lesson-page')
    }

    const handleSummaryPDF = () => {
        setCurrentLocation('summary-page')
    }

    const handleLessonPDF = () => {
        setCurrentLocation('lesson-page')
    }

    return (
        <div className="note-page">
            <nav className="navbar">
                <h1 className='nav-heading'>Notes</h1>
                <div className='nav-button-container'>
                    <button className="nav-button" onClick={() => setCurrentLocation("lesson-page")}>Lesson</button>
                    <button className="nav-button" onClick={() => setCurrentLocation("summary-page")}>Summary</button>
                    <button className="nav-button" onClick={() => setCurrentLocation("flash-cards-page")}>Memorize with Flash Cards</button>
                    <button className="nav-button" onClick={() => setCurrentLocation("multiple-choice-page")}>Test Your Knowledge with MCQs</button>
                </div>
            </nav>
            <div className="main-body">
                <div className="left-column">
                    <GenerateNote 
                        className="generate-note" 
                        setEditNote={setSavedNote} 
                        setLoading={setLoading}
                        setIsEditing={setIsEditing}
                    />
                    <UploadNote 
                        className="upload-note"
                        setEditNote={setSavedNote}
                        pdfFile={pdfFile}
                        setPdfFile={setPdfFile}
                        setLoading={setLoading}
                        setIsEditing={setIsEditing}
                    />
                </div>
                <NoteEntry 
                    className="note-entry"
                    editNote={savedNote}
                    setEditNote={setSavedNote}
                    loading={loading}
                    setLoading={setLoading}
                    isEditing={isEditing}
                    setIsEditing={setIsEditing}
                />
            </div>
        </div>
    );
};

export default Note;