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
import Test from './Test';

const Dashboard = ({ authUser }) => {
  const [pdfFile, setPdfFile] = useState(null);
  const [savedNote, setSavedNote] = useState("")
  const [currentQuestion, setCurrentQuestion] = useState("")
  const [answersSelected, setAnswersSelected] = useState([])
  const [currentLocation, setCurrentLocation] = useState('test-page')
  const [summary, setSummary] = useState('')
  const [lesson, setLesson] = useState('')
  const [flashCards, setFlashCards] = useState("")
  const [test, setTest] = useState("")
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

  const handleMoveItem = (item, destinationPath, itemTypeToMove) => {
    let updatedFileSystem = JSON.parse(JSON.stringify(fileSystem)); // Deep copy
    let content = null
    let l = null
    let s = null
    let t = null
    if (itemTypeToMove !== "note"){
      content = item[itemTypeToMove]
    } else {
      content = item.content
      l = item.lesson
      s = item.summary
      t = item.terms
    }
    let itemName = item.name
    console.log(item.name)
    // Function to add the item to the new location
    const addItem = (items, pathIndex = 0) => {
        if (pathIndex === destinationPath.length - 1) {
            return items.map(docItem => {
                if (docItem.type === 'document' && docItem.name === destinationPath[pathIndex]) {
                        return {
                            ...docItem,
                            notes: [...docItem.notes, {name: itemName, content: content, lesson: l, summary: s, terms: t, test: [], type: "note"}]
                        }
                } else if (docItem.type === 'note' && docItem.name === destinationPath[pathIndex]) {
                  return {
                    ...docItem,
                    [itemTypeToMove]: content
                  }
                } else if (docItem.type === 'folder' && docItem.name === destinationPath[pathIndex] && itemTypeToMove !== "note") {
                    const newItem = {
                      name: itemName,
                      type: itemTypeToMove
                  } 

                    if (itemTypeToMove === 'terms') {
                      newItem.terms = content;
                  } else if (itemTypeToMove === 'test') {
                      newItem.questions = content;
                  } else if (itemTypeToMove === 'lesson') {
                      newItem.lesson = content
                  } else if (itemTypeToMove === 'summary') {
                      newItem.summary = content
                  }

                  return {
                    ...docItem,
                    content: [...docItem.content, newItem]
                  }
                } else if (docItem.type === 'folder' && docItem.name === destinationPath[pathIndex] && itemTypeToMove === "note") {
                  const newItem = {
                    name: itemName,
                    type: "note",
                    content: content,
                    summary: s,
                    lesson: l,
                    terms: t,
                    test: []
                } 

                return {
                  ...docItem,
                  content: [...docItem.content, newItem]
                }
                }
                return docItem;
            });
        }
        return items.map(docItem => {
            if (docItem.name === destinationPath[pathIndex]) {
                if (docItem.type === 'folder') {
                    return { ...docItem, content: addItem(docItem.content, pathIndex + 1) };
                } else if (docItem.type === 'document') {
                    return { ...docItem, notes: addItem(docItem.notes, pathIndex + 1) };
                }
            }
            return docItem;
        });
    };

    const deleteNote = (items) => {
      return items.map(docItem => {
        if (docItem.type === "document" && docItem.notes) {
          return {
            ...docItem,
            notes: docItem.notes.filter(note => {return note.name !== itemName || note.content !== content})
          }
        } else if (docItem.type === "folder") {
          return {...docItem, content: deleteNote(docItem.content)}
        } else if (docItem.type === "note") {
          if (docItem.name === itemName && docItem.content === content) {
            return null
          } else {
            return docItem
          }
        } else {
          return docItem
        }
      }).filter(item => item !== null)
    }

    const deleteItem = (items) => {
      return items.map(docItem => {
        if (docItem.type === "document" && docItem.notes) {
          return {
            ...docItem,
            notes: deleteItem(docItem.notes)
          }
        } else if (docItem.type === "folder") {
          return {...docItem, content: deleteItem(docItem.content)}
        } else if (docItem.type === "note") {
          if (docItem.name === itemName) {
            return {
              ...docItem,
              [itemTypeToMove]: ""
            }
          } else {
            return docItem
          }
        } else if (docItem.type === itemTypeToMove) {
          if (docItem.name === itemName) {
            return null
          }
          else {
            return docItem
          }
        }
        else {
          return docItem
        }
      }).filter(item => item !== null)
    }

    if (itemTypeToMove === "note"){
      updatedFileSystem = deleteNote(updatedFileSystem)
    } else {
      updatedFileSystem = deleteItem(updatedFileSystem)
    }
    updatedFileSystem = addItem(updatedFileSystem)
    console.log(updatedFileSystem)

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
      {currentLocation === 'test-page' &&
        <nav className="navbar">
            <h1 className='nav-heading'>Test</h1>
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
        />}
        {currentLocation === 'lesson-page' && 
          <div className='summary-box'>
            <div className="back-drop-summary"></div>
            <Lesson 
              pdfFile={pdfFile}
              savedNote={savedNote}
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
        {currentLocation === 'test-page' && <Test 
          note={savedNote}
          test={test}
          setTest={setTest}
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