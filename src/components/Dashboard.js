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
import Space from './Space';

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
  const [isNewSpace, setIsNewSpace] = useState(false)
  const [spaceID, setSpaceID] = useState("")

  const [document, setDocument] = useState("")
  const [name, setName] = useState("")
  const [terms, setTerms] = useState([])
  const [summaries, setSummaries] = useState([])
  const [lessons, setLessons] = useState([])
  const [spaces, setSpaces] = useState([])
  const [fileSystem, setFileSystem] = useState("")
  const [pathToNote, setPathToNote] = useState("")
  const [noteName, setNoteName] = useState("")
  const [initialValues, setInitialValues] = useState({note: "", summary: "", lesson: "", terms: []})
  const [currentValues, setCurrentValues] = useState({note: "", summary: "", lesson: "", terms: []})

  const docRef = doc(db, "users", authUser.uid)

  const updateNote = () => {
    let updatedFileSystem = JSON.parse(JSON.stringify(fileSystem)); // Deep copy
    const newNote = {
        name: noteName,
        type: "note",
        content: savedNote,
        summary: summary,
        lesson: lesson,
        terms: flashCards,
        test: []
    };

    if (pathToNote && pathToNote.length > 0) {
        // Function to recursively traverse the file system
        const updateNoteAtPath = (items, pathIndex) => {
            if (pathIndex === pathToNote.length) {
                // Find the index of the existing note with the same name
                const noteIndex = items.findIndex(item => item.name === noteName && item.type === "note");
                if (noteIndex !== -1) {
                    // Replace the existing note
                    items[noteIndex] = newNote;
                } else {
                    console.error("Note does not exist")
                }
                return items;
            }
            const folder = items.find(item => item.name === pathToNote[pathIndex] && item.type === "folder");
            if (folder) {
                folder.content = updateNoteAtPath(folder.content, pathIndex + 1);
            }
            return items;
        };

        updatedFileSystem = updateNoteAtPath(updatedFileSystem, 0);
    } else {
        // If no path, replace or add to root
        const noteIndex = updatedFileSystem.findIndex(item => item.name === noteName && item.type === "note");
        if (noteIndex !== -1) {
            // Replace the existing note
            updatedFileSystem[noteIndex] = newNote;
        } else {
            console.error("Note does not exist")
        }
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
    console.log(initialValues.note === currentValues.note && initialValues.summary === currentValues.summary && initialValues.lesson === currentValues.lesson && initialValues.terms === currentValues.terms)
  }, [savedNote, summary, lesson, flashCards])

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
      <div className={`main-body ${currentLocation === 'note-page' ? 'note-page' : 'other-page'}`}>
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
          setIsNewSpace={setIsNewSpace}
          spaces={spaces}
          setSpaceID={setSpaceID}
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
        {currentLocation === 'space-page' && <Space 
          authUser={authUser}
          docRef={docRef}
          setCurrentLocation={setCurrentLocation}
          isNewSpace={isNewSpace}
          setIsNewSpace={setIsNewSpace}
          name={name}
          setName={setName}
          document={document}
          setDocument={setDocument}
          terms={terms}
          setTerms={setTerms}
          summaries={summaries}
          setSummaries={setSummaries}
          lessons={lessons}
          setLessons={setLessons}
          spaces={spaces}
          setSpaces={setSpaces}
          spaceID={spaceID}
          setSpaceID={setSpaceID}
        />}
        {(currentLocation !== 'note-page' && currentLocation !== 'menu-page' && currentLocation !== 'space-page') && <Chatbot 
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
      <button 
        className="main-save-button" 
        disabled={initialValues.note === currentValues.note && initialValues.summary === currentValues.summary && initialValues.lesson === currentValues.lesson && initialValues.terms === currentValues.terms} 
        onClick={updateNote}>Save</button>
      }
    </div>
  )
}

export default Dashboard