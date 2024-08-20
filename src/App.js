import React, { useState, useEffect } from 'react'
import './App.css'
import Note from './components/Note'
import MultipleChoice from './components/MultipleChoice'
import Chatbot from './components/Chatbot'
import Summary from './components/Summary'
import Lesson from './components/Lesson'
import FlashCards from './components/FlashCards'

const App = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [savedNote, setSavedNote] = useState("")
  const [currentQuestion, setCurrentQuestion] = useState("")
  const [answersSelected, setAnswersSelected] = useState([])
  const [currentLocation, setCurrentLocation] = useState('note-page')
  const [isPdfSummary, setIsPdfSummary] = useState(false)
  const [isPdfLesson, setIsPdfLesson] = useState(false)
  const [summary, setSummary] = useState('')
  const [lesson, setLesson] = useState('')
  const [messageToChat, setMessageToChat] = useState("")

  useEffect(() => {
    console.log(currentQuestion)
  }, [currentQuestion])

  return (
    <div className="app">
      {currentLocation !== 'note-page' &&
        <nav className="navbar">
            <h1 className='nav-heading'>Summary</h1>
            <div className='nav-button-container'>
              <button className="nav-button" onClick={() => setCurrentLocation("note-page")}>Back to Notes</button>
                <div className="dropdown">
                    <button className="nav-button">Next Steps</button>
                    <div className="dropdown-content">
                        <button onClick={() => setCurrentLocation("flash-cards-page")} >Memorize with Flashcards</button>
                        <button onClick={() => setCurrentLocation("multiple-choice-page")}>Test Your Knowledge with MCQs</button>
                    </div>
                </div>
            </div>
        </nav>
      }
      <div className='main-body'>
        {currentLocation === 'note-page' && <Note 
          savedNote={savedNote} 
          setSavedNote={setSavedNote} 
          setCurrentLocation={setCurrentLocation} 
          pdfFile={pdfFile} 
          setPdfFile={setPdfFile} 
          setIsPdfSummary={setIsPdfSummary}
          setIsPdfLesson={setIsPdfLesson}
        />}
        {currentLocation === 'lesson-page' && <Lesson 
          pdfFile={pdfFile}
          savedNote={savedNote}
          isPdfLesson={isPdfLesson}
          lesson={lesson}
          setLesson={setLesson}
          setCurrentLocation={setCurrentLocation}
          setMessageToChat={setMessageToChat}
        />}
        {currentLocation === 'summary-page' && 
          <div className='summary-box'>
            <div className='back-drop-summary'></div>
            <Summary 
              pdfFile={pdfFile} 
              savedNote={savedNote} 
              isPdfSummary={isPdfSummary} 
              summary={summary} 
              setSummary={setSummary} 
              setMessageToChat={setMessageToChat}
            />
          </div>
        }
        {currentLocation === 'flash-cards-page' && <FlashCards />}
        {currentLocation === 'multiple-choice-page' && <MultipleChoice 
          note={savedNote} 
          setCurrentQuestion={setCurrentQuestion} 
          answersSelected={answersSelected} 
          setAnswersSelected={setAnswersSelected} 
          summary={summary}
          lesson={lesson}
        />}
        {currentLocation !== 'note-page' && <Chatbot 
          note={savedNote} 
          currentQuestion={currentQuestion} 
          answersSelected={answersSelected} 
          summary={summary}
          lesson={lesson}
          currentLocation={currentLocation} 
          messageToChat={messageToChat}
        />}
      </div>
    </div>
  )
}

export default App