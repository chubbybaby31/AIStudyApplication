import React, { useState, useEffect } from 'react'
import { getDoc, doc, updateDoc } from "firebase/firestore";
import { db } from '../firebase';
import './Dashboard.css'
import Note from './Note'
import MultipleChoice from './MultipleChoice'
import Chatbot from './Chatbot'
import Summary from './Summary'
import Lesson from './Lesson'
import FlashCards from './FlashCards'
import Menu from './Menu';
import MoveNotePopup from './MoveNotePopup';

const Dashboard = ({ authUser }) => {
  const [pdfFile, setPdfFile] = useState(null);
  const [savedNote, setSavedNote] = useState("")
  const [currentQuestion, setCurrentQuestion] = useState("")
  const [answersSelected, setAnswersSelected] = useState([])
  const [currentLocation, setCurrentLocation] = useState('menu-page')
  const [isPdf, setIsPdf] = useState(false)
  const [summary, setSummary] = useState('')
  const [lesson, setLesson] = useState('')
  const [flashCards, setFlashCards] = useState("")
  const [currentFlashCard, setCurrentFlashCard] = useState({'term': 'Generate flash cards to see them here...', 'definition': 'Generate flash cards to see them here...'})
  const [lookingAtTerm, setLookingAtTerm] = useState(true)
  const [messageToChat, setMessageToChat] = useState("")
  const [showMoveNotePopup, setShowMoveNotePopup] = useState(false);
  const [noteToMove, setNoteToMove] = useState(null);
  const [path, setPath] = useState([])

  const [fileSystem, setFileSystem] = useState("")
  const [pathToNote, setPathToNote] = useState("")
  const [noteName, setNoteName] = useState("")
  const [initialValues, setInitialValues] = useState({note: "", summary: "", lesson: "", terms: []})
  const [currentValues, setCurrentValues] = useState({note: "", summary: "", lesson: "", terms: []})
  const [type, setType] = useState("")

  const docRef = doc(db, "users", authUser.uid)

  const handleMoveNote = (note, destinationPath) => {
    let updatedFileSystem = JSON.parse(JSON.stringify(fileSystem)); // Deep copy
    let noteRemoved = false;
  
    // Recursive function to remove the note from its current location
    const removeNote = (items) => {
      return items.map(item => {
        if (item.type === 'document' && item.notes) {
          const noteIndex = item.notes.findIndex(n => n.name === note.name && n.type === note.type);
          if (noteIndex !== -1) {
            noteRemoved = true;
            return {
              ...item,
              notes: item.notes.filter((_, index) => index !== noteIndex)
            };
          }
        } else if (item.type === 'folder') {
          return {
            ...item,
            content: removeNote(item.content)
          };
        }
        return item;
      }).filter(item => {
        if (item.type !== 'folder' && item.type !== 'document') {
          return item.name !== note.name || item.type !== note.type;
        }
        return true;
      });
    };
  
    updatedFileSystem = removeNote(updatedFileSystem);
  
    // If the note wasn't removed from a nested location, remove it from the root
    if (!noteRemoved) {
      updatedFileSystem = updatedFileSystem.filter(item => item.name !== note.name || item.type !== note.type);
    }
  
    // Add the note to the new location
    const addNote = (items, pathIndex = 0) => {
      if (pathIndex === destinationPath.length) {
        // We've reached the destination, add the note here
        return [...items, note];
      }
  
      return items.map(item => {
        if (item.name === destinationPath[pathIndex]) {
          if (item.type === 'folder') {
            return {
              ...item,
              content: addNote(item.content, pathIndex + 1)
            };
          } else if (item.type === 'document') {
            return {
              ...item,
              notes: [...(item.notes || []), note]
            };
          }
        }
        return item;
      });
    };
  
    updatedFileSystem = destinationPath.length === 0 ? [...updatedFileSystem, note] : addNote(updatedFileSystem);
  
    setFileSystem(updatedFileSystem);
    updateDoc(docRef, {
      profile: {
        email: authUser.email,
        root: updatedFileSystem
      }
    }).then(() => {
      console.log("Note moved successfully");
    }).catch((error) => {
      console.error("Error moving note:", error);
    });
  };

  const handleMoveItem = (item, destinationPath, itemTypeToMove) => {
    let updatedFileSystem = JSON.parse(JSON.stringify(fileSystem)); // Deep copy
    let itemRemoved = false;
    let movedItem = null;

    // Function to remove the item from its current location
    const removeItem = (items) => {
        return items.map(docItem => {
            if (docItem.type === 'document' && docItem.notes) {
                const noteIndex = docItem.notes.findIndex(n => n.name === item.name);
                if (noteIndex !== -1) {
                    itemRemoved = true;
                    movedItem = {...docItem.notes[noteIndex]}; // Create a copy of the entire note
                    return {
                        ...docItem,
                        notes: docItem.notes.filter((_, index) => index !== noteIndex)
                    };
                }
            } else if (docItem.type === 'folder') {
                return { ...docItem, content: removeItem(docItem.content) };
            }
            return docItem;
        }).filter(docItem => {
            if (docItem.name === item.name && docItem.type === item.type) {
                itemRemoved = true;
                movedItem = {...docItem}; // Create a copy of the entire item
                return false;
            }
            return true;
        });
    };

    updatedFileSystem = removeItem(updatedFileSystem);

    // If we couldn't find the item to move, log an error and return
    if (!movedItem) {
        console.error("Could not find the item to move:", item);
        return;
    }

    // Add the item to the new location
    const addItem = (items, pathIndex = 0) => {
        if (pathIndex === destinationPath.length) {
            // We've reached the destination
            const lastItem = items.find(i => i.name === destinationPath[pathIndex - 1]);
            if (lastItem && lastItem.type === 'folder') {
                // If moving to a folder, add the entire item
                return [...items, movedItem];
            } else if (lastItem && (lastItem.type === 'document' || lastItem.type === 'note')) {
                // If moving to a document, add to its notes
                lastItem.notes = lastItem.notes || [];
                lastItem.notes.push(movedItem);
                return items;
            }
            // If lastItem is undefined, we're at the root level
            return [...items, movedItem];
        }
        return items.map(docItem => {
            if (docItem.name === destinationPath[pathIndex]) {
                if (docItem.type === 'folder') {
                    return { ...docItem, content: addItem(docItem.content, pathIndex + 1) };
                } else if (docItem.type === 'document') {
                    return { ...docItem, notes: addItem(docItem.notes || [], pathIndex + 1) };
                }
            }
            return docItem;
        });
    };

    updatedFileSystem = addItem(updatedFileSystem);

    // Update the Firestore document
    updateDoc(docRef, {
        profile: {
            email: authUser.email,
            root: updatedFileSystem
        }
    }).then(() => {
        console.log(`${itemTypeToMove} moved successfully`);
        setFileSystem(updatedFileSystem);
        // Clear the moved item from its original location in the UI
        if (itemTypeToMove === 'summary') {
            setSummary('');
        } else if (itemTypeToMove === 'lesson') {
            setLesson('');
        } else if (itemTypeToMove === 'terms') {
            setFlashCards([]);
        }
    }).catch((error) => {
        console.error(`Error moving ${itemTypeToMove}:`, error);
    });
  };

  const updateNote = () => {
    console.log("Updating item:", { noteName, currentLocation, pathToNote });
    let updatedFileSystem = JSON.parse(JSON.stringify(fileSystem)); // Deep copy

    const newItem = {
        name: noteName,
        type: type,
        content: savedNote,
        summary: summary,
        lesson: lesson,
        terms: flashCards,
        test: []
    };

    console.log("New item to save:", newItem);

    const updateItemInArray = (items) => {
        const index = items.findIndex(item => item.name === noteName && item.type === newItem.type);
        if (index !== -1) {
            items[index] = newItem;
        } else {
            items.push(newItem);
        }
        return items;
    };

    if (pathToNote && pathToNote.length > 0) {
        const updateItemAtPath = (items, pathIndex) => {
            if (pathIndex === pathToNote.length) {
                return updateItemInArray(items);
            }

            const folder = items.find(item => item.name === pathToNote[pathIndex] && item.type === "folder");
            const document = items.find(item => item.name === pathToNote[pathIndex] && item.type === "document");

            if (folder) {
                folder.content = updateItemAtPath(folder.content, pathIndex + 1);
            } else if (document) {
                document.notes = updateItemAtPath(document.notes, pathIndex + 1);
            } else {
                console.error("Path not found:", pathToNote.slice(0, pathIndex + 1));
            }
            return items;
        };

        updatedFileSystem = updateItemAtPath(updatedFileSystem, 0);
    } else {
        updatedFileSystem = updateItemInArray(updatedFileSystem);
    }

    console.log("Updated file system:", updatedFileSystem);

    updateDoc(docRef, {
        profile: {
            email: authUser.email,
            root: updatedFileSystem
        }
    }).then(() => {
        console.log("Successful Save");
        setFileSystem(updatedFileSystem);
    }).catch((error) => {
        console.error("Error updating document:", error);
    });

    setInitialValues(currentValues);
  };

  const readData = async () => {
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

  useEffect(() => {
    readData()
  }, [])

  useEffect(() => {
    console.log(currentQuestion)
  }, [currentQuestion])

  useEffect(() => {
    setCurrentValues({note: savedNote, summary: summary, lesson: lesson, terms: flashCards})
  }, [savedNote, summary, lesson, flashCards, currentLocation])

  return (
    <div className="dashboard">
      {currentLocation === 'summary-page' &&
        <nav className="navbar">
            <h1 className='nav-heading'>Summary</h1>
            <div className='nav-button-container'>
              <button className="nav-button" onClick={() => setCurrentLocation("note-page")}>Back to Notes</button>
              <button className="nav-button" onClick={() => setCurrentLocation("lesson-page")}>Lesson</button>
              <button className="nav-button"  onClick={() => setCurrentLocation("flash-cards-page")} >Memorize with Flash Cards</button>
              <button className="nav-button" onClick={() => setCurrentLocation("multiple-choice-page")}>Test Your Knowledge with MCQs</button>
            </div>
        </nav>
      }
      {currentLocation === 'lesson-page' &&
        <nav className="navbar">
            <h1 className='nav-heading'>Lesson</h1>
            <div className='nav-button-container'>
              <button className="nav-button" onClick={() => setCurrentLocation("note-page")}>Back to Notes</button>
              <button className="nav-button" onClick={() => setCurrentLocation("summary-page")}>Summary</button>
              <button className="nav-button"  onClick={() => setCurrentLocation("flash-cards-page")} >Memorize with Flash Cards</button>
              <button className="nav-button" onClick={() => setCurrentLocation("multiple-choice-page")}>Test Your Knowledge with MCQs</button>
            </div>
        </nav>
      }
      {currentLocation === 'multiple-choice-page' &&
        <nav className="navbar">
            <h1 className='nav-heading'>Multiple Choice Questions</h1>
            <div className='nav-button-container'>
              <button className="nav-button" onClick={() => setCurrentLocation("note-page")}>Back to Notes</button>
              <button className="nav-button" onClick={() => setCurrentLocation("summary-page")}>Summary</button>
              <button className="nav-button" onClick={() => setCurrentLocation("lesson-page")}>Lesson</button>
              <button className="nav-button"  onClick={() => setCurrentLocation("flash-cards-page")} >Memorize with Flash Cards</button>
            </div>
        </nav>
      }
      {currentLocation === 'flash-cards-page' &&
        <nav className="navbar">
            <h1 className='nav-heading'>Flash Cards</h1>
            <div className='nav-button-container'>
              <button className="nav-button" onClick={() => setCurrentLocation("note-page")}>Back to Notes</button>
              <button className="nav-button" onClick={() => setCurrentLocation("summary-page")}>Summary</button>
              <button className="nav-button" onClick={() => setCurrentLocation("lesson-page")}>Lesson</button>
              <button className="nav-button"  onClick={() => setCurrentLocation("multiple-choice-page")} >Test Your Knowledge with MCQs</button>
            </div>
        </nav>
      }
      <div className={`main-body ${currentLocation === 'note-page' || currentLocation === 'menu-page' ? 'note-page' : 'other-page'}`}>
        {currentLocation === 'note-page' && <Note 
          savedNote={savedNote} 
          setSavedNote={setSavedNote} 
          setCurrentLocation={setCurrentLocation} 
          pdfFile={pdfFile} 
          setPdfFile={setPdfFile} 
          setIsPdfSummary={setIsPdf}
          setIsPdfLesson={setIsPdf}
        />}
        {currentLocation === 'lesson-page' && 
          <div className='summary-box'>
            <div className="back-drop-summary"></div>
            <Lesson 
              pdfFile={pdfFile}
              savedNote={savedNote}
              isPdfLesson={isPdf}
              lesson={lesson}
              setLesson={setLesson}
              setCurrentLocation={setCurrentLocation}
              setMessageToChat={setMessageToChat}
            />
          </div>
        }
        {currentLocation === 'summary-page' && 
          <div className='summary-box'>
            <div className='back-drop-summary'></div>
            <Summary 
              pdfFile={pdfFile} 
              savedNote={savedNote} 
              isPdfSummary={isPdf} 
              summary={summary} 
              setSummary={setSummary} 
              setMessageToChat={setMessageToChat}
            />
          </div>
        }
        {currentLocation === 'flash-cards-page' && 
          <FlashCards
            note={savedNote}
            summary={summary}
            lesson={lesson}
            flashCards={flashCards}
            setFlashCards={setFlashCards}
            currentFlashCard={currentFlashCard}
            setCurrentFlashCard={setCurrentFlashCard}
            lookingAtTerm={lookingAtTerm}
            setLookingAtTerm={setLookingAtTerm} 
          />
        }
        {currentLocation === 'multiple-choice-page' && 
          <div className='mcq-box'>
            <div className='back-drop-mcq'></div>
            <MultipleChoice 
              note={savedNote} 
              setCurrentQuestion={setCurrentQuestion} 
              answersSelected={answersSelected} 
              setAnswersSelected={setAnswersSelected} 
              summary={summary}
              lesson={lesson}
            />
          </div>
        }
        {currentLocation === 'menu-page' && <Menu 
          authUser={authUser}
          docRef={docRef}
          setCurrentLocation={setCurrentLocation}
          fileSystem={fileSystem}
          setFileSystem={setFileSystem}
          setSavedNote={setSavedNote}
          setSummary={setSummary}
          setLesson={setLesson}
          setFlashCards={setFlashCards}
          setNoteName={setNoteName}
          setPathToNote={setPathToNote}
          setInitialValues={setInitialValues}
          setType={setType}
          path={path}
          setPath={setPath}
        />}
        {(currentLocation !== 'note-page' && currentLocation !== 'menu-page') && <Chatbot 
          note={savedNote} 
          currentQuestion={currentQuestion} 
          answersSelected={answersSelected} 
          summary={summary}
          lesson={lesson}
          currentLocation={currentLocation} 
          messageToChat={messageToChat}
          currentFlashCard={currentFlashCard}
          lookingAtTerm={lookingAtTerm}
        />}
      </div>
      {currentLocation !== 'menu-page' &&
      <div className="directory-buttons">
        <button 
          className="main-save-button" 
          disabled={initialValues.note === currentValues.note && initialValues.summary === currentValues.summary && initialValues.lesson === currentValues.lesson && initialValues.terms === currentValues.terms} 
          onClick={updateNote}>Save</button>
        <button className="main-back-button" onClick={() => setCurrentLocation("menu-page")}>Back</button>
        {type === "note" && <button className="move-button" onClick={() => {
          setNoteToMove({
            name: noteName,
            type: "note",
            content: savedNote,
            summary: summary,
            lesson: lesson,
            terms: flashCards,
            test: []
          });
          setShowMoveNotePopup(true);
        }}>Move</button>}
        {showMoveNotePopup && (
          <MoveNotePopup
            onClose={() => setShowMoveNotePopup(false)}
            onMove={handleMoveItem}
            fileSystem={fileSystem}
            currentItem={{
              name: noteName,
              type: currentLocation.replace('-page', ''),
              content: savedNote,
              summary: summary,
              lesson: lesson,
              terms: flashCards
            }}
          />
        )}
      </div>
      }
    </div>
  )
} 

export default Dashboard