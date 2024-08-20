import React, { useState } from 'react';
import './Note.css';
import NoteEntry from './NoteEntry';
import UploadNote from './UploadNote';
import GenerateNote from './GenerateNote';

const Note = ({ savedNote, setSavedNote, setCurrentLocation, pdfFile, setPdfFile, setIsPdfSummary, setIsPdfLesson }) => {

    const [loading, setLoading] = useState(false)

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
                </div>
            </nav>
            <div className="main-body">
                <div className="left-column">
                    <GenerateNote 
                        className="generate-note" 
                        setEditNote={setSavedNote} 
                        setLoading={setLoading}
                    />
                    <UploadNote 
                        className="upload-note"
                        setEditNote={setSavedNote}
                        pdfFile={pdfFile}
                        setPdfFile={setPdfFile}
                        setLoading={setLoading}
                    />
                </div>
                <NoteEntry 
                    className="note-entry"
                    editNote={savedNote}
                    setEditNote={setSavedNote}
                    loading={loading}
                />
            </div>
        </div>
    );
};

export default Note;