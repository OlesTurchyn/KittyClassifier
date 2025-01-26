import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import * as tf from "@tensorflow/tfjs";

function App() {
  const [imageFile, setImageFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [model, setModel] = useState(null);
  const [imageTensor, setImageTensor] = useState(null);
  const fileInputRef = useRef(null);

  // Class names for the cat breeds
  const classNames = [
    "Abyssinian",
    "American Bobtail",
    "American Curl",
    "American Shorthair",
    "Bengal",
    "Birman",
    "Bombay",
    "British Shorthair",
    "Egyptian Mau",
    "Exotic Shorthair",
    "Maine Coon",
    "Manx",
    "Norwegian Forest",
    "Persian",
    "Ragdoll",
    "Russian Blue",
    "Scottish Fold",
    "Siamese",
    "Sphynx",
    "Turkish Angora",
  ];

  useEffect(() => {
    // Load TensorFlow.js model
    const loadModel = async () => {
      try {
        const loadedModel = await tf.loadLayersModel("/client-model/model.json");
        console.log("Model loaded successfully!");
        console.log("Model input shape:", loadedModel.inputs[0].shape);
        setModel(loadedModel);
      } catch (error) {
        console.error("Error loading model:", error);
      }
    };

    loadModel();
  }, []);

  // Preprocess image to create a TensorFlow.js tensor
  const preprocessImage = async (file) => {
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);

    return new Promise((resolve) => {
      img.onload = () => {
        const tensor = tf.browser
          .fromPixels(img, 3)
          .resizeNearestNeighbor([256, 256])
          .toFloat()
          .div(255.0)
          .expandDims(0);
        console.log("Preprocessed tensor shape:", tensor.shape);
        resolve(tensor);
      };
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = e.dataTransfer.files;

    if (droppedFiles.length > 0) {
      const file = droppedFiles[0];
      setImageFile(file);
      preprocessImage(file).then((tensor) => setImageTensor(tensor));
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
    const selectedFile = e.target.files[0];
    setImageFile(selectedFile);
    preprocessImage(selectedFile).then((tensor) => setImageTensor(tensor));
  };

  const handlePrediction = async () => {
    if (!model || !imageTensor) {
      console.error("Model or image not loaded");
      return;
    }

    try {
      console.log("Tensor shape before prediction:", imageTensor.shape);

      const predictions = model.predict(imageTensor);
      const result = await predictions.array();
      console.log("Prediction result:", result);

      // Get the predicted class and confidence
      const predictedClassIndex = result[0].indexOf(Math.max(...result[0]));
      const confidence = Math.max(...result[0]) * 100;

      setPrediction({
        class: classNames[predictedClassIndex],
        confidence: confidence.toFixed(2),
      });

      // Dispose tensor after prediction
      imageTensor.dispose();
    } catch (error) {
      console.error("Error during prediction:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (imageTensor && model) {
      console.log("Running prediction...");
      await handlePrediction();
    } else {
      console.error("Image tensor or model not ready");
    }
  };

  return (
    <div className={`app-container ${isDragging ? "drag-over" : ""}`}>
      <h1 className="app-title">Kitty Classifier &#128049;</h1>

      <div className="page-links">
        <a href="#about">About</a>
        <a> </a>
        <a
          href="https://github.com/OlesTurchyn/KittyClassifier"
          target="_blank"
          rel="noopener noreferrer"
        >
          Code
        </a>
      </div>

      <p className="app-description">
        Discover your cat's breed using a convolutional neural network
      </p>

      <div
        className={`center-content ${isDragging ? "drag-over" : ""}`}
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
                style={{ display: "none" }}
                ref={fileInputRef}
              />
            </label>
          </div>
          <div>
            <button
              type="button"
              className="select"
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
                style={{ maxWidth: "300px" }}
              />
            </div>
          )}
          {imageFile && (
            <button type="submit" className="submit">
              Submit
            </button>
          )}
        </form>

        {prediction && (
          <div className="prediction-result">
            <p>
              <strong>Predicted Class:</strong> {prediction.class}
            </p>
            <p>
              <strong>Confidence:</strong> {prediction.confidence}%
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
