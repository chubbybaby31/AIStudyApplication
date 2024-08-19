import React, { useState, useRef } from "react";
import './UploadNote.css';
import axios from 'axios';

const UploadNote = ({ setEditNote, setCurrentLocation, pdfFile, setPdfFile, setIsPdfSummary }) => {

    const [dragActive, setDragActive] = useState(false);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
            setPdfFile(file);
        } else {
            alert('Please upload a valid PDF file.');
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type === 'application/pdf') {
            setPdfFile(file);
        } else {
            alert('Please upload a valid PDF file.');
        }
    };

    const handleUploadMakeNote = async () => {
        if (!pdfFile) {
            alert('Please select a PDF file to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('pdf', pdfFile);

        setLoading(true)

        try {
            const response = await axios.post('http://localhost:8000/makenote', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setEditNote(response.data.summary);
        } catch (error) {
            console.error('Error uploading PDF:', error);
            alert('An error occurred while uploading the PDF. Please try again.');
        } finally {
            setLoading(false)
        }
    };

    const handleClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleSummary = () => {
        setIsPdfSummary(true)
        setCurrentLocation('summary-page')
    }

    return (
        <div className="upload-note-container">
            <h2 className="upload-note-title">Upload PDF to Summarize or Convert to Notes</h2>
            <div 
                className={`pdf-upload-container ${dragActive ? 'active' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleClick}
            >
                <input
                    className="pdf-upload-input"
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                />
                <label className="drag-drop-label">
                    {pdfFile ? (
                        <p>{pdfFile.name} has been uploaded successfully</p>
                    ) : (
                        <p>Drag & Drop your PDF file here or click to browse</p>
                    )}
                </label>
            </div>
            <div className="action-pdf-buttons">
                <button className="pdf-action-button" onClick={() => setCurrentLocation('lesson-page')}>Convert to Lesson</button>
                <button className="pdf-action-button" onClick={() => handleSummary()}>Summarize</button>
                <button className="pdf-action-button" onClick={() => handleUploadMakeNote()}>{loading ? 'Converting...' : 'Convert to Notes'}</button>
            </div>
        </div>
    );
};

export default UploadNote;
