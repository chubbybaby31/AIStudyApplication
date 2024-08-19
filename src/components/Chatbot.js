import React, { useState, useEffect } from 'react'
import './Chatbot.css'

const Chatbot = ({ note, currentQuestion, answersSelected }) => {
  const [messages, setMessages] = useState([
    {
        role: 'user',
        parts: [
          {
            text: `System prompt: You are a teacher who is helping students learn a specific subject. 
            The student will ask you questions about notes they took on the subject and questions they have. 
            They may also ask for help when they are stuck on a question.
            If they ask for help on a question, do not merely give them the answer unless they ask for it specifically.
            Instead, provide them with guidance on how to solve the question and explain/teach to them any terms/concepts they may not understand.`,
          },
        ],
      },
      {
        role: 'model',
        parts: [{ text: 'Understood.' }],
      },
  ])
  const [input, setInput] = useState('')

  const handleInputChange = (e) => {
    setInput(e.target.value)
  }

  const handleSendMessage = async () => {
    if (input.trim()) {
      const userMessage = { role: 'user', parts: [{text: input}] }
      setMessages([...messages, userMessage])

      try {
        const response = await fetch('http://localhost:8000/gemini', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            history: messages,
            message: `Context: Note - ${note}, Current Question - ${JSON.stringify(currentQuestion)}, Answer Choices Selected Already from first to most recent - ${JSON.stringify(answersSelected)}. User Query: ${input}`
          })
        })

        const botResponse = await response.text()
        const botMessage = { role: 'model', parts: [{text: botResponse}] }
        setMessages([...messages, userMessage, botMessage])
      } catch (error) {
        console.error('Error communicating with chatbot:', error)
      }

      setInput('')
    }
  }

  return (
    <div className="chatbot">
      <div className="chatbox">
        <div className="messages">
          {messages.slice(2).map((message, index) => (
            <div key={index} className={`message ${message.role}`}>
              {message.parts[0].text}
            </div>
          ))}
        </div>
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Type a message..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  )
}

export default Chatbot