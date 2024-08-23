import React, { useState } from 'react';
import Tesseract from 'tesseract.js';
import './ImageUploadPopup.css'; // Ensure this file is created or updated
import { ReactComponent as CloseIcon } from '../assets/icons/close-icon.svg';

const ImageUploadPopup = ({ onClose, onTextExtracted }) => {
  const [images, setImages] = useState([]); // Change to handle multiple images
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (event) => {
    setImages(Array.from(event.target.files)); // Store all selected files
    setError('');
  };

  const handleExtractText = () => {
    if (images.length === 0) {
      alert('Please upload at least one image.');
      return;
    }

    setLoading(true);
    const textPromises = images.map((image) => 
      Tesseract.recognize(image, 'eng', {
        logger: (m) => console.log(m), // Optional: log progress
      }).then(({ data: { text } }) => text)
    );

    Promise.all(textPromises)
      .then((texts) => {
        const combinedText = texts.join('\n\n'); // Combine text from all images
        onTextExtracted(combinedText); // Pass the combined text to the parent component
        onClose(); // Close the popup
      })
      .catch((err) => {
        console.error(err);
        setError('Error processing the images. Please try again.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="image-upload-popup">
      <div className="popup-content">
        <button className='popup-close-button' onClick={onClose}>
          <CloseIcon className='close-icon' />
        </button>
        <h2>Upload Image(s)</h2>
        <input 
          className="popup-input" 
          type="file" 
          accept="image/*" 
          multiple 
          onChange={handleImageChange} 
        />
        <button className='extract-button' onClick={handleExtractText} disabled={loading}>
          {loading ? 'Processing...' : 'Extract Text'}
        </button>
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
};

export default ImageUploadPopup;