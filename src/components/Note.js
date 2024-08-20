import React, { useState } from 'react';
import './Note.css';
import NoteEntry from './NoteEntry';
import UploadNote from './UploadNote';
import GenerateNote from './GenerateNote';

const Note = ({ savedNote, setSavedNote, setCurrentLocation, pdfFile, setPdfFile, setIsPdfSummary, setIsPdfLesson }) => {

    const [loading, setLoading] = useState(false)
    const [isEditing, setIsEditing] = useState(true);

    const handleSummaryTB = () => {
        setCurrentLocation('summary-page')
        setIsPdfSummary(false)
    }

    const handleLessonTB = () => {
        setCurrentLocation('lesson-page')
        setIsPdfLesson(false)
    }

    const handleSummaryPDF = () => {
        setCurrentLocation('summary-page')
        setIsPdfSummary(true)
    }

    const handleLessonPDF = () => {
        setCurrentLocation('lesson-page')
        setIsPdfLesson(true)
    }

    return (
        <div className="note-page">
            <nav className="navbar">
                <h1 className='nav-heading'>Notes</h1>
                <div className='nav-button-container'>
                    <div className="dropdown">
                        <button className="nav-button">Lesson</button>
                        <div className="dropdown-content">
                            <button onClick={() => handleLessonPDF()}>Convert PDF to Lesson</button>
                            <button onClick={() => handleLessonTB()}>Convert Text Box to Lesson</button>
                        </div>
                    </div>
                    <div className="dropdown">
                        <button className="nav-button">Summary</button>
                        <div className="dropdown-content">
                            <button onClick={() => handleSummaryPDF()}>Summarize PDF</button>
                            <button onClick={() => handleSummaryTB()}>Summarize Text Box</button>
                        </div>
                    </div>
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
                    isEditing={isEditing}
                    setIsEditing={setIsEditing}
                />
            </div>
        </div>
    );
};

export default Note;