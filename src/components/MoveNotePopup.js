import React, { useState } from 'react';
import './MoveNotePopup.css';

const MoveNotePopup = ({ onClose, onMove, fileSystem, currentItem }) => {
    const [currentPath, setCurrentPath] = useState([]);
    const [selectedPath, setSelectedPath] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [itemTypeToMove, setItemTypeToMove] = useState('note');

    const getCurrentItems = () => {
        let currentLevel = fileSystem;
        for (let folder of currentPath) {
            const nextLevel = currentLevel.find(item => item.type === 'folder' && item.name === folder);
            if (nextLevel && nextLevel.content) {
                currentLevel = nextLevel.content;
            } else {
                const document = currentLevel.find(item => item.type === 'document' && item.name === folder);
                if (document && document.notes) {
                    return document.notes;
                }
                return [];
            }
        }
        return currentLevel;
    };

    const currentItems = getCurrentItems();

    const handleItemClick = (item) => {
        if (item.type === 'folder') {
            setCurrentPath([...currentPath, item.name]);
            setSelectedPath([...currentPath, item.name]);
        } else if (item.type === 'document') {
            if (itemTypeToMove !== 'note') {
                // If not moving a note, allow viewing document contents
                setCurrentPath([...currentPath, item.name]);
                setSelectedPath(null); // Reset selected path when entering a document
            } else {
                // If moving a note, select the document as destination
                setSelectedPath([...currentPath, item.name]);
            }
        } else if (item.type === 'note') {
            setSelectedPath([...currentPath, item.name]);
        }
    };

    const handleBack = () => {
        if (currentPath.length > 0) {
            setCurrentPath(currentPath.slice(0, -1));
            setSelectedPath(currentPath.slice(0, -1));
        }
    };

    const handleMove = () => {
        if (selectedPath) {
            onMove(currentItem, selectedPath, itemTypeToMove);
            onClose();
        } else {
            alert("Please select a destination");
        }
    };

    const filteredItems = currentItems.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (itemTypeToMove !== 'note' || item.type !== 'note')
    );

    const isMoveButtonDisabled = !selectedPath || 
        (itemTypeToMove !== 'note' && selectedPath.length > 0 && 
        currentItems.find(item => item.name === selectedPath[selectedPath.length - 1])?.type === 'document');

    return (
        <div className="move-note-popup-overlay">
            <div className="move-note-popup">
                <div className="move-note-popup-header">
                    <h2>Move "{currentItem.name}"</h2>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>
                <div className="move-note-popup-content">
                    <div className="move-type-selector">
                        <label htmlFor="itemTypeSelect">Select item to move:</label>
                        <select 
                            id="itemTypeSelect"
                            value={itemTypeToMove}
                            onChange={(e) => setItemTypeToMove(e.target.value)}
                        >
                            <option value="note">Note</option>
                            <option value="summary">Summary</option>
                            <option value="lesson">Lesson</option>
                            <option value="terms">Terms</option>
                        </select>
                    </div>
                    <input 
                        type="text" 
                        placeholder="Search in current folder" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <div className="breadcrumb">
                        <button onClick={() => {setCurrentPath([]); setSelectedPath([]);}}>Home</button>
                        {currentPath.map((folder, index) => (
                            <React.Fragment key={index}>
                                <span> &gt; </span>
                                <button onClick={() => {
                                    setCurrentPath(currentPath.slice(0, index + 1));
                                    setSelectedPath(currentPath.slice(0, index + 1));
                                }}>
                                    {folder}
                                </button>
                            </React.Fragment>
                        ))}
                    </div>
                    <div className="file-system-container">
                        {filteredItems.map((item, index) => (
                            <div 
                                key={index} 
                                className={`file-system-item ${item.type} 
                                    ${selectedPath && selectedPath.join('/') === [...currentPath, item.name].join('/') ? 'selected' : ''}`}
                                onClick={() => handleItemClick(item)}
                            >
                                <span className={`item-icon ${item.type}-icon`}>
                                    {item.type === 'folder' ? '📁' : item.type === 'document' ? '📄' : '📝'}
                                </span>
                                <span className="item-name">{item.name}</span>
                            </div>
                        ))}
                    </div>
                    <div className="move-note-popup-footer">
                        <button onClick={handleBack} className="back-button">Back</button>
                        <button 
                            onClick={handleMove}
                            className="popup-move-button"
                            disabled={isMoveButtonDisabled}
                        >
                            Move
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MoveNotePopup;