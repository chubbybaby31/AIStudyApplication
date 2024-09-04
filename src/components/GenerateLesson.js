// src/components/GenerateLesson.js
import React, { useState } from 'react';
import './GenerateLesson.css';
import axios from 'axios';

const GenerateLesson = ({ setLesson, setLoading, onClose }) => {
  const [topic, setTopic] = useState('');
  const [subtopics, setSubtopics] = useState('');

  const handleGenerate = async () => {
    if (!topic || !subtopics) {
      alert('Please fill in all fields.');
      return;
    }
    onClose()
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/generate-lesson', {
        topic,
        subtopics,
      });

      setLesson(response.data.lesson);
      onClose(); // Close the popup after generating the lesson
    } catch (error) {
      console.error('Error generating lesson:', error);
      alert('An error occurred while generating the lesson. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="generate-lesson-container">
      <h2 className="generate-lesson-title">Generate Lesson</h2>

      <label className="generate-lesson-label">Topic</label>
      <input 
        className="generate-lesson-input" 
        type="text" 
        value={topic} 
        onChange={(e) => setTopic(e.target.value)} 
        placeholder="Enter the main topic"
      />

      <label className="generate-lesson-label">Points to Cover</label>
      <textarea 
        className="generate-lesson-input" 
        value={subtopics} 
        onChange={(e) => setSubtopics(e.target.value)} 
        placeholder="Enter subtopics or key points to cover"
        rows="5"
        cols="10"
      ></textarea>

      <button 
        className="generate-lesson-button" 
        onClick={handleGenerate}
      >
        Generate
      </button>

      {/* Close button */}
      <button 
        className="close-lesson-button" 
        onClick={onClose}
      >
        Close
      </button>
    </div>
  );
};

export default GenerateLesson;