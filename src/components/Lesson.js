import React, { useState } from 'react';
import './Lesson.css';
import axios from 'axios';
import { ReactComponent as RefreshIcon } from '../assets/icons/refresh-icon.svg';
import GenerateLesson from './GenerateLesson';

const Lesson = ({ pdfFile, savedNote, lesson, setLesson, setCurrentLocation, setMessageToChat }) => {
    const [loading, setLoading] = useState(false);
    const [popupVisible, setPopupVisible] = useState(false);
    const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
    const [selectedText, setSelectedText] = useState('');
    const [showOptions, setShowOptions] = useState(false);
    const [showGenerateLesson, setShowGenerateLesson] = useState(false);

    const handleUploadLesson = async () => {
        if (!pdfFile) {
            alert('Please select a PDF file to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('pdf', pdfFile);

        try {
            setLoading(true);
            const response = await axios.post('http://localhost:8000/lesson', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setLesson(response.data.summary);
        } catch (error) {
            console.error('Error uploading PDF:', error);
            alert('An error occurred while uploading the PDF. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleNoteLesson = async () => {
        try {
            setLoading(true);
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
                    message: `Can you write a detailed lesson as if you were a teacher teaching about these notes. 
                    Your lesson should seamlessly transition between topics and should be written as a body of text 
                    (not bullet points, however, it can contain bullet points if necessary). Be sure to include key concepts and vocabulary, along with all important equations. 
                    Make sure to explain each concept in depth and add analogies if you think the concept you are trying to teach
                    would be too difficult to understand without one. Do not abuse the analogies though as it will become obvious.
                    Refrain from using very high level wording to make the lesson easier to understand. The lesson should be quite lengthy, longer than a summary.
                    It must be 900+ words. Do not say hello class or anything like that.
                    If organization is needed, you can split the lesson into subsections with subtitles, but be sure to use HTML tags/formatting to do so.
                    Make sure your response does not at all include * or # and instead uses HTML tags to convey the same formatting. To remind you: <b> or <strong> is used for bolding,
                    <li> is used for a bullet point, and <p> is used for a paragraph. Please use those tags and other HTML tags rather than the #'s and the *'s.
                    Make sure there is an h2 title.`,
                }),
                headers: {
                    'Content-Type': 'application/json',
                },
            };
            const response = await fetch('http://localhost:8000/gemini', options);
            const q = await response.text();
            setLesson(q);
        } catch (error) {
            setLesson("## There was an error summarizing, try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleTopicLesson = async () => {
        setShowGenerateLesson(true);
    };

    const newLesson = (type) => {
        setShowOptions(false);
        if (type === 'pdf') {
            handleUploadLesson();
        } else if (type === 'notes') {
            handleNoteLesson();
        } else if (type === 'topic') {
            handleTopicLesson();
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
            setMessageToChat(message);
            setPopupVisible(false);
        }
    };

    const formatResponseText = (text) => {
        // Replace **text** with <b>text</b> for bold
        text = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
        text = text.replace(/\*(.*?)\*/g, '<b>$1</b>');

        // Replace # text with <h1>text</h1>, ## text with <h2>text</h2>, and ### text with <h3>text</h3>
        text = text.replace(/^(#{1,6})\s*(.*?)$/gm, (match, hashes, content) => {
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

    return (
        <div>
            <div className="lesson-container" onMouseUp={handleTextSelection}>
                <div 
                    className="lesson-options"
                    onMouseEnter={() => setShowOptions(true)}
                    onMouseLeave={() => setShowOptions(false)}
                >
                    <button className="lesson-options-button">
                        Generate Lesson
                    </button>
                    {showOptions && (
                        <div className="lesson-options-popup">
                            <button onClick={() => newLesson('notes')}>Lesson from Notes</button>
                            <button onClick={() => newLesson('topic')}>Lesson from Topic</button>
                            <button onClick={() => newLesson('pdf')}>Lesson from PDF</button>
                        </div>
                    )}
                </div>
                <div 
                    className="lesson-content" 
                    dangerouslySetInnerHTML={{ __html: formatResponseText(lesson) }} 
                />
                {popupVisible && (
                    <div className="popup" style={{ top: popupPosition.y, left: popupPosition.x }}>
                        <button onClick={handleAskAI}>Ask AI</button>
                    </div>
                )}
                {loading && <div className="loader-lesson"></div>}
            </div>
            {showGenerateLesson && (
                <div className="generate-lesson-overlay">
                    <GenerateLesson 
                        setLesson={setLesson}
                        setLoading={setLoading}
                        onClose={() => setShowGenerateLesson(false)}
                    />
                </div>
            )}
        </div>
    );

};

export default Lesson;