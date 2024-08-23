import React, { useState, useEffect } from 'react'
import './Dashboard.css'
import Note from './Note'
import MultipleChoice from './MultipleChoice'
import Chatbot from './Chatbot'
import Summary from './Summary'
import Lesson from './Lesson'
import FlashCards from './FlashCards'

const Dashboard = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [savedNote, setSavedNote] = useState("")
  const [currentQuestion, setCurrentQuestion] = useState("")
  const [answersSelected, setAnswersSelected] = useState([])
  const [currentLocation, setCurrentLocation] = useState('note-page')
  const [isPdf, setIsPdf] = useState(false)
  const [summary, setSummary] = useState('')
  const [lesson, setLesson] = useState('')
  const [flashCards, setFlashCards] = useState("")
  const [currentFlashCard, setCurrentFlashCard] = useState({'term': 'Generate flash cards to see them here...', 'definition': 'Generate flash cards to see them here...'})
  const [lookingAtTerm, setLookingAtTerm] = useState(true)
  const [messageToChat, setMessageToChat] = useState("")

  useEffect(() => {
    console.log(currentQuestion)
  }, [currentQuestion])

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
        {currentLocation !== 'note-page' && <Chatbot 
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
    </div>
  )
}

export default Dashboard