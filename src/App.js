import React, { useState, useEffect } from 'react'
import './App.css'
import Note from './components/Note'
import MultipleChoice from './components/MultipleChoice'
import Chatbot from './components/Chatbot'
import Summary from './components/Summary'
import Lesson from './components/Lesson'
import FlashCards from './components/FlashCards'

const App = () => {
  const [savedNote, setSavedNote] = useState("")
  const [currentQuestion, setCurrentQuestion] = useState("")
  const [answersSelected, setAnswersSelected] = useState([])
  const [currentLocation, setCurrentLocation] = useState('note-page')

  useEffect(() => {
    console.log(currentQuestion)
  }, [currentQuestion])

  return (
    <div className="app">
      {currentLocation === 'note-page' && <Note savedNote={savedNote} setSavedNote={setSavedNote} />}
      {currentLocation === 'lesson-page' && <Lesson />}
      {currentLocation === 'summary-page' && <Summary />}
      {currentLocation === 'flash-cards-page' && <FlashCards />}
      {currentLocation === 'multiple-choice-page' && <MultipleChoice note={savedNote} setCurrentQuestion={setCurrentQuestion} answersSelected={answersSelected} setAnswersSelected={setAnswersSelected} />}
      {currentLocation !== 'note-page' && <Chatbot note={savedNote} currentQuestion={currentQuestion} answersSelected={answersSelected} />}
    </div>
  )
}

export default App