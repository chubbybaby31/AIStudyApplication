import React, { useState, useEffect } from 'react';
import './MultipleChoice.css';

const MultipleChoice = ({ note, summary, lesson, setCurrentQuestion, answersSelected, setAnswersSelected }) => {
  const [startMCQ, setStartMCQ] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [question, setQuestion] = useState({ Question: null });
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchNewQuestion, setFetchNewQuestion] = useState(false);
  const numToChar = ['A', 'B', 'C', 'D'];

  let messageSent = "";
  let inQuestion = true;

  useEffect(() => {
    // Automatically start MCQ when the component mounts
    setStartMCQ(true);
  }, []);

  const getInitialQuestions = async () => {
    try {
      const options = {
        method: 'POST',
        body: JSON.stringify({
          history: chatHistory,
          message: `Here are the notes: ${note}, Here is the summary ${summary}, Here is the lesson ${lesson}. Now provide one question.`
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      };
      messageSent = `Here are the notes: ${note}, Here is the summary ${summary}, Here is the lesson ${lesson}. Now provide one question.`;
      const response = await fetch('http://localhost:8000/gemini', options);
      const q = await response.text();
      setQuestion(JSON.parse(q));
    } catch (error) {
      setQuestion({ Question: null });
    }
  };

  const getNewQuestion = async () => {
    try {
      const options = {
        method: 'POST',
        body: JSON.stringify({
          history: chatHistory,
          message: 'NEXT QUESTION {' + (selectedAnswer === correctAnswer ? 'CORRECT' : 'INCORRECT') + '}',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      };
      messageSent = 'NEXT QUESTION {' + (selectedAnswer === correctAnswer ? 'CORRECT' : 'INCORRECT') + '}';
      const response = await fetch('http://localhost:8000/gemini', options);
      const q = await response.text();
      setQuestion(JSON.parse(q));
    } catch (error) {
      setQuestion({ Question: null });
    }
  };

  useEffect(() => {
    if (startMCQ) {
      const initialChatHistory = [
        {
          role: 'user',
          parts: [
            {
              text: 'System prompt: You are a teacher who is helping students learn a specific subject. The student will provide on or multiple of the following: notes, summary, and/or a lesson for you to teach them. When you get the notes/summary/lesson you should give a difficult multiple choice question based solely on the information within the content provided to you. In addition, you should provide explanations for each answer choice as to why they are correct or incorrect. The format of this should be a dictionary similar to this example: {Question: Which type of rain is characterized by short, intense bursts?, Choices: [{text: Drizzle, correct: false, explanation: Drizzle is known for its light and continuous nature.}, {text: Shower, correct: true, explanation: Showers are defined by their short duration and intense rainfall.}, {text: Torrential, correct: false, explanation: Torrential rain refers to heavy, prolonged rainfall.}, {text: Monsoon, correct: false, explanation: Monsoon is a seasonal pattern of wind and rain, not a specific type of rain.}]} Obviously, your response should not be related to rain unless the notes are about rain. Use the example as a strict format as to how to respond with the question. Do not feel obligated to make the questions similar to this question. It does not have to be a question about the characteristic or something like that. It can be about anything from the content provided. In fact, it would actually be better if it was not a simple question that asks what is a characteristic... or which of the following is not...',
            },
          ],
        },
        {
          role: 'model',
          parts: [{ text: 'Understood.' }],
        },
        {
          role: 'user',
          parts: [
            {
              text: 'System prompt: In addition to this, when the student sends "NEXT QUESTION {RESULT}" you should provide another multiple choice question. The {RESULT} will be filled with either correct or incorrect to represent the student\'s answer. If they got it correct, provide them with a harder question up to an extent, and if they got it incorrect provide them with an easier question. Refrain from repeating questions or providing choices that are not relevant to the content provided. Additionally, do not say "as stated by the notes" or something along those lines. Also, make the questions about the subject of the notes/summary/lesson and not about if they contain something or not. In addition to that, in the explanation do not say "as seen in the notes" or something along those lines. Also ensure that you do not repeat questions.',
            },
          ],
        },
        {
          role: 'model',
          parts: [{ text: 'Understood.' }],
        },
        {
          role: 'user',
          parts: [
            {
              text: 'Make sure the response given only contains the question, answer choices, explanations, and if they\'re correct or incorrect. Do not include the format template I have given you in the response. Also do not include correct or incorrect in the explanations. Also make sure there are always exactly 4 answer choices and each one has an explanation. Also, try to make the questions more conceptual and application-based rather than something that asks questions that can be answered from memorization. However, despite me saying this, do not purely make all the questions hypothetical situations, you can also generate some simple objective ones. Also make sure that you follow the format and provide whether an answer choice is correct or not. Ensure that each question has one and exactly one correct answer. In addition, ensure with utmost certainty that the correct answer is truly correct, especially for math in which you should show the mathematical proof for the solution in the explanation. Also ensure that the explanations for why an answer choice is wrong are also correct, especially for mathematical questions in which case show mathematically where it went wrong.',
            },
          ],
        },
        {
          role: 'model',
          parts: [{ text: 'Understood.' }],
        },
        {
          role: 'user',
          parts: [
            {
              text: 'Also, if the notes appear to be a list of vocabulary that one might get from a class to memorize, then provide them questions that match definition to word or also provide a sentence with a blank and ask which word fills in the blank. In the case of fill in the blank, make the blank a group of "_" characters. Additionally, ensure that if you use the fill in the blank question, it is a sentence that the word would typically be used in and does not simply state the definition. An example of what not to provide: A person who consistently breaks societal norms and laws due to a lack of self-control can be described as ______. This question is bad because it simply states the definition rather than making a sentence that the word would typically be used in. Also make sure all questions are appropriate. Additionally, make sure the questions are hard enough such that one who has not read the notes/summary/lesson or is not even familiar with the topic cannot answer the questions.',
            },
          ],
        },
        {
          role: 'model',
          parts: [{ text: 'Understood.' }],
        },
        {
          role: 'user',
          parts: [
            {
              text: 'Also, ensure that all text that is presented to the user makes sense. For example, if you are trying to make something subscript, don\'t use <sub></sub> to indicate it is a subscript. Either display it as an actual subscript or don\'t display the subscript at all. Additionally, double-check all of the explanations and ensure that there is truly only one correct answer. Even though I am requesting you only to provide information from the notes, summary, and or lesson; you can use your own background knowledge to determine if an answer is correct or not. However, the explanation should only be relevant to the content provided to you. Also ignore any other previous message that contradicts what I am about to say: do not make any question math-related or ones that require computation. Also, when you use the word "an" in your question and it is followed by a blank make it a(n)... in order to make sure it is always grammatically correct no matter the answer choice.',
            },
          ],
        },
        {
          role: 'model',
          parts: [{ text: 'Understood.' }],
        },
      ];

      setChatHistory(initialChatHistory);
      setFetchNewQuestion(true); // Trigger fetching the initial question
    }
  }, [startMCQ]);

  // Fetch a new question when needed
  useEffect(() => {
    if (fetchNewQuestion && startMCQ) {
      setIsLoading(true);
      if (inQuestion) {
        getInitialQuestions(); // Fetch the initial question
        inQuestion = false;
      } else {
        getNewQuestion(); // Fetch subsequent questions
      }
      setFetchNewQuestion(false); // Reset the flag after fetching
    }
  }, [fetchNewQuestion, startMCQ, chatHistory.length]);

  useEffect(() => {
    if (question['Question']) {
      setCurrentQuestion(question);
      setChatHistory((oldChatHistory) => [
        ...oldChatHistory,
        {
          role: 'user',
          parts: [{ text: messageSent }],
        },
        {
          role: 'model',
          parts: [{ text: JSON.stringify(question) }],
        },
      ]);

      for (let i = 0; i < 4; i++) {
        if (question['Choices'][i]['correct']) {
          setCorrectAnswer(numToChar[i]);
        }
      }
      setSelectedAnswer(null);
      setAnswersSelected([]);
      setIsLoading(false);
    }
  }, [question]);

  const handleAnswerSelection = (selectedValue) => {
    setSelectedAnswer(selectedValue);
    if (selectedValue === correctAnswer) {
      setAnswersSelected(['A', 'B', 'C', 'D'])
    } else {
    setAnswersSelected((oldAnswersSelected) => [...new Set([...oldAnswersSelected, selectedValue])]);
    }
  };

  const handleNext = () => {
    setIsLoading(true);
    setFetchNewQuestion(true);
  };

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
    <div>
      {startMCQ && (
        <div>
          <div className="mcq-container">
            {question['Question'] && (
              <div className="mcq-valid">
                <div className="separator">
                  <div className="question-prompt-container">
                    <h3 className="question-prompt" dangerouslySetInnerHTML={{ __html: formatResponseText(question['Question']) }} />
                  </div>
                  <div className="choice-container">
                    <ul className="choices">
                      {question['Choices'].map((choice, index) => (
                        <li key={index}>
                          <label>
                            <input
                              type="radio"
                              name="choice"
                              value={numToChar[index]}
                              onChange={() => handleAnswerSelection(numToChar[index])}
                              checked={selectedAnswer === numToChar[index]}
                            />
                            <span>{choice['text']}</span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="explanation-container">
                  {answersSelected.map((answer) => (
                    <div key={answer} className="explanation">
                      <span className="explanation-text">
                        <b className={answer === correctAnswer ? "correct" : "incorrect"}>
                          {answer} is {answer === correctAnswer ? "correct" : "incorrect"}:
                        </b> {question['Choices'][numToChar.indexOf(answer)]['explanation']}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="button-container">
                  <button 
                    className="next-question-button" 
                    onClick={handleNext}
                    disabled={!selectedAnswer}
                  >
                    {selectedAnswer === correctAnswer ? 'Next' : 'Skip'}
                  </button>
                </div>
              </div>
            )}
            {!question['Question'] && 
            <div className="mcq-invalid">
              <br />
              Create your notes to test your knowledge. <br /><br />
              Once created, your questions will generate here...
            </div>}
            {isLoading && <div className="loader-mcq"></div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultipleChoice;