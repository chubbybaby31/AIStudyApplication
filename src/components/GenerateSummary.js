// src/components/GenerateSummary.js
import React, { useState } from 'react';
import './GenerateSummary.css';
import axios from 'axios';

const GenerateSummary = ({ setSummary, setLoading, onClose }) => {
  const [topic, setTopic] = useState('');
  const [subtopics, setSubtopics] = useState('');

  const handleGenerate = async () => {
    if (!topic || !subtopics) {
      alert('Please fill in all fields.');
      return;
    }

    setLoading(true);
    onClose();
    try {
      const response = await axios.post('http://localhost:8000/generate-summary', {
        topic,
        subtopics,
      });

      setSummary(response.data.summary);
    } catch (error) {
      console.error('Error generating summary:', error);
      alert('An error occurred while generating the summary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="generate-summary-container">
      <h2 className="generate-summary-title">Generate Summary</h2>

      <label className="generate-summary-label">Topic</label>
      <input 
        className="generate-summary-input" 
        type="text" 
        value={topic} 
        onChange={(e) => setTopic(e.target.value)} 
        placeholder="Enter the main topic"
      />

      <label className="generate-summary-label">Points to Cover</label>
      <textarea 
        className="generate-summary-input" 
        value={subtopics} 
        onChange={(e) => setSubtopics(e.target.value)} 
        placeholder="Enter subtopics or key points to cover"
        rows="5"
        cols="10"
      ></textarea>

      <button 
        className="generate-summary-button" 
        onClick={handleGenerate}
      >
        Generate
      </button>

      <button 
        className="close-summary-button" 
        onClick={onClose}
      >
        Close
      </button>
    </div>
  );
};

export default GenerateSummary;