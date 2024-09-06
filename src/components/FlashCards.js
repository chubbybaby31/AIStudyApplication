import React, { useEffect, useState } from 'react'
import './FlashCards.css'
import axios from 'axios'
import { ReactComponent as NextIcon } from '../assets/icons/next-icon.svg';
import { ReactComponent as ShuffleIcon } from '../assets/icons/shuffle-icon.svg';

const FlashCards = ({ note, summary, lesson, flashCards, setFlashCards, currentFlashCard, setCurrentFlashCard, lookingAtTerm, setLookingAtTerm }) => {

    const [terms, setTerms] = useState("")
    const [topic, setTopic] = useState("")
    const [loading, setLoading] = useState(false)
    const [cardIndex, setCardIndex] = useState(-1)
    const [isFlipped, setIsFlipped] = useState(false);
    const [activeTab, setActiveTab] = useState('practice');

    const shuffleArray = (array) => {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array
    }

    const handleGenerate = async () => {
        if (!terms) {
          alert('Please enter the number of flash cards you would like.');
          return;
        }

        if (!note && !topic) {
          alert('Please enter a topic for generating flash cards.');
          return;
        }
    
        setLoading(true);
    
        try {
          const response = await axios.post('http://localhost:8000/generate-flash-cards', {
            note,
            summary,
            lesson,
            terms,
            topic // Include topic in the request
          });
          setFlashCards(JSON.parse(response.data.cards));
        } catch (error) {
          console.error('Error generating flash cards:', error);
          alert('An error occurred while generating the flash cards. Please try again.');
        } finally {
          setLoading(false);
        }
    };

    useEffect(() => {
        console.log(flashCards)
        if (!flashCards[0]){
            return
        }
        else {
            setCardIndex(0)
        }
    },[flashCards])

    useEffect(() => {
        if (flashCards[cardIndex]) {
            setCurrentFlashCard(flashCards[cardIndex])
        }
    }, [cardIndex])

    useEffect(() => {
        if (terms > 30) {
            setTerms(30)
        }
    }, [terms])

    const handleClick = () => {
        if (flashCards[0]) {
            setLookingAtTerm(!lookingAtTerm);
            setIsFlipped(!isFlipped);
        }
    };

    const handleNext = () => {
        if (cardIndex + 1 === flashCards.length) {
            setCardIndex(0)
        } else {
            setCardIndex(cardIndex + 1)
        }
    }

    const handleBack = () => {
        if (cardIndex - 1 === -1) {
            setCardIndex(flashCards.length - 1)
        } else {
            setCardIndex(cardIndex - 1)
        }
    }

    const handleShuffle = () => {
        setFlashCards(shuffleArray(flashCards))
        handleNext()
    }

    const handleAddTerm = () => {
        setFlashCards([...flashCards, { term: '', definition: '' }]);
    };

    const handleDeleteTerm = (index) => {
        const newFlashCards = flashCards.filter((_, i) => i !== index);
        setFlashCards(newFlashCards);
    };

    const handleTermChange = (index, field, value) => {
        const newFlashCards = [...flashCards];
        newFlashCards[index][field] = value;
        setFlashCards(newFlashCards);
    };

    return (
        <div className='flash-card-area'>
            <div className="flash-card-tabs">
                <button 
                    className={`tab-button ${activeTab === 'practice' ? 'active' : ''}`}
                    onClick={() => setActiveTab('practice')}
                >
                    Practice
                </button>
                <button 
                    className={`tab-button ${activeTab === 'edit' ? 'active' : ''}`}
                    onClick={() => setActiveTab('edit')}
                >
                    Edit Terms
                </button>
            </div>

            {activeTab === 'practice' && (
                <div className='flash-card-container'>
                    <div className={`card ${isFlipped ? 'flipped' : ''}`} onClick={handleClick}>
                        <div className="card-inner">
                            <div className="card-front">
                                <div className='term'>{currentFlashCard['term']}</div>
                            </div>
                            <div className="card-back">
                                <div className='definition'>{currentFlashCard['definition']}</div>
                            </div>
                        </div>
                    </div>
                    <div className='flash-card-button-container'>
                        <button className="back-button" onClick={handleBack}>
                            <NextIcon className='back-icon'/>
                        </button>
                        <button className="shuffle-button" onClick={handleShuffle}>
                            <ShuffleIcon className="shuffle-icon" />
                        </button>
                        <button className="next-button" onClick={handleNext}>
                            <NextIcon className='next-icon'/>
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'edit' && (
                <div className='terms-edit-container'>
                    {flashCards.map((card, index) => (
                        <div key={index} className="term-edit-row">
                            <input
                                type="text"
                                value={card.term}
                                onChange={(e) => handleTermChange(index, 'term', e.target.value)}
                                placeholder="Term"
                                className="term-input"
                            />
                            <textarea
                                value={card.definition}
                                onChange={(e) => handleTermChange(index, 'definition', e.target.value)}
                                placeholder="Definition"
                                className="definition-input"
                            />
                            <button onClick={() => handleDeleteTerm(index)} className="delete-term-button">-</button>
                        </div>
                    ))}
                    <button onClick={handleAddTerm} className="add-term-button">Add Term</button>
                </div>
            )}

            {loading && <div className="flash-card-loader"></div>}
            <div className='generate-flash-card-container'>
                    <>
                        <label className="generate-flash-card-label">Topic</label>
                        <input 
                            className="generate-flash-card-input" 
                            type="text" 
                            placeholder="Enter a topic"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                        />
                    </>
                <label className="generate-flash-card-label"># of Terms</label>
                <input 
                    className="generate-flash-card-input" 
                    type="text" 
                    placeholder="Max. 30"
                    value={terms}
                    onChange={(e) => setTerms(e.target.value)}
                />
                <button 
                    className="generate-flash-card-button" 
                    onClick={handleGenerate}
                >
                    Generate
                </button>
            </div>
        </div>
    )
}

export default FlashCards