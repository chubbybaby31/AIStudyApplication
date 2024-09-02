import React, { useEffect, useState } from "react";
import { updateDoc } from "firebase/firestore";
import './Space.css'

const Space = ({ authUser, docRef, setCurrentLocation, isNewSpace, setIsNewSpace, name, setName, document, setDocument, terms, setTerms, summaries, setSummaries, lessons, setLessons, spaces, setSpaces, spaceID, setSpaceID }) => {

    const [newName, setNewName] = useState("")
    const [selectedOption, setSelectedOption] = useState("document")
    const [currentSpace, setCurrentSpace] = useState("")

    const enterName = () => {
        setIsNewSpace(false)
        updateDoc(docRef, {
            profile: {
                email: authUser.email,
                spaces: [...spaces, {
                    [newName]: {"document": "", "terms": [], "summaries": [], "lessons": []}
                }]
            }
        }).then(() => {
            setSpaces([...spaces,  {
                [newName]: {"document": "", "terms": [], "summaries": [], "lessons": []}
            }])
            setName(newName)
            setSpaceID([newName])
            setDocument("")
            setTerms([])
            setSummaries([])
            setLessons([])
        }).catch((error) => {
            console.log(error)
        })
    }

    useEffect(() => {
        setTerms(currentSpace.terms)
        setSummaries(currentSpace.summaries)
        setLessons(currentSpace.lessons)
        setDocument(currentSpace.document)
    }, [currentSpace])

    useEffect(() => {
        if (!isNewSpace) {
            spaces.map((space) => {
                if (Object.keys(space)[0] === spaceID[0]) {
                    setName(spaceID)
                    setCurrentSpace(space[spaceID])
                }
            })
        }
    }, [])

    const handleSave = () => {
        if (selectedOption === "document") {

            const spaceIndex = spaces.findIndex(space => Object.keys(space)[0] === spaceID[0]);
            if (spaceIndex !== -1) {
                // Create a new array with the updated space
                const updatedSpaces = [...spaces];
                updatedSpaces[spaceIndex] = {
                    [spaceID[0]]: {
                        ...updatedSpaces[spaceIndex][spaceID[0]],
                        "document": document
                    }
                };

                updateDoc(docRef, {
                    profile: {
                        email: authUser.email,
                        spaces: updatedSpaces
                    }
                }).then(() => {
                    console.log("Successful Save")
                }).catch((error) => {
                    console.log(error)
                })
            }
        }
    }

    return (
        <div className='space-container'>
            <button className="save-button" onClick={handleSave}>Save</button>
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
                {selectedOption === "document" &&
                    <div className="document-container">
                        <textarea id="document-type" rows="40" cols="80" value={document} onChange={(e) => setDocument(e.target.value)}/>
                    </div>
                }
            </div>
        </div>
    )
}

export default Space
