import React, { useState } from 'react';
import './AddNotePopup.css';

const AddNotePopup = ({ onClose, onAdd, currentItems }) => {
    const [noteName, setNoteName] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('Unlinked');

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd(noteName, selectedLocation);
        onClose();
    };

    return (
        <div className="add-note-popup">
            <div className="add-note-popup-content">
                <h2>Add New Note</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={noteName}
                        onChange={(e) => setNoteName(e.target.value)}
                        placeholder="Enter note name"
                        required
                    />
                    <select
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                    >
                        <option value="Unlinked">Unlinked</option>
                        {currentItems
                            .filter(item => item.type === 'document')
                            .map((doc, index) => (
                                <option key={index} value={doc.name}>
                                    {doc.name}
                                </option>
                            ))
                        }
                    </select>
                    <div className="add-note-popup-buttons">
                        <button type="submit">Add</button>
                        <button type="button" onClick={onClose}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddNotePopup;