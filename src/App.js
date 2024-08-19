import React, { useState, useEffect } from 'react';
import './App.css';
import NoteEntry from './components/NoteEntry';
import MultipleChoice from './components/MultipleChoice';
import Chatbot from './components/Chatbot';

const App = () => {
  const [savedNote, setSavedNote] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [answersSelected, setAnswersSelected] = useState([]);

  useEffect(() => {
    console.log("change")
    console.log(currentQuestion)
    console.log("c")
  }, [currentQuestion])

  return (
    <div className="app">
      <NoteEntry savedNote={savedNote} setSavedNote={setSavedNote} />
      <MultipleChoice note={savedNote} setCurrentQuestion={setCurrentQuestion} answersSelected={answersSelected} setAnswersSelected={setAnswersSelected} />
      <Chatbot note={savedNote} currentQuestion={currentQuestion} answersSelected={answersSelected} />
    </div>
  );
};

export default App;