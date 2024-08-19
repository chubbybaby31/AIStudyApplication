import React, { useState } from 'react'
import './NoteEntry.css'
import axios from 'axios'

const NoteEntry = ({ savedNote, setSavedNote }) => {
    const [saved, setSaved] = useState(false)
    const [editNote, setEditNote] = useState("")
    const [uploadFile, setUploadFile] = useState(false)
    const [fileUploaded, setFileUploaded] = useState(false)
    const [pdfFile, setPdfFile] = useState(null) // State to hold the uploaded PDF file

    const handleSave = () => {
        setSaved(true)
        setUploadFile(false)
        setFileUploaded(false)
        setSavedNote(editNote)
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file && file.type === 'application/pdf') {
            setPdfFile(file)
            setFileUploaded(false)
        } else {
            alert('Please upload a valid PDF file.')
        }
    }

    const handleUploadSummarize = async () => {
        if (!pdfFile) {
            alert('Please select a PDF file to upload.')
            return
        }

        const formData = new FormData()
        formData.append('pdf', pdfFile)

        try {
            const response = await axios.post('http://localhost:8000/summarize', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })

            setEditNote(response.data.summary)
            setFileUploaded(true)
        } catch (error) {
            console.error('Error uploading PDF:', error)
            alert('An error occurred while uploading the PDF. Please try again.')
        }
    }

    const handleUploadMakeNote = async () => {
        if (!pdfFile) {
            alert('Please select a PDF file to upload.')
            return
        }

        const formData = new FormData()
        formData.append('pdf', pdfFile)

        try {
            const response = await axios.post('http://localhost:8000/makenote', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })

            // Set the returned summary as the saved note
            setEditNote(response.data.summary)
            setFileUploaded(true)
        } catch (error) {
            console.error('Error uploading PDF:', error)
            alert('An error occurred while uploading the PDF. Please try again.')
        }
    }

    return (
        <div className="note-entry">
            <div className="note-text-box-container">
                <textarea
                    className="note-entry-box"
                    id="note-entry-box"
                    rows="30"
                    cols="80"
                    placeholder='Type your notes here...'
                    disabled={saved}
                    onChange={(e) => setEditNote(e.target.value)}
                    value={editNote} // Controlled component
                />
            </div>
            <div className="button-container">
                <button onClick={() => setUploadFile(true)} disabled={saved}>Upload PDF</button>
                {/* <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    disabled={saved} // Disable if saved
                />
                <button onClick={handleUpload} disabled={true}>Upload PDF</button> */}
                {!saved && <button onClick={() => handleSave()}>Save</button>}
                {saved && <button onClick={() => setSaved(false)}>Edit</button>}
            </div>
            {uploadFile && 
                <div class="pdf-upload-container">
                    <textarea
                        className="pdf-entry-box"
                        rows="30"
                        cols="80"
                        placeholder='Your notes or summary will be displayed here once ready and can be edited...'
                        onChange={(e) => setEditNote(e.target.value)}
                        value={editNote} // Controlled component
                    />
                    <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        disabled={saved} // Disable if saved
                    />
                    {!fileUploaded && 
                        <div className="action-pdf-buttons">
                            <button onClick={() => handleUploadSummarize()}>Summarize</button>
                            <button onClick={() => handleUploadMakeNote()}>Convert to Notes</button>
                        </div>
                    }
                    {fileUploaded &&
                        <div className="action-pdf-buttons">
                            <button onClick={() => setFileUploaded(false)}>Back</button>
                            <button onClick={() => handleSave()}>Save and Exit</button>
                        </div>
                    }
                </div>
            }
        </div>
    )
}

export default NoteEntry