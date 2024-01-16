// App.js

import React, { useState, useRef } from 'react';
import './App.css';

function App() {
  const [imageFile, setImageFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;

    if (droppedFiles.length > 0) {
      setImageFile(droppedFiles[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileChange = (e) => {
    e.preventDefault();
    const selectedFile = e.target.files[0];
    setImageFile(selectedFile);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (imageFile) {
      console.log('Image submitted:', imageFile);
      // You can use FileReader to display a preview if needed
    }
  };

  return (
    <div className={`app-container ${isDragging ? 'drag-over' : ''}`}>
      <h1 className="app-title">Kitty Classifier &#128049;</h1>

        {/* Two side-by-side links */}
        <div className="page-links">
        <a href="#about">About</a>
        <a>{' '}</a>
        <a href="#code">Code</a>
      </div>

      <p className="app-description">Discover your cat's breed using a convolutional neural network</p>
      
      {imageFile && (
         <button type="submit">Submit</button>
        )}

      <div
        className={`center-content ${isDragging ? 'drag-over' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
      >
        <form onSubmit={handleSubmit}>
          <div>
            <label>
              Drag and Drop or Select an Image:
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                ref={fileInputRef}
              />
            </label>
          </div>
          <div>
            <button
              type="button"
              class="select"
              onClick={() => fileInputRef.current.click()}
            >
              Select Image
            </button>
          </div>
          {imageFile && (
          <div className="image-preview">
            <img
              src={URL.createObjectURL(imageFile)}
              alt="User's Input"
            />
          </div>

          
        )}
          
        </form>

        {/* Display the image preview if an image is selected */}
       
      </div>

      

      

      

     
    </div>
  );
}

export default App;
