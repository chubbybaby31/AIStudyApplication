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

  const [fileSystem, setFileSystem] = useState("")
  const [pathToNote, setPathToNote] = useState("")
  const [noteName, setNoteName] = useState("")
  const [initialValues, setInitialValues] = useState({note: "", summary: "", lesson: "", terms: []})
  const [currentValues, setCurrentValues] = useState({note: "", summary: "", lesson: "", terms: []})

  const docRef = doc(db, "users", authUser.uid)

  const updateNote = () => {
    console.log("Updating item:", { noteName, currentLocation, pathToNote });
    let updatedFileSystem = JSON.parse(JSON.stringify(fileSystem)); // Deep copy
    
    const getItemType = () => {
        switch (currentLocation) {
            case 'lesson-page': return 'lesson';
            case 'summary-page': return 'summary';
            case 'flash-cards-page': return 'terms';
            default: return 'note';
        }
    };

    const newItem = {
        name: noteName,
        type: getItemType(),
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
      </div>
      }
    </div>
  )
}

export default Dashboard