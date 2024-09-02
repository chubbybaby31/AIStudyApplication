import React, { useEffect, useState } from "react";
import './Menu.css'
import { getDoc, updateDoc } from "firebase/firestore";

const Menu = ({ authUser, docRef, setCurrentLocation, setIsNewSpace, spaces, setSpaceID, fileSystem, setFileSystem, setSavedNote, setSummary, 
    setLesson, setFlashCards, setNoteName, setPathToNote, setInitialValues }) => {
    const [showOptions, setShowOptions] = useState(false);
    const [path, setPath] = useState([])
    const [currentItems, setCurrentItems] = useState([])
    const [newName, setNewName] = useState("")
    const [namePopup, setNamePopup] = useState(false)
    const [componentToAdd, setComponentToAdd] = useState("")

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
        setPathToNote(path)
        setNoteName(note.name)
        setInitialValues({note: note.content, summary: note.summary, lesson: note.lesson, terms: note.terms})
        setCurrentLocation("note-page")
    }

    const handleAddItem = () => {
        if (componentToAdd === 'folder') {
            addFolder()
        } else if (componentToAdd === 'note') {
            addNote()
        } else if (componentToAdd === 'space') {
            addSpace()
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

    const addSpace = () => {
        setNamePopup(false)
        setComponentToAdd("")
        let updatedFileSystem = JSON.parse(JSON.stringify(fileSystem)); // Deep copy
        const newSpace = {
            name: newName,
            type: "space",
            documents: [],
            other: []
        };
    
        if (path && path.length > 0) {
            // Function to recursively traverse the file system
            const addSpaceAtPath = (items, pathIndex) => {
                if (pathIndex === path.length) {
                    items.push(newSpace);
                    return items;
                }
                const folder = items.find(item => item.name === path[pathIndex] && item.type === "folder");
                if (folder) {
                    folder.content = addSpaceAtPath(folder.content, pathIndex + 1);
                }
                return items;
            };
    
            updatedFileSystem = addSpaceAtPath(updatedFileSystem, 0);
        } else {
            // If no path, add to root
            updatedFileSystem.push(newSpace);
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
                            <button onClick={() => setComponentToAdd("note")}>Add Notes</button>
                            <button onClick={() => setComponentToAdd("space")}>Add Study Space</button>
                        </div>
                    )}
                </div>
                <button>HOME</button>
            </nav>
            <div className="notes-container">
                <h2 className="section-header">Notes</h2>
                <div className="note-cards-container">
                {currentItems.filter(item => item.type === 'note').map((item, index) => (
                    <div key={index} className="note-card" onClick={() => {handleNoteClick(item)}}>
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
            <div className="main-content">
                <div className="directory-container">
                    <h2 className="section-header">Study Spaces and Folders</h2>
                    {currentItems.filter(item => item.type !== 'note').map((item, index) => (
                        <div className="component">
                        <button key={index} className="main-component" onClick={() => setPath([...path, item.name])}>
                            <div className="component-name">{item.name}</div>
                            <div className="component-type"><b>Type:</b> {item.type}</div>
                        </button>
                        <button className="delete-button">🗑️</button>
                        </div>
                    ))}
                </div>
            </div>
            {namePopup && 
            <div className="name-directory">
                <form className="name-form" onSubmit={handleAddItem}>
                    <input className="name-entry" value={newName} onChange={(e) => setNewName(e.target.value)}/>
                    <button type="submit">+</button>
                </form>
            </div>
            }
        </div>
    )
}

export default Menu