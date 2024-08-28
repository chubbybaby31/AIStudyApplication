import React, { useEffect, useRef } from "react";
import './LandingPage.css'
import notesImage from '../assets/images/notes-image.png';

const LandingPage = () => {
    const welcomeRef = useRef(null);
    const welcomeNameRef = useRef(null);
    const firstTextRef = useRef(null);
    const secondTextRef = useRef(null);
    const stepNameRef = useRef(null);
    const stepDetailsRef = useRef(null);
    const imageRef = useRef(null); // Ref for the image

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            const welcomeElement = welcomeRef.current;
            const welcomeNameElement = welcomeNameRef.current;
            const firstTextElement = firstTextRef.current;
            const secondTextElement = secondTextRef.current;
            const stepNameElement = stepNameRef.current;
            const stepDetailsElement = stepDetailsRef.current;
            const imageElement = imageRef.current; // Get the image element

            // Welcome text animation
            if (welcomeElement && welcomeNameElement) {
                const moveAmount = Math.min(scrollPosition, 500) * 0.5;
                welcomeElement.style.transform = `translateX(-${moveAmount}px)`;
                welcomeNameElement.style.transform = `translateX(${moveAmount}px)`;

                const opacity = Math.max(1 - scrollPosition / 500, 0);
                welcomeElement.style.opacity = opacity;
                welcomeNameElement.style.opacity = opacity;
            }

            // First text animation
            if (firstTextElement) {
                const firstTextMove = Math.max(0, Math.min((scrollPosition - 900) * 0.5, 250));
                firstTextElement.style.transform = `translateX(-${firstTextMove}px)`;
                firstTextElement.style.opacity = Math.max(1 - (scrollPosition - 900) / 500, 0);
            }

            // Second text animation
            if (secondTextElement) {
                const secondTextMove = Math.max(0, Math.min((scrollPosition - 1600) * 0.5, 250));
                secondTextElement.style.transform = `translateX(${secondTextMove}px)`;
                secondTextElement.style.opacity = Math.max(1 - (scrollPosition - 1600) / 500, 0);
            }

            // Step name animation
            if (stepNameElement) {
                const stepNameMove = Math.max(0, Math.min((scrollPosition - 1600) * 0.5, 250));
                stepNameElement.style.transform = `translateX(-${250 - stepNameMove}px)`;
                stepNameElement.style.opacity = Math.min((scrollPosition - 1600) / 250, 1);
            }

            // Step details animation
            if (stepDetailsElement) {
                const stepDetailsMove = Math.max(0, Math.min((scrollPosition - 1700) * 0.5, 250));
                stepDetailsElement.style.transform = `translateX(-${250 - stepDetailsMove}px)`;
                stepDetailsElement.style.opacity = Math.min((scrollPosition - 1700) / 250, 1);
            }

            // Image animation
            if (imageElement) {
                const imageMove = Math.max(0, Math.min((scrollPosition - 1600) * 0.5, 250));
                imageElement.style.transform = `translateX(${250 - imageMove}px)`;
                imageElement.style.opacity = Math.min((scrollPosition - 1600) / 250, 1);
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <div className="landing-page">
            <div className="nav-bar-container">
                <div className="nav-bar">
                    <div className="app-name">NimbLearn AI</div>
                    <div className="links">
                        <button>FAQ</button>
                        <button>App Demo</button>
                        <button>Pricing</button>
                        <button>About Us</button>
                        <button>Login</button>
                    </div>
                </div>
            </div>
            <div className="welcome">
                <div ref={welcomeRef}>Welcome To</div>
                <div className="welcome-name" ref={welcomeNameRef}>NimbLearn AI</div>
            </div>
            <div className="scrollable-content">
                <div className="text first" ref={firstTextRef}>
                    All your studying
                    <br/>
                    Done in one place
                </div>
                <div className="text second" ref={secondTextRef}>
                    Study <i className="gradient-text">faster</i> and <i className="gradient-text">better</i>
                    <br/>
                    with our <b className="gradient-text">4-step</b> plan
                </div>
                <div className="step">
                    <div className="step-name" ref={stepNameRef}>Step 1: <b className="gradient-text">Notes</b></div>
                    <div className="step-details" ref={stepDetailsRef}>Generate notes with a topic and a few points <b>OR</b> upload a document to let AI take notes for you.</div>
                </div>
                <img className="notes-image" ref={imageRef} src={notesImage} alt="Notes Image" />
            </div>
        </div>
    )
}

export default LandingPage;