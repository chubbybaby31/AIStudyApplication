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
  const [summary, setSummary] = useState('')
  const [messageToChat, setMessageToChat] = useState("")

  useEffect(() => {
    console.log(currentQuestion)
  }, [currentQuestion])

  return (
    <div className="app">
      {currentLocation === 'note-page' && <Note 
        savedNote={savedNote} 
        setSavedNote={setSavedNote} 
        setCurrentLocation={setCurrentLocation} 
        pdfFile={pdfFile} 
        setPdfFile={setPdfFile} 
        setIsPdfSummary={setIsPdfSummary}
        setMessageToChat={setMessageToChat}
      />}
      {currentLocation === 'lesson-page' && <Lesson />}
      {currentLocation === 'summary-page' && <Summary 
        pdfFile={pdfFile} 
        savedNote={savedNote} 
        isPdfSummary={isPdfSummary} 
        summary={summary} 
        setSummary={setSummary} 
        setCurrentLocation={setCurrentLocation}
        setMessageToChat={setMessageToChat}
      />}
      {currentLocation === 'flash-cards-page' && <FlashCards />}
      {currentLocation === 'multiple-choice-page' && <MultipleChoice note={savedNote} setCurrentQuestion={setCurrentQuestion} answersSelected={answersSelected} setAnswersSelected={setAnswersSelected} />}
      {currentLocation !== 'note-page' && <Chatbot 
        note={savedNote} 
        currentQuestion={currentQuestion} 
        answersSelected={answersSelected} 
        summary={summary} 
        currentLocation={currentLocation} 
        messageToChat={messageToChat}
      />}
    </div>
  )
}

export default App