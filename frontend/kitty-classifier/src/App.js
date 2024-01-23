// App.js

import React, { useState, useRef } from 'react';
import './App.css';
import axios from "axios";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBniOKuyvV8Y-VSmXxqVFsxwv0FdrcmPfo",
  authDomain: "kittyclassifier.firebaseapp.com",
  projectId: "kittyclassifier",
  storageBucket: "kittyclassifier.appspot.com",
  messagingSenderId: "674854892305",
  appId: "1:674854892305:web:13949a710ff110c3ef92b0",
  measurementId: "G-ESEMMY7BCZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);


function App() {
  const [imageFile, setImageFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
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


  const [predictionResponse, setPredictionResponse] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (imageFile) {
      const formData = new FormData();
      formData.append('file', imageFile);
  
      try {
        const response = await axios.post('https://us-central1-kittyclassifier.cloudfunctions.net/predict', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
  
        console.log('Cloud Function response:', response.data);
        // Handle the response here
        setLoading(false);
        const { data } = response; 
        setPredictionResponse({ class: data.class, confidence: data.confidence });

      } catch (error) {
         // Handle error
        console.error('Error sending POST request:', error);
        setLoading(false);
      }
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setPredictionResponse(null);

  };

  return (
    <div className={`app-container ${isDragging ? 'drag-over' : ''}`}>
      <h1 className="app-title">Kitty Classifier &#128049;</h1>

        {/* Two side-by-side links */}
        <div className="page-links">
        <a href="https://olesturchyn.github.io/AboutKittyClassifier/" target="_blank">About</a>
        <a>{' '}</a>
        <a href="https://github.com/OlesTurchyn/KittyClassifier" target="_blank">Code</a>
      </div>
      <br></br>

      <label>Discover your cat's breed using a convolutional neural network</label>
      

      <div
        className={`center-content ${isDragging ? 'drag-over' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
      >

        <form onSubmit={handleSubmit}>
          <div>
            <label className='select-description'>
              Drag and drop or select an image of your kitty:
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                ref={fileInputRef}
              />
            </label>
          </div>
        
        <div className='button-container'>
          {imageFile && (
          <div>
            <button type="close" onClick={handleRemoveImage} className="remove-button">
            X
            </button>
          </div>
           )}

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
       
      </div>

      {imageFile && (

        <div className="loading-container">
        <button type="submit" onClick={handleSubmit}>
          Submit
        </button>
        <br></br>
        {loading && <span className="loader"></span>}
        </div>
        )}

      {predictionResponse && (
        <div className='prediction-results'>
        <div className='result-details'>
          <p><strong>Breed:</strong> {predictionResponse.class}</p>
          <p><strong>Confidence:</strong> {predictionResponse.confidence} %</p>
        </div>
      </div>
      )}

      

    
    </div>
  );
}

export default App;
