// src/components/GenerateNotes.js
import React, { useState } from 'react';
import './GenerateNote.css'; // Create a CSS file for styling if needed
import axios from 'axios';

const GenerateNotes = ({ setEditNote }) => {
  const [topic, setTopic] = useState('');
  const [subtopics, setSubtopics] = useState('');
  const [depth, setDepth] = useState('choose'); // Default to 'basic'
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!topic || !subtopics || depth === "choose") {
      alert('Please fill in all fields.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/generate-notes', {
        topic,
        subtopics,
        depth,
      });

      setEditNote(response.data.notes);
    } catch (error) {
      console.error('Error generating notes:', error);
      alert('An error occurred while generating the notes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="generate-notes-container">
      <h2 className="generate-notes-title">Generate Notes</h2>

      <label className="generate-notes-label">Topic</label>
      <input 
        className="generate-notes-input" 
        type="text" 
        value={topic} 
        onChange={(e) => setTopic(e.target.value)} 
        placeholder=""
      />

    <label className="generate-notes-label">Complexity Level</label>
      <select 
        className="generate-notes-select" 
        value={depth} 
        onChange={(e) => setDepth(e.target.value)}
      >
        <option value="choose">Choose complexity level</option>
        <option value="basic">Basic</option>
        <option value="intermediate">Intermediate</option>
        <option value="advanced">Advanced</option>
      </select>

      <label className="generate-notes-label">Points to Cover</label>
      <textarea 
        className="generate-notes-input" 
        type="text" 
        value={subtopics} 
        onChange={(e) => setSubtopics(e.target.value)} 
        placeholder=""
        rows="5"
        cols="10"
      ></textarea>

      <button 
        className="generate-notes-button" 
        onClick={handleGenerate}
      >
        {loading ? 'Generating...' : 'Generate'}
      </button>
    </div>
  );
};

export default GenerateNotes;