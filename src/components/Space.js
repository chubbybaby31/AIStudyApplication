import React, { useState } from "react";
import { updateDoc } from "firebase/firestore";
import './Space.css'

const Space = ({ authUser, docRef, setCurrentLocation, isNewSpace, setIsNewSpace, name, setName, document, setDocument, terms, setTerms, summaries, setSummaries, lessons, setLessons }) => {

    const [newName, setNewName] = useState("")
    const [selectedOption, setSelectedOption] = useState("document")

    const enterName = () => {
        setIsNewSpace(false)
        updateDoc(docRef, {
            profile: {
                sets: [{
                    [newName]: {"document": "", "terms": [], "summaries": [], "lessons": []}
                }]
            }
        }).then(() => {
            setName(newName)
            setDocument("")
            setTerms([])
            setSummaries([])
            setLessons([])
        }).catch((error) => {
            console.log(error)
        })
    }

    return (
        <div className='space-container'>
            {isNewSpace && 
                <div className='name-popup'>
                    <h2 className="name-popup-header">Name Your Study Space</h2>
                    <form onSubmit={enterName} className="name-entry-form">
                        <input className="name-entry" placeholder="Subject, Topic, etc." onChange={(e) => setNewName(e.target.value)} />
                        <button type="submit" className="name-submit">+</button>
                    </form>
                </div>
            }
            <div className="space-side-nav">
                <h2 className="space-name">{name}</h2>
                <button>Document</button>
                <button>Flash Cards</button>
                <button>Summaries</button>
                <button>Lessons</button>
            </div>
            <div className="content-container">

            </div>
        </div>
    )
}

export default Space
