import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import * as tf from "@tensorflow/tfjs";

function App() {
  const [imageFile, setImageFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [model, setModel] = useState(null);
  const [imageTensor, setImageTensor] = useState(null); // State for storing the processed tensor
  const fileInputRef = useRef(null);

  // Load the TensorFlow.js model on component mount
  useEffect(() => {
    const loadModel = async () => {
      try {
        const loadedModel = await tf.loadLayersModel('/client-model/model.json');
        console.log("Model loaded successfully!");

            // Log input shape to confirm the expected input format
    console.log("Model input shape:", loadedModel.inputs[0].shape);

        setModel(loadedModel);
      } catch (error) {
        console.error("Error loading model:", error);
      }
    };

    loadModel();
  }, []);

  // Preprocess the image to ensure it has 4 dimensions before passing it to the model
  const preprocessImage = async (file) => {
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);

    return new Promise((resolve) => {
      img.onload = () => {
        const tensor = tf.browser
          .fromPixels(img, 3) // Ensuring the image is in RGB format (3 channels)
          .resizeNearestNeighbor([224, 224]) // Resize image to model's expected size
          .toFloat()
          .div(255.0) // Normalize pixel values
          .expandDims(0); // Add batch dimension: [height, width, channels] -> [1, height, width, channels]
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
      preprocessImage(file).then((tensor) => setImageTensor(tensor)); // Store tensor
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
    preprocessImage(selectedFile).then((tensor) => setImageTensor(tensor)); // Store tensor
  };

  const handlePrediction = async () => {
    if (!model || !imageTensor) {
      console.error("Model or image not loaded");
      return;
    }

    try {
      // Log tensor shape before prediction
      console.log('Tensor shape before prediction:', imageTensor.shape);

      const predictions = model.predict(imageTensor); // Use pre-processed tensor
      const result = await predictions.array();
      console.log("Prediction result:", result);

      // Find the class with the highest probability
      const predictedClassIndex = result[0].indexOf(Math.max(...result[0]));
      setPrediction(predictedClassIndex);

      // Dispose tensors after prediction
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

        {prediction !== null && (
          <div className="prediction-result">
            <p>
              <strong>Predicted Class:</strong> {prediction}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
