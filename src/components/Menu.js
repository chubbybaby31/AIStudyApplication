import React, { useEffect, useState } from "react";
import './Menu.css'
import { getDoc, updateDoc } from "firebase/firestore";

const Menu = ({ authUser, docRef, setCurrentLocation, fileSystem, setFileSystem, setSavedNote, setSummary, 
    setLesson, setFlashCards, setNoteName, setPathToNote, setInitialValues }) => {
    const [showOptions, setShowOptions] = useState(false);
    const [path, setPath] = useState([])
    const [currentItems, setCurrentItems] = useState([])
    const [newName, setNewName] = useState("")
    const [namePopup, setNamePopup] = useState(false)
    const [componentToAdd, setComponentToAdd] = useState("")
    const [activeTab, setActiveTab] = useState('directory');
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [showAddNotePopup, setShowAddNotePopup] = useState(false);
    const [newNoteName, setNewNoteName] = useState(''); 

    const handleAddNote = async () => {
        if (!newNoteName.trim() || !selectedDocument) return;
    
        const newNote = {
            name: newNoteName,
            type: 'note',
            content: '',
            summary: '',
            lesson: '',
            terms: [],
            test: []
        };
    
        // Create a copy of the current file system
        let updatedFileSystem = JSON.parse(JSON.stringify(fileSystem));
    
        // Function to recursively find and update the selected document
        const updateDocument = (items) => {
            for (let item of items) {
                if (item.type === 'document' && item.name === selectedDocument.name) {
                    item.notes.push(newNote);
                    return true;
                }
                if (item.type === 'folder' && item.content) {
                    if (updateDocument(item.content)) return true;
                }
            }
            return false;
        };
    
        updateDocument(updatedFileSystem);
    
        try {
            await updateDoc(docRef, {
                profile: {
                    email: authUser.email,
                    root: updatedFileSystem
                }
            });
    
            setFileSystem(updatedFileSystem);
            setSelectedDocument({...selectedDocument, notes: [...selectedDocument.notes, newNote]});
            setNewNoteName('');
            setShowAddNotePopup(false);
        } catch (error) {
            console.error("Error adding note:", error);
        }
    };

    const handleTabSwitch = (tab) => {
        setActiveTab(tab);
    };

    const handleDocumentClick = (document) => {
        setSelectedDocument(document);
        setActiveTab('document-notes');
    };

    useEffect(() => {
        if (componentToAdd) {
            setNamePopup(true)
        } else {
            setNamePopup(false)
        }
    }, [componentToAdd])

    useEffect(() => {
        const fetchData = async () => {
            try {
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                console.log("Document data:", docSnap.data().profile.root);
                setFileSystem(docSnap.data().profile.root)
            } else {
                console.log("No such document!");
            }
            } catch (error) {
                console.log("Error getting document:", error);
            }
        }
        fetchData()
        
    }, [])

    useEffect(() => {
        const getItemsAtPath = (system, currentPath) => {
            if (!Array.isArray(system)) {
                console.error('File system is not an array:', system);
                return [];
            }
    
            if (currentPath.length === 0) {
                return system;
            }
            
            let currentLevel = system;
            for (let i = 0; i < currentPath.length; i++) {
                if (!Array.isArray(currentLevel)) {
                    console.error('Current level is not an array:', currentLevel);
                    return [];
                }
    
                const folder = currentLevel.find(item => item && item.name === currentPath[i] && item.type === "folder");
                if (folder && Array.isArray(folder.content)) {
                    currentLevel = folder.content;
                } else {
                    console.error('Path not found or invalid structure:', currentPath.slice(0, i + 1));
                    return [];
                }
            }
            return currentLevel;
        };
    
        const itemsAtCurrentPath = getItemsAtPath(fileSystem, path);
        
        let tempItems = Array.isArray(itemsAtCurrentPath) 
            ? itemsAtCurrentPath.map(item => ({
                ...item  // This spreads all properties of the item
              }))
            : [];
    
        setCurrentItems(tempItems);
    }, [fileSystem, path]);

    const handleNoteClick = (note) => {
        setFlashCards(note.terms)
        setSummary(note.summary)
        setLesson(note.lesson)
        setSavedNote(note.content)
        if (activeTab === 'directory') {setPathToNote(path)}
        else {setPathToNote([...path, selectedDocument.name])}
        setNoteName(note.name)
        setInitialValues({note: note.content, summary: note.summary, lesson: note.lesson, terms: note.terms})
        setCurrentLocation("note-page")
    }

    const handleAddItem = () => {
        if (componentToAdd === 'folder') {
            addFolder()
        } else if (componentToAdd === 'note') {
            addNote()
        } else if (componentToAdd === 'document') {
            addDocument()
        }
    }

    const addFolder = () => {
        setNamePopup(false)
        setComponentToAdd("")
        let updatedFileSystem = JSON.parse(JSON.stringify(fileSystem)); // Deep copy
        const newFolder = {
            name: newName,
            type: "folder",
            content: []
        };
    
        if (path && path.length > 0) {
            // Function to recursively traverse the file system
            const addFolderAtPath = (items, pathIndex) => {
                if (pathIndex === path.length) {
                    items.push(newFolder);
                    return items;
                }
                const folder = items.find(item => item.name === path[pathIndex] && item.type === "folder");
                if (folder) {
                    folder.content = addFolderAtPath(folder.content, pathIndex + 1);
                }
                return items;
            };
    
            updatedFileSystem = addFolderAtPath(updatedFileSystem, 0);
        } else {
            // If no path, add to root
            updatedFileSystem.push(newFolder);
        }
    
        updateDoc(docRef, {
            profile: {
                email: authUser.email,
                root: updatedFileSystem
            }
        }).then(() => {
            console.log("Successful Save");
            setFileSystem(updatedFileSystem);
        }).catch((error) => {
            console.log(error);
        });
        setNewName("")
    };

    const addDocument = () => {
        setNamePopup(false)
        setComponentToAdd("")
        let updatedFileSystem = JSON.parse(JSON.stringify(fileSystem)); // Deep copy
        const newDocument = {
            name: newName,
            type: "document",
            notes: []
        };
    
        if (path && path.length > 0) {
            // Function to recursively traverse the file system
            const addDocumentAtPath = (items, pathIndex) => {
                if (pathIndex === path.length) {
                    items.push(newDocument);
                    return items;
                }
                const folder = items.find(item => item.name === path[pathIndex] && item.type === "folder");
                if (folder) {
                    folder.content = addDocumentAtPath(folder.content, pathIndex + 1);
                }
                return items;
            };
    
            updatedFileSystem = addDocumentAtPath(updatedFileSystem, 0);
        } else {
            // If no path, add to root
            updatedFileSystem.push(newDocument);
        }
    
        updateDoc(docRef, {
            profile: {
                email: authUser.email,
                root: updatedFileSystem
            }
        }).then(() => {
            console.log("Successful Save");
            setFileSystem(updatedFileSystem);
        }).catch((error) => {
            console.log(error);
        });
        setNewName("")
    };

    const addNote = () => {
        setNamePopup(false)
        setComponentToAdd("")
        let updatedFileSystem = JSON.parse(JSON.stringify(fileSystem)); // Deep copy
        const newNote = {
            name: newName,
            type: "note",
            content: "",
            summary: "",
            lesson: "",
            terms: [],
            test: []
        };
    
        if (path && path.length > 0) {
            // Function to recursively traverse the file system
            const addNoteAtPath = (items, pathIndex) => {
                if (pathIndex === path.length) {
                    items.push(newNote);
                    return items;
                }
                const folder = items.find(item => item.name === path[pathIndex] && item.type === "folder");
                if (folder) {
                    folder.content = addNoteAtPath(folder.content, pathIndex + 1);
                }
                return items;
            };
    
            updatedFileSystem = addNoteAtPath(updatedFileSystem, 0);
        } else {
            // If no path, add to root
            updatedFileSystem.push(newNote);
        }
    
        updateDoc(docRef, {
            profile: {
                email: authUser.email,
                root: updatedFileSystem
            }
        }).then(() => {
            console.log("Successful Save");
            setFileSystem(updatedFileSystem);
        }).catch((error) => {
            console.log(error);
        });
        setNewName("")
    };

    return (
        <div className="menu-container">
            <nav className="side-nav">
                <div className="add-container"
                     onMouseEnter={() => setShowOptions(true)}
                     onMouseLeave={() => setShowOptions(false)}>
                    <button className="add-button">
                        + ADD
                    </button>
                    {showOptions && (
                        <div className="add-options">
                            <button onClick={() => setComponentToAdd("folder")}>Add Folder</button>
                            <button onClick={() => setComponentToAdd("document")}>Add Document</button>
                            <button onClick={() => setComponentToAdd("unlinked note")}>Add Unlinked Note</button>
                        </div>
                    )}
                </div>
                <button>HOME</button>
            </nav>
            <div className="documents-container">
                <h2 className="section-header">Documents</h2>
                <div className="document-cards-container">
                    {currentItems.filter(item => item.type === 'document').map((item, index) => {
                        const summaryCount = item.notes.filter(note => note.summary && note.summary.trim() !== '').length;
                        const lessonCount = item.notes.filter(note => note.lesson && note.lesson.trim() !== '').length;
                        const termsCount = item.notes.reduce((total, note) => total + (note.terms ? note.terms.length : 0), 0);
                        const testCount = item.notes.filter(note => Array.isArray(note.test) && note.test.length > 0).length;

                        return (
                            <div key={index} className="document-card">
                                <div className="document-preview-container">
                                    <div className="document-preview-content">
                                        {item.notes.map((note, noteIndex) => (
                                            <div key={noteIndex} dangerouslySetInnerHTML={{ __html: note.content }} />
                                        ))}
                                    </div>
                                </div>
                                <div className="document-info-container" onClick={() => handleDocumentClick(item)}>
                                    <div className="document-name">{item.name}</div>
                                    <div className="document-stats">
                                        <div>Notes: {item.notes.length}</div>
                                        <div>Summaries: {summaryCount}</div>
                                        <div>Lessons: {lessonCount}</div>
                                        <div>Terms: {termsCount}</div>
                                        <div>Tests: {testCount}</div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="main-content">
                <div className="browser-tabs">
                    <div 
                        className={`tab ${activeTab === 'directory' ? 'active' : ''}`}
                        onClick={() => handleTabSwitch('directory')}
                    >
                        Directory
                    </div>
                    <div 
                        className={`tab ${activeTab === 'document-notes' ? 'active' : ''}`}
                        onClick={() => handleTabSwitch('document-notes')}
                    >
                        {selectedDocument ? selectedDocument.name : 'Document Notes'}
                    </div>
                </div>
                
                <div className="tab-content">
                    {activeTab === 'directory' && (
                        <div className="directory-container">
                            <div className="folders-container">
                                <h2 className="section-header">Folders</h2>
                                {currentItems.filter(item => item.type === 'folder').map((item, index) => (
                                    <div className="component" key={index}>
                                        <button className="main-component" onClick={() => setPath([...path, item.name])}>
                                            <div className="component-name">{item.name}</div>
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="notes-container">
                                <h2 className="section-header">Unlinked Notes</h2>
                                <div className="note-cards-container">
                                    {currentItems.filter(item => item.type === 'note').map((item, index) => (
                                        <div key={index} className="note-card" onClick={() => handleNoteClick(item)}>
                                            <div className="note-preview-container">
                                                <div 
                                                    className="note-preview-content" 
                                                    dangerouslySetInnerHTML={{ __html: item.content }} 
                                                />
                                            </div>
                                            <div className="note-name">{item.name}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {activeTab === 'document-notes' && selectedDocument && (
                        <div className="document-notes-container">
                            <div className="document-notes-header">
                                <h2>{selectedDocument.name}</h2>
                                <button className="add-note-button" onClick={() => setShowAddNotePopup(true)}>
                                    Add Note
                                </button>
                            </div>
                            <div className="document-note-cards-container">
                                {selectedDocument.notes.map((note, index) => (
                                    <div key={index} className="document-note-card" onClick={() => handleNoteClick(note)}>
                                        <div className="document-note-preview-container">
                                            <div 
                                                className="document-note-preview-content" 
                                                dangerouslySetInnerHTML={{ __html: note.content }} 
                                            />
                                        </div>
                                        <div className="note-name">{note.name}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {namePopup && 
            <div className="name-directory">
                <div className="name-popup-header">
                    <h2>Enter Name</h2>
                    <button className="close-name-popup-button" onClick={() => setComponentToAdd("")}>X</button>
                </div>
                <form className="name-form" onSubmit={handleAddItem}>
                    <input className="name-entry" value={newName} onChange={(e) => setNewName(e.target.value)}/>
                    <button type="submit">+</button>
                </form>
            </div>
            }
            {showAddNotePopup && 
            <div className="add-note-popup">
                <h3>Add New Note</h3>
                <input 
                    type="text" 
                    value={newNoteName} 
                    onChange={(e) => setNewNoteName(e.target.value)} 
                    placeholder="Enter note name"
                />
                <div className="popup-buttons">
                    <button onClick={handleAddNote}>Add</button>
                    <button onClick={() => setShowAddNotePopup(false)}>Cancel</button>
                </div>
            </div>
            }
        </div>
    )
}

export default Menu