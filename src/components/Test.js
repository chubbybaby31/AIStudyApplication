import React, { useState, useEffect } from "react";
import './Test.css'

const Test = ({ note, test, setTest }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
      getTest();
    }, []);
  

    const history = [
        {
            role: 'user',
            parts: [
              {
                text: `System prompt: You are a teacher who is helping students learn a specific subject. The student will provide on or multiple of the 
                following: notes, summary, and/or a lesson for you to teach them. When you get the notes/summary/lesson you should give a difficult multiple 
                choice question based solely on the information within the content provided to you. In addition, you should provide explanations for each answer 
                choice as to why they are correct or incorrect. The format of this should be a list of 10 dictionaries which are all similar to this example: 
                {Question: Which type of rain is characterized by short, intense bursts?, Choices: [{text: Drizzle, correct: false, explanation: Drizzle is known for its light and 
                continuous nature.}, {text: Shower, correct: true, explanation: Showers are defined by their short duration and intense rainfall.}, 
                {text: Torrential, correct: false, explanation: Torrential rain refers to heavy, prolonged rainfall.}, {text: Monsoon, correct: false, 
                explanation: Monsoon is a seasonal pattern of wind and rain, not a specific type of rain.}]} Obviously, your response should not be 
                related to rain unless the notes are about rain. Use the example as a strict format as to how to respond with the question. Do not 
                feel obligated to make the questions similar to this question. It does not have to be a question about the characteristic or something 
                like that. It can be about anything from the content provided. In fact, it would actually be better. Refrain 
                from repeating questions or providing choices that are not relevant to the content provided. Additionally, do not say "as stated by the notes" or something 
                along those lines. Also, make the questions about the subject of the notes/summary/lesson and not about if they contain something or not. In addition to 
                that, in the explanation do not say "as seen in the notes" or something along those lines. Also ensure that you do not repeat questions. Make sure the 
                response given only contains the question, answer choices, explanations, and if they\'re correct or incorrect. Do not include the format template I 
                have given you in the response. Also do not include correct or incorrect in the explanations. Also make sure there are always exactly 4 answer choices 
                and each one has an explanation. Also, try to make the questions more conceptual and application-based rather than something that asks questions that 
                can be answered from memorization. However, despite me saying this, do not purely make all the questions hypothetical situations, you can also generate 
                some simple objective ones. Also make sure that you follow the format and provide whether an answer choice is correct or not. Ensure that each question 
                has one and exactly one correct answer. In addition, ensure with utmost certainty that the correct answer is truly correct, especially for math in which 
                you should show the mathematical proof for the solution in the explanation. Also ensure that the explanations for why an answer choice is wrong are also 
                correct, especially for mathematical questions in which case show mathematically where it went wrong.Also, if the notes appear to be a list of vocabulary
                that one might get from a class to memorize, then provide them questions that match definition to word or also provide a sentence with a blank and ask which
                word fills in the blank. In the case of fill in the blank, make the blank a group of "_" characters. Additionally, ensure that if you use the fill in the
                blank question, it is a sentence that the word would typically be used in and does not simply state the definition. An example of what not to provide:
                A person who consistently breaks societal norms and laws due to a lack of self-control can be described as ______. This question is bad because it
                simply states the definition rather than making a sentence that the word would typically be used in. Also make sure all questions are appropriate.
                Additionally, make sure the questions are hard enough such that one who has not read the notes/summary/lesson or is not even familiar with the topic
                cannot answer the questions. Either display it as an actual subscript or don\'t display the subscript at all. 
                Additionally, double-check all of the explanations and ensure that there is truly only one correct answer. Even though I am requesting you only to 
                provide information from the notes, summary, and or lesson; you can use your own background knowledge to determine if an answer is correct or not. 
                However, the explanation should only be relevant to the content provided to you. Also ignore any other previous message that contradicts what I am 
                about to say: do not make any question math-related or ones that require computation. Also, when you use the word "an" in your question and it is 
                followed by a blank make it a(n)... in order to make sure it is always grammatically correct no matter the answer choice.`,
              },
            ],
          },
        {
          role: 'model',
          parts: [{ text: 'Understood.' }],
        },
      ];

    const getTest = async () => {
      setIsLoading(true)
      try {
          console.log("started")
          const options = {
          method: 'POST',
          body: JSON.stringify({
            history: history,
            message: `Here are the notes: Milton Friedman: A Noteworthy Economist

            Milton Friedman, a renowned economist, made significant contributions to the field of economics. His work challenged conventional economic thinking and influenced economic policies worldwide.
            
            Key Contributions
            
            Monetarism: Friedman argued that the money supply is the primary driver of economic activity. He believed that excessive money printing leads to inflation, while controlled money supply promotes economic stability.
            
            The Quantity Theory of Money: Friedman emphasized the relationship between the money supply and the price level, arguing that changes in the money supply directly impact inflation.
            
            Free Market Capitalism: Friedman was a staunch advocate for free markets, arguing that government intervention in the economy often leads to inefficiencies and distortions.
            
            The Natural Rate of Unemployment: Friedman proposed that there exists a natural rate of unemployment, beyond which government intervention is ineffective in lowering unemployment rates.
            
            Consumer Choice: Friedman emphasized the importance of consumer choice and individual freedom in economic decision-making.
            
            Influence on Policy
            
            Friedman's ideas had a profound impact on economic policy. His advocacy for monetarism led to changes in monetary policy, particularly in the United States, with the Federal Reserve adopting a more focused approach to controlling the money supply.
            
            His work also influenced the deregulation movement in the 1970s and 1980s, leading to a reduction in government intervention in various industries.
            
            Legacy
            
            Friedman remains a highly influential figure in economics. His theories continue to be debated and studied, and his work has shaped the thinking of policymakers and economists alike. Now provide ten questions for a test for the student. Ensure your response is only of the 10 questions formatted properly with no additional text or symbols. Also ensure your response does not include quotes around the whole JSON response, it should just be the pure JSON response.`
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        };
        const response = await fetch('http://localhost:8000/gemini', options);
        const q = await response.text();
        setTest(JSON.parse(q));
        console.log(JSON.parse(q))
      } catch (error) {
        setTest([]);
        console.log(error)
      }
      setIsLoading(false)
      console.log("done")
    };

    const handleAnswerSelection = (choice) => {
      setSelectedAnswer(choice);
    };
  
    const checkAnswer = () => {
      if (selectedAnswer !== null) {
        setShowExplanation(true);
      }
    };
  
    const nextQuestion = () => {
      if (currentQuestionIndex < test.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setShowExplanation(false);
      }
    };
  
    return (
      <div className="mcq-container">
        {isLoading ? (
          <div className="loader-mcq"></div>
        ) : !test || test.length === 0 ? (
          <div className="mcq-invalid">No questions available.</div>
        ) : (
          <div className="mcq-valid">
            <div className="question-prompt-container">
              <p className="question-prompt">{test[currentQuestionIndex].Question}</p>
            </div>
            <div className="choice-container">
              <ul className="choices">
                {test[currentQuestionIndex].Choices.map((choice, index) => (
                  <li key={index}>
                    <label className={selectedAnswer === choice ? 'selected' : ''}>
                      <input
                        type="radio"
                        name="answer"
                        checked={selectedAnswer === choice}
                        onChange={() => handleAnswerSelection(choice)}
                      />
                      {choice.text}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
            {showExplanation && (
              <div className="explanation-container">
                {test[currentQuestionIndex].Choices.map((choice, index) => (
                  <div key={index} className="explanation">
                    <p className={`explanation-text ${choice.correct ? 'correct' : 'incorrect'}`}>
                      {choice.text}: {choice.explanation}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <div className="button-container">
              {!showExplanation && (
                <button className="check-answer-button" onClick={checkAnswer} disabled={selectedAnswer === null}>
                  Check Answer
                </button>
              )}
              {showExplanation && (
                <button className="next-question-button" onClick={nextQuestion}>
                  Next Question
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  
};
  
export default Test;