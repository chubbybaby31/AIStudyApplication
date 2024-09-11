import React, { useEffect, useState } from "react";
import './Menu.css'
import { ReactComponent as DeleteIcon} from '../assets/icons/delete-icon.svg';
import { getDoc, updateDoc } from "firebase/firestore";
import AddNotePopup from "./AddNotePopup";

const Menu = ({ authUser, docRef, setCurrentLocation, fileSystem, setFileSystem, setSavedNote, setSummary, 
    setLesson, setFlashCards, setNoteName, setPathToNote, setInitialValues, setType, path, setPath }) => {
    const [showOptions, setShowOptions] = useState(false);
    const [currentItems, setCurrentItems] = useState([])
    const [newName, setNewName] = useState("")
    const [namePopup, setNamePopup] = useState(false)
    const [componentToAdd, setComponentToAdd] = useState("")
    const [activeTab, setActiveTab] = useState('directory');
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [showAddNotePopup, setShowAddNotePopup] = useState(false);
    const [showAddDirNotePopup, setShowAddDirNotePopup] = useState(false);
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

    const handleAddDirNote = (noteName, selectedLocation) => {
        const newNote = {
            name: noteName,
            type: 'note',
            content: '',
            lesson: '',
            summary: '',
            terms: [],
            test: []
        };

        let updatedFileSystem = [...fileSystem];

        if (selectedLocation === 'Unlinked') {
            // Add to root level
            updatedFileSystem.push(newNote);
        } else {
            // Add to selected document
            const addNoteToDocument = (items) => {
                return items.map(item => {
                    if (item.type === 'document' && item.name === selectedLocation) {
                        return {
                            ...item,
                            notes: [...item.notes, newNote]
                        };
                    } else if (item.type === 'folder') {
                        return {
                            ...item,
                            content: addNoteToDocument(item.content)
                        };
                    }
                    return item;
                });
            };

            updatedFileSystem = addNoteToDocument(updatedFileSystem);
        }

        setFileSystem(updatedFileSystem);
        updateFirestore(updatedFileSystem);
        setCurrentItems(getCurrentItems(updatedFileSystem));
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

    const handleNoteClick = (note, type) => {
        setFlashCards(note.terms)
        setSummary(note.summary)
        setLesson(note.lesson)
        setSavedNote(note.content)
        if (activeTab === 'directory') {
        setPathToNote(path)
        } else {
        setPathToNote([...path, selectedDocument.name])
        }
        setNoteName(note.name)
        setInitialValues({
        note: note.content, 
        summary: note.summary, 
        lesson: note.lesson, 
        terms: note.terms
        })
    
        if (type === 'lesson') {
            setType("lesson")
            setCurrentLocation("lesson-page")
        } else if (type === 'summary') {
            setType("summary")
            setCurrentLocation("summary-page")
        } else if (type === 'terms') {
            setType("terms")
            setCurrentLocation('flash-cards-page')
        } else {
            setType("note")
            setCurrentLocation("note-page")
        }
      }

    const handleAddItem = () => {
        if (path.length === 0 && componentToAdd !== 'folder') {
            console.error('Only folders can be added to the root directory');
            return;
        }
    
        switch(componentToAdd) {
            case 'folder':
                addFolder();
                break;
            case 'document':
                addDocument();
                break;
            case 'note':
                addNote();
                break;
            case 'lesson':
                addUnlinkedItem('lesson');
                break;
            case 'summary':
                addUnlinkedItem('summary');
                break;
            case 'terms':
                addUnlinkedItem('terms');
                break;
            case 'test':
                addUnlinkedItem('test');
                break;
            default:
                console.error('Unknown component type');
        }
    };
    
    const addUnlinkedItem = (itemType) => {
        setNamePopup(false);
        setComponentToAdd("");
        let updatedFileSystem = JSON.parse(JSON.stringify(fileSystem));
        const newItem = {
            name: newName,
            type: itemType,
        };
    
        if (itemType === 'terms') {
            newItem.terms = [];
        } else if (itemType === 'test') {
            newItem.questions = [];
        } else if (itemType === 'lesson') {
            newItem.lesson = ""
        } else if (itemType === 'summary') {
            newItem.summary = ""
        } else {
            newItem.content = ""
        }
    
        updatedFileSystem.push(newItem);
    
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
        setNewName("");
    };

    const handleUnlinkedItemClick = (item) => {
        switch(item.type) {
            case 'note':
                handleNoteClick(item, 'note');
                break;
            case 'lesson':
                setLesson(item.lesson);
                setNoteName(item.name);
                setPathToNote([]);
                setInitialValues({ note: '', summary: '', lesson: item.lesson, terms: [] });
                setCurrentLocation("lesson-page");
                break;
            case 'summary':
                setSummary(item.summary);
                setNoteName(item.name);
                setPathToNote([]);
                setInitialValues({ note: '', summary: item.summary, lesson: '', terms: [] });
                setCurrentLocation("summary-page");
                break;
            case 'terms':
                setFlashCards(item.terms || []);
                setNoteName(item.name);
                setPathToNote([]);
                setInitialValues({ note: '', summary: '', lesson: '', terms: item.terms || [] });
                setCurrentLocation("flash-cards-page");
                break;
            case 'test':
                setNoteName(item.name);
                setPathToNote([]);
                setInitialValues({ note: '', summary: '', lesson: '', terms: [], test: item.questions || [] });
                setCurrentLocation("multiple-choice-page");
                break;
            default:
                console.error('Unknown item type');
        }
    };

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

    const deleteFolder = (item) => {
        // Ask for confirmation before deleting
        const confirmDelete = window.confirm(`Are you sure you want to delete the folder "${item.name}" and all its contents?`);
        if (!confirmDelete) return;
    
        // Create a copy of the file system
        let updatedFileSystem = [...fileSystem];
    
        // Function to recursively find and remove the folder
        const removeFolderFromPath = (items, pathIndex) => {
            if (pathIndex === path.length) {
                // We're at the correct level, remove the folder
                return items.filter(i => (i.name !== item.name || i.type !== item.type));
            }
    
            // Find the next folder in the path
            const folderIndex = items.findIndex(i => i.name === path[pathIndex] && i.type === 'folder');
            if (folderIndex === -1) {
                console.error("Path not found");
                return items;
            }
    
            // Recursively update the content of the folder
            const updatedFolder = {...items[folderIndex]};
            updatedFolder.content = removeFolderFromPath(updatedFolder.content, pathIndex + 1);
    
            // Return the updated list of items
            return [
                ...items.slice(0, folderIndex),
                updatedFolder,
                ...items.slice(folderIndex + 1)
            ];
        };
    
        // Remove the folder from the file system
        updatedFileSystem = removeFolderFromPath(updatedFileSystem, 0);
    
        // Update the state
        setFileSystem(updatedFileSystem);
    
        // Update Firestore
        updateFirestore(updatedFileSystem);
    
        setCurrentItems(getCurrentItems(updatedFileSystem));
    };

    const deleteDocument = (item) => {
        // Ask for confirmation before deleting
        const confirmDelete = window.confirm(`Are you sure you want to delete the document "${item.name}" and all its associated notes?`);
        if (!confirmDelete) return;
    
        // Create a copy of the file system
        let updatedFileSystem = [...fileSystem];
    
        // Function to recursively find and remove the document
        const removeDocumentFromPath = (items, pathIndex) => {
            if (pathIndex === path.length) {
                return items.filter(i => (i.name !== item.name || i.type !== item.type));
            }
    
            // Find the next folder in the path
            const folderIndex = items.findIndex(i => i.name === path[pathIndex] && i.type === 'folder');
            if (folderIndex === -1) {
                console.error("Path not found");
                return items;
            }
    
            // Recursively update the content of the folder
            const updatedFolder = {...items[folderIndex]};
            updatedFolder.content = removeDocumentFromPath(updatedFolder.content, pathIndex + 1);
    
            // Return the updated list of items
            return [
                ...items.slice(0, folderIndex),
                updatedFolder,
                ...items.slice(folderIndex + 1)
            ];
        };
    
        // Remove the document from the file system
        updatedFileSystem = removeDocumentFromPath(updatedFileSystem, 0);
    
        // Update the state
        setFileSystem(updatedFileSystem);
    
        // Update Firestore
        updateFirestore(updatedFileSystem);
    
        // Refresh the current items
        setCurrentItems(getCurrentItems(updatedFileSystem));
    
        // If the deleted document was the selected document, clear the selection
        if (selectedDocument && selectedDocument.name === item.name) {
            setSelectedDocument(null);
        }
    };

    const deleteDocumentNote = (item) => {
        const confirmDelete = window.confirm(`Are you sure you want to delete this note from the document?`);
        if (!confirmDelete) return;
    
        // Create a copy of the file system
        let updatedFileSystem = [...fileSystem];
    
        // Function to recursively find the document and remove the note
        const removeNoteFromDocument = (items, pathIndex) => {
            if (pathIndex === path.length) {
                // We're at the correct level, find the document and remove the note
                return items.map(doc => {
                    if (doc.name === selectedDocument.name && doc.type === 'document') {
                        return {
                            ...doc,
                            notes: doc.notes.filter(note => note.name !== item.name)
                        };
                    }
                    return doc;
                });
            }
    
            // Find the next folder in the path
            const folderIndex = items.findIndex(i => i.name === path[pathIndex] && i.type === 'folder');
            if (folderIndex === -1) {
                console.error("Path not found");
                return items;
            }
    
            // Recursively update the content of the folder
            const updatedFolder = {...items[folderIndex]};
            updatedFolder.content = removeNoteFromDocument(updatedFolder.content, pathIndex + 1);
    
            // Return the updated list of items
            return [
                ...items.slice(0, folderIndex),
                updatedFolder,
                ...items.slice(folderIndex + 1)
            ];
        };
    
        // Remove the note from the document in the file system
        updatedFileSystem = removeNoteFromDocument(updatedFileSystem, 0);
    
        // Update the state
        setFileSystem(updatedFileSystem);
    
        // Update Firestore
        updateFirestore(updatedFileSystem);
    
        // Update the selectedDocument state
        if (selectedDocument) {
            const updatedSelectedDocument = {
                ...selectedDocument,
                notes: selectedDocument.notes.filter(note => note !== item)
            };
            setSelectedDocument(updatedSelectedDocument);
        }
    
        // Clear any displayed or edited content related to the deleted note
        if (item.type === 'note') setSavedNote('');
        if (item.type === 'lesson') setLesson('');
        if (item.type === 'summary') setSummary('');
        if (item.type === 'terms') setFlashCards([]);
    
        // Refresh the current items if necessary
        setCurrentItems(getCurrentItems(updatedFileSystem));
    };

    const deleteUnlinked = (item) => {
        const confirmDelete = window.confirm(`Are you sure you want to delete this unlinked ${item.type}?`);
        if (!confirmDelete) return;
    
        // Create a copy of the file system
        let updatedFileSystem = JSON.parse(JSON.stringify(fileSystem));
    
        // Function to recursively find and remove the unlinked item
        const removeUnlinkedItem = (items) => {
            return items.map(i => {
                if (i.type === 'folder') {
                    return {
                        ...i,
                        content: removeUnlinkedItem(i.content)
                    };
                }
                return i;
            }).filter(i => i.name !== item.name || i.type !== item.type);
        };
    
        // Remove the unlinked item from the file system
        updatedFileSystem = removeUnlinkedItem(updatedFileSystem);
    
        // Update the state
        setFileSystem(updatedFileSystem);
    
        // Update Firestore
        updateFirestore(updatedFileSystem);
    
        // Refresh the current items
        setCurrentItems(getCurrentItems(updatedFileSystem));
    
        // If we're in a specific tab, we might need to update the view
        switch (activeTab) {
            case 'document-notes':
                if (item.type === 'note') {
                    // Remove the item from the selectedDocument if it exists there
                    if (selectedDocument) {
                        const updatedNotes = selectedDocument.notes.filter(note => note.name !== item.name);
                        setSelectedDocument({...selectedDocument, notes: updatedNotes});
                    }
                }
                break;
            case 'lessons-summaries':
                if (item.type === 'lesson' || item.type === 'summary') {
                    // Similar logic as above, if needed
                }
                break;
            case 'terms-tests':
                if (item.type === 'terms' || item.type === 'test') {
                    // Similar logic as above, if needed
                }
                break;
            default:
                break;
        }
    
        // Clear any displayed or edited content related to the deleted item
        if (item.type === 'note') setSavedNote('');
        if (item.type === 'lesson') setLesson('');
        if (item.type === 'summary') setSummary('');
        if (item.type === 'terms') setFlashCards([]);
    };

    const updateFirestore = async (updatedFileSystem) => {
        try {
            await updateDoc(docRef, {
                profile: {
                    email: authUser.email,
                    root: updatedFileSystem
                }
            });
            console.log("File system updated in Firestore");
        } catch (error) {
            console.error("Error updating Firestore:", error);
        }
    };

    const getCurrentItems = (fileSystem) => {
        let currentLevel = fileSystem;
        for (let folderName of path) {
            const folder = currentLevel.find(item => item.name === folderName && item.type === 'folder');
            if (folder) {
                currentLevel = folder.content;
            } else {
                console.error("Path not found");
                return [];
            }
        }
        return currentLevel;
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
                    {(showOptions && path.length !== 0) && (
                        <div className="add-options">
                            <button onClick={() => setComponentToAdd("folder")}>Add Folder</button>
                            <button onClick={() => setComponentToAdd("document")}>Add Document</button>
                            <button onClick={() => setShowAddDirNotePopup(true)}>Add Note</button>
                            <button onClick={() => setComponentToAdd("lesson")}>Add Lesson</button>
                            <button onClick={() => setComponentToAdd("summary")}>Add Summary</button>
                            <button onClick={() => setComponentToAdd("terms")}>Add Terms</button>
                            <button onClick={() => setComponentToAdd("test")}>Add Test</button>
                        </div>
                    )}
                    {(showOptions && path.length === 0) && (
                        <div className="add-options">
                            <button onClick={() => setComponentToAdd("folder")}>Add Folder</button>
                        </div>
                    )}
                </div>
                <button onClick={() => setPath([])}>HOME</button>
            </nav>

            {path.length !== 0 ? (
            <>
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
                                    <button className="document-delete-button" onClick={() => deleteDocument(item)}>
                                        < DeleteIcon className="delete-icon" />
                                    </button>
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
                            Document Notes
                        </div>
                        <div 
                            className={`tab ${activeTab === 'lessons-summaries' ? 'active' : ''}`}
                            onClick={() => handleTabSwitch('lessons-summaries')}
                        >
                            Lessons and Summaries
                        </div>
                        <div 
                            className={`tab ${activeTab === 'terms-tests' ? 'active' : ''}`}
                            onClick={() => handleTabSwitch('terms-tests')}
                        >
                            Terms and Tests
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
                                            <button className="delete-folder-button" onClick={() => deleteFolder(item)}>
                                                <DeleteIcon className="delete-icon" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <div className="notes-container">
                                    <h2 className="section-header">Unlinked Items</h2>
                                    <div className="unlinked-items-container">
                                        {currentItems.filter(item => 
                                            item.type === 'note' || 
                                            item.type === 'lesson' || 
                                            item.type === 'summary' || 
                                            item.type === 'terms' || 
                                            item.type === 'test'
                                        ).map((item, index) => (
                                            <div key={index} className="unlinked-item-card" onClick={() => handleUnlinkedItemClick(item)}>
                                                <div className="unlinked-item-preview-container">
                                                    <div className="unlinked-item-preview-content">
                                                        {item.type === 'note' && (
                                                            <div dangerouslySetInnerHTML={{ __html: item.content }} />
                                                        )}
                                                        {item.type === 'lesson' && (
                                                            <div dangerouslySetInnerHTML={{ __html: item.lesson }} />
                                                        )}
                                                        {item.type === 'summary' && (
                                                            <div dangerouslySetInnerHTML={{ __html: item.summary }} />
                                                        )}
                                                        {item.type === 'terms' && (
                                                            <ul>
                                                                {item.terms.slice(0, 3).map((term, termIndex) => (
                                                                    <li key={termIndex}>{term.term}: {term.definition}</li>
                                                                ))}
                                                                {item.terms.length > 3 && <li>...</li>}
                                                            </ul>
                                                        )}
                                                        {item.type === 'test' && (
                                                            <ul>
                                                                {item.test.slice(0, 3).map((question, questionIndex) => (
                                                                    <li key={questionIndex}>{question}</li>
                                                                ))}
                                                                {item.test.length > 3 && <li>...</li>}
                                                            </ul>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex-div-unlinked">
                                                    <div className="unlinked-item-info-container">
                                                        <div className="unlinked-item-name">{item.name}</div>
                                                        <div className="unlinked-item-stats">
                                                            <div className="unlinked-item-type">{item.type}</div>
                                                        </div>
                                                    </div>
                                                    <button className="unlinked-item-delete-button" onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteUnlinked(item);
                                                        }}>
                                                            <DeleteIcon className="delete-icon" />
                                                    </button>
                                                </div>
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
                                        <div key={index} className="document-note-card" onClick={() => handleNoteClick(note, 'note')}>
                                            <div className="document-note-preview-container">
                                                <div 
                                                    className="document-note-preview-content" 
                                                    dangerouslySetInnerHTML={{ __html: note.content }} 
                                                />
                                            </div>
                                            <div className="flex-div-unlinked">
                                                <div className="note-name">{note.name}</div>
                                                <button className="document-note-delete" onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteDocumentNote(note);
                                                    }}>
                                                    <DeleteIcon className="delete-icon" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {activeTab === 'lessons-summaries' && selectedDocument && (
                            <div className="document-notes-container split-view">
                                <h2>{selectedDocument.name}</h2>
                                <div className="split-content">
                                    <div className="top-half">
                                        <h3>Lessons</h3>
                                        <div className="document-note-cards-container">
                                            {selectedDocument.notes.map((note, index) => (
                                                <div key={index} className="document-note-card" onClick={() => handleNoteClick(note, 'lesson')}>
                                                    <div className="document-note-preview-container">
                                                        <div className="document-note-preview-content">
                                                            <div dangerouslySetInnerHTML={{ __html: note.lesson }} />
                                                        </div>
                                                    </div>
                                                    <div className="note-name">{note.name} - Lesson</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bottom-half">
                                        <h3>Summaries</h3>
                                        <div className="document-note-cards-container">
                                            {selectedDocument.notes.map((note, index) => (
                                                <div key={index} className="document-note-card" onClick={() => handleNoteClick(note, 'summary')}>
                                                    <div className="document-note-preview-container">
                                                        <div className="document-note-preview-content">
                                                            <div dangerouslySetInnerHTML={{ __html: note.summary }} />
                                                        </div>
                                                    </div>
                                                    <div className="note-name">{note.name} - Summary</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'terms-tests' && selectedDocument && (
                            <div className="document-notes-container split-view">
                                <h2>{selectedDocument.name}</h2>
                                <div className="split-content">
                                    <div className="top-half">
                                        <h3>Terms</h3>
                                        <div className="document-note-cards-container">
                                            {selectedDocument.notes.map((note, index) => (
                                                <div key={index} className="document-note-card" onClick={() => handleNoteClick(note, 'terms')}>
                                                    <div className="document-note-preview-container">
                                                        <div className="document-note-preview-content">
                                                            <ul>
                                                                {note.terms.map((term, termIndex) => (
                                                                    <li key={termIndex}>{term.term}: {term.definition}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                    <div className="note-name">{note.name} - Terms</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bottom-half">
                                        <h3>Tests</h3>
                                        <div className="document-note-cards-container">
                                            {selectedDocument.notes.map((note, index) => (
                                                <div key={index} className="document-note-card" onClick={() => handleNoteClick(note, 'test')}>
                                                    <div className="document-note-preview-container">
                                                        <div className="document-note-preview-content">
                                                            <ul>
                                                                {note.test.map((question, questionIndex) => (
                                                                    <li key={questionIndex}>{question}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                    <div className="note-name">{note.name} - Test</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </>) : (
            <div className="root-container">
                <h2 className="section-header root">Home</h2>
                <div className="root-folders-container">
                    {currentItems.filter(item => item.type === 'folder').map((item, index) => (
                        <div className="root-folder" key={index}>
                            <button className="root-folder-main-component" onClick={() => setPath([...path, item.name])}>
                                <div className="root-folder-name">{item.name}</div>
                            </button>
                            <button className="root-delete-folder-button" onClick={() => deleteFolder(item)}>
                                <DeleteIcon className="delete-icon" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>)
            }
            
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
            {showAddDirNotePopup && (
                <AddNotePopup onClose={() => setShowAddDirNotePopup(false)}
                onAdd={handleAddDirNote}
                currentItems={currentItems} />
            )}
        </div>
    )
}

export default Menu