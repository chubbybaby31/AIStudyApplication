import React, { useState } from "react"
import './UploadNote.css'
import axios from 'axios'

const UploadNote = ({ saved, setEditNote }) => {

    const [pdfFile, setPdfFile] = useState(null)

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file && file.type === 'application/pdf') {
            setPdfFile(file)
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
        } catch (error) {
            console.error('Error uploading PDF:', error)
            alert('An error occurred while uploading the PDF. Please try again.')
        }
    }

    return (
        <div className="upload-note">
            <div class="pdf-upload-container">
                <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    disabled={saved} // Disable if saved
                />
                <div className="action-pdf-buttons">
                    <button onClick={() => handleUploadSummarize()}>Summarize</button>
                    <button onClick={() => handleUploadMakeNote()}>Convert to Notes</button>
                </div>
            </div>
        </div>
    )

}

export default UploadNote