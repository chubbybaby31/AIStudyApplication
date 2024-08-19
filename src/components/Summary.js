import React, { useEffect, useState } from 'react';
import './Summary.css';
import axios from 'axios';

const Summary = ({ pdfFile, savedNote, isPdfSummary, summary, setSummary, setCurrentLocation, setMessageToChat }) => {
    const [loading, setLoading] = useState(false);
    const [popupVisible, setPopupVisible] = useState(false);
    const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
    const [selectedText, setSelectedText] = useState('');

    const formatResponseText = (text) => {
        // Replace **text** with <b>text</b> for bold
        text = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
        text = text.replace(/\*(.*?)\*/g, '<b>$1</b>');

        // Replace # text with <h1>text</h1>, ## text with <h2>text</h2>, and ### text with <h3>text</h3>
        text = text.replace(/^(#{1,3})\s*(.*?)$/gm, (match, hashes, content) => {
            const level = hashes.length; // Count the number of hashes
            return `<h${level}>${content.trim()}</h${level}>`; // Return the corresponding heading
        });

        // Handle bullet points
        const lines = text.split('\n'); // Split by line
        let formattedText = '<ul>'; // Start an unordered list

        lines.forEach(line => {
            if (line.trim().startsWith('* ')) {
                // If the line starts with '* ', treat it as a bullet point
                const bulletPoint = line.replace(/^\*\s*/, ''); // Remove the '* ' from the start
                formattedText += `<li>${bulletPoint.trim()}</li>`; // Add it as a list item
            } else {
                // For non-bullet lines, just add them as paragraphs
                formattedText += `<p>${line.trim()}</p>`;
            }
        });

        formattedText += '</ul>'; // Close the unordered list

        return formattedText;
    };

    const handleUploadSummarize = async () => {
        if (!pdfFile) {
            alert('Please select a PDF file to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('pdf', pdfFile);

        try {
            setLoading(true); // Set loading to true
            const response = await axios.post('http://localhost:8000/summarize', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setSummary(response.data.summary);
        } catch (error) {
            console.error('Error uploading PDF:', error);
            alert('An error occurred while uploading the PDF. Please try again.');
        } finally {
            setLoading(false); // Set loading to false after the request completes
        }
    };

    const handleNoteSummarize = async () => {
        try {
            setLoading(true); // Set loading to true
            const options = {
                method: 'POST',
                body: JSON.stringify({
                    history: [
                        {
                            role: 'user',
                            parts: [
                                {
                                    text: `Here are the notes: ${savedNote}`,
                                },
                            ],
                        },
                        {
                            role: 'model',
                            parts: [{ text: 'Understood.' }],
                        }
                    ],
                    message: `Can you create a detailed summary of the notes making sure not to leave out any important equations and/or vocabulary terms. 
                    The summary should be a body of text that can be separated by main ideas, but it should not be bullet points.
                    Make sure all the core concepts are mentioned. This should be as if you are a teacher who is teaching a struggling student about the topic. 
                    Make sure the summary does not exceed the length of the 500 words and the length of the text in the document. 
                    Essentially, the summary should not be more than 500 words and if the notes itself are less than 500 words then the summary should be less than the number of words in the pdf
                    Do not add anything extra other than the summary. For example, do not add "sure here is a summary for you:" in your response. 
                    If necessary, format the summary into sections with subtitles. Also be sure to include proper spacing as needed.`,
                }),
                headers: {
                    'Content-Type': 'application/json',
                },
            };
            const response = await fetch('http://localhost:8000/gemini', options);
            const q = await response.text();
            setSummary(q);
        } catch (error) {
            setSummary("## There was an error summarizing, try again later.");
        } finally {
            setLoading(false); // Set loading to false after the request completes
        }
    };

    useEffect(() => {
        if (summary === "") {
            if (isPdfSummary) {
                handleUploadSummarize();
            } else {
                handleNoteSummarize();
            }
        }
    }, [isPdfSummary]);

    const newSummary = () => {
        if (isPdfSummary) {
            handleUploadSummarize();
        } else {
            handleNoteSummarize();
        }
    }

    const handleTextSelection = () => {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const selectedText = selection.toString();
            if (selectedText) {
                setSelectedText(selectedText);
                const rect = selection.getRangeAt(0).getBoundingClientRect();
                setPopupPosition({ x: rect.x + window.scrollX, y: rect.y + window.scrollY });
                setPopupVisible(true);
            }
        }
    };

    const handleAskAI = () => {
        if (selectedText) {
            const message = `Please explain/define this section: "${selectedText}"`;
            setMessageToChat(message); // Function to send message to the chat
            setPopupVisible(false); // Hide the popup after sending the message
        }
    };

    return (
        <div className="summary-container" onMouseUp={handleTextSelection}>
            <h2>{loading ? 'Summarizing...' : 'Summary'}</h2>
            <div 
                className="summary-content" 
                dangerouslySetInnerHTML={{ __html: formatResponseText(summary) }} 
            />
            {popupVisible && (
                <div className="popup" style={{ top: popupPosition.y, left: popupPosition.x }}>
                    <button onClick={handleAskAI}>Ask AI</button>
                </div>
            )}
            <div className="button-container">
                <button className="back-to-note-button" onClick={() => setCurrentLocation("note-page")}>Back to Notes</button>
                <button className="new-summary-button" onClick={() => newSummary()}>Generate New Summary</button>
                <button className="mcq-button" onClick={() => setCurrentLocation("multiple-choice-page")}>Multiple Choice Questions</button>
                <button className="flash-card-button" onClick={() => setCurrentLocation("flash-cards-page")}>Generate Flash Cards</button>
            </div>
        </div>
    );
};

export default Summary;