import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './style.css';

function App() {
  const [inputText, setInputText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [emotion, setEmotion] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.body.className = darkMode ? 'dark-mode' : 'light-mode';
  }, [darkMode]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://127.0.0.1:5000/predict_emotion_text", { text: inputText });
      setEmotion(response.data.emotion);
      setRecommendation(response.data.recommendation);
    } catch (error) {
      console.error("Error during text request:", error);
    }
  };

  const handleImageSubmit = async (e) => {
    e.preventDefault();
    if (selectedFile) {
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onloadend = async () => {
        const base64String = reader.result.split(",")[1];
        const response = await axios.post("http://127.0.0.1:5000/predict_emotion_image", { image: base64String });
        setEmotion(response.data.emotion);
        setRecommendation(response.data.recommendation);
      };
    } else {
      alert("Please upload an image.");
    }
  };

  return (
    <div className="App">
      <div className="switch-mode" onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? '🌞' : '🌙'}
      </div>
      
      <h1 className="title">Music Recommendation Based on Emotion</h1>
      <p className="intro">
      Discover the perfect soundtrack for every moment and elevate your mood with our curated music selections!
      </p>

      <div className="form-section">
        <div className="text-input">
          <form onSubmit={handleTextSubmit}>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter your text here..."
            />
            <button type="submit">Analyze Text Emotion</button>
          </form>
        </div>

        <div className="file-input">
          <form onSubmit={handleImageSubmit}>
            <input type="file" accept="image/*" onChange={handleFileChange} />
            {imagePreview && <img src={imagePreview} alt="Uploaded Preview" />}
            <button type="submit">Analyze Image Emotion</button>
          </form>
        </div>
      </div>

      {emotion && (
        <div className="result">
          <h2>Detected Emotion: {emotion}</h2>
          {recommendation ? (
            <div className="recommendation">
              <h3>Recommended Music:</h3>
              <p>
                <strong>{recommendation.song}</strong> by {recommendation.artist}
              </p>
              <a href={recommendation.link} target="_blank" rel="noopener noreferrer" className="link-button">
                Listen on YouTube
              </a>
            </div>
          ) : (
            <p>No recommendation available for this emotion.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
