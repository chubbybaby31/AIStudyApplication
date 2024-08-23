import React, { useState, useEffect, useRef } from 'react'
import './Chatbot.css'
import {ReactComponent as SendIcon} from '../assets/icons/send-icon.svg'

const Chatbot = ({ note, currentQuestion, answersSelected, summary, lesson, currentLocation, messageToChat, currentFlashCard, lookingAtTerm}) => {
  const [messages, setMessages] = useState([
    {
        role: 'user',
        parts: [
          {
            text: `System prompt: You are a teacher who is helping students learn a specific subject. 
            The student will ask you questions about notes they took on the subject and questions they have. 
            They may also ask for help when they are stuck on a question. They could also ask for help understanding a part of a lesson or summary.
            They may even ask for help on ways to memorize/remember a certain flash card better.
            However, remember you are built into a web application and you must know which page the user is on in order to properly help them.
            You will be provided with the page. It will be one of the following: summary-page, lesson-page, multiple-choic-page, or flash-card-page.
            Each indicate what information is displayed on the screen.
            If they ask for help on a question, do not merely give them the answer unless they ask for it specifically.
            Instead, provide them with guidance on how to solve the question and explain/teach to them any terms/concepts they may not understand.
            Remember, do not give the answer away unless they specifically ask for it. 
            Do not ask them to look back at the notes as they do not have access to it anymore, instead re-teach them the concepts.
            Additionally, do not blatantly hint at which option is the correct answer. This means do not show bias towards an answer choice.
            If organization is needed, you can split the response into subsections with subtitles, but be sure to use HTML tags/formatting to do so.
            Make sure your response does not at all include * or # and instead uses HTML tags to convey the same formatting. To remind you: <b> or <strong> is used for bolding,
            <li> is used for a bullet point, and <p> is used for a paragraph. Please use those tags and other HTML tags rather than the #'s and the *'s.
            Once again, please prioritize not including any pound sybols (#) or astrix symbols (*) in your response.`,
          },
        ],
      },
      {
        role: 'model',
        parts: [{ text: 'Understood.' }],
      },
  ])
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null);

  const handleInputChange = (e) => {
    setInput(e.target.value)
  }

  const handleSendMessage = async () => {
    if (input.trim()) {
      const userMessage = { role: 'user', parts: [{text: input}] }
      setMessages([...messages, userMessage])
      let temp_input = input
      setInput('')
      try {
        const response = await fetch('http://localhost:8000/gemini', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            history: messages,
            message: `Context: Note - ${note}, Current Question - ${JSON.stringify(currentQuestion)}, Answer Choices Selected Already from first to most recent - ${JSON.stringify(answersSelected)}, Summary - ${summary}, Lesson - ${lesson}, Current location on website - ${currentLocation}, Current Flash Card - ${JSON.stringify(currentFlashCard)}, Looking at the term of flash card - ${lookingAtTerm}. User Query: ${temp_input}`
          })
        })

        const botResponse = await response.text()
        const botMessage = { role: 'model', parts: [{text: botResponse}] }
        setMessages([...messages, userMessage, botMessage])
      } catch (error) {
        console.error('Error communicating with chatbot:', error)
      }

    }
  }

  const sendMessageFromHighlight = async () => {
    if (messageToChat.trim()) {
      const userMessage = { role: 'user', parts: [{text: messageToChat}] }
      setMessages([...messages, userMessage])
      try {
        const response = await fetch('http://localhost:8000/gemini', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            history: messages,
            message: `Context: Note - ${note}, Current Question - ${JSON.stringify(currentQuestion)}, Answer Choices Selected Already from first to most recent - ${JSON.stringify(answersSelected)}, Summary - ${summary}, Current location on website - ${currentLocation}. Always assume that the user is asking a follow-up from their previous query. However, if it is clear that they are not then answer their question with the context provided. User Query: ${messageToChat}`
          })
        })

        const botResponse = await response.text()
        const botMessage = { role: 'model', parts: [{text: botResponse}] }
        setMessages([...messages, userMessage, botMessage])
      } catch (error) {
        console.error('Error communicating with chatbot:', error)
      }

    }
  }

  useEffect(() => {
    sendMessageFromHighlight()
  }, [messageToChat])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault() // Prevent the default action (like adding a new line)
      handleSendMessage()
    }
  }

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const formatResponseText = (text) => {
    // Replace **text** with <b>text</b> for bold
    text = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    text = text.replace(/\*(.*?)\*/g, '<b>$1</b>');

    // Replace # text with <h1>text</h1>, ## text with <h2>text</h2>, and ### text with <h3>text</h3>
    text = text.replace(/^(#{1,6})\s*(.*?)$/gm, (match, hashes, content) => {
        const level = hashes.length; // Count the number of hashes
        return `<h${level}>${content.trim()}</h${level}>`; // Return the corresponding heading
    });

    // Handle bullet points
    const lines = text.split('\n'); // Split by line
    let formattedText = '<ul>'; // Start an unordered list

    lines.forEach(line => {
        if (line.trim().startsWith('* ')) {
            // If the line starts with '* ', treat it as a bullet point
            const bulletPoint = line.replace(/^\*\s*/, ''); // Remove the '* ' from the start
            formattedText += `<li>${bulletPoint.trim()}</li>`; // Add it as a list item
        } else {
            // For non-bullet lines, just add them as paragraphs
            formattedText += `<p>${line.trim()}</p>`;
        }
    });

    formattedText += '</ul>'; // Close the unordered list

    return formattedText;
  };

  return (
    <div className="chatbot">
      <div className="chatbox">
        <div className="messages">
        {messages.slice(2).map((message, index) => (
            <div key={index} className={`message ${message.role}`} dangerouslySetInnerHTML={{ __html: formatResponseText(message.parts[0].text) }} />
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="input-container">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Type a message..."
            onKeyDown={handleKeyDown}
          />
          <button className='send-button' onClick={handleSendMessage}><SendIcon className='send-icon' /></button>
        </div>
      </div>
      {/* <div className='back-drop'></div> */}
    </div>
  )
}

export default Chatbot