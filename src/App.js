import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import Webcam from "react-webcam"; // Pour utiliser la caméra
import "./style.css";

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showModal, setShowModal] = useState(false); // Contrôle du modal
  const [showCamera, setShowCamera] = useState(false); // Contrôle de la caméra
  const webcamRef = useRef(null);

  useEffect(() => {
    document.body.className = darkMode ? "dark-mode" : "light-mode";
  }, [darkMode]);

  const handleSendMessage = async () => {
    if (!currentMessage && !selectedImage) return;

    let base64Image = null;

    if (selectedImage) {
      // Si l'image provient de l'upload ou de la caméra
      if (typeof selectedImage === "string") {
        base64Image = selectedImage.split(",")[1]; // Base64 de la capture
      } else {
        // Sinon, elle provient de l'upload (File)
        const reader = new FileReader();
        reader.readAsDataURL(selectedImage);
        await new Promise((resolve) => {
          reader.onloadend = () => {
            base64Image = reader.result.split(",")[1];
            resolve();
          };
        });
      }
    }

    const newMessage = {
      sender: "user",
      text: currentMessage,
      image: imagePreview,
    };
    setMessages([...messages, newMessage]);
    setCurrentMessage("");
    setSelectedImage(null);
    setImagePreview(null);

    try {
      let response;

      if (base64Image) {
        response = await axios.post(
          "http://127.0.0.1:5000/predict_emotion_image",
          {
            image: base64Image,
          }
        );
      } else {
        response = await axios.post(
          "http://127.0.0.1:5000/predict_emotion_text",
          {
            text: currentMessage,
          }
        );
      }

      const botMessage = {
        sender: "bot",
        text: `Emotion detected: ${response.data.emotion}. Recommendation: ${response.data.recommendation?.song} by ${response.data.recommendation?.artist}.`,
        image: null,
      };

      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        sender: "bot",
        text: "An error occurred. Please try again.",
        image: null,
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setSelectedImage(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const savePhoto = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setImagePreview(imageSrc); // Pour prévisualisation
        setSelectedImage(imageSrc); // Base64 directement
        setShowCamera(false);
      } else {
        console.error("Unable to capture the screenshot.");
      }
    } else {
      console.error("Webcam is not ready.");
    }
  };

  return (
    <div className="App">
      <div className="navbar">
        <img src="/images/logo2.png" alt="Logo" className="logo" />
        <div className="navbar-icons">
          <img src="/images/profile-icon.png" alt="Profile" className="icon" />
          <div className="switch-mode" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? "🌞" : "🌙"}
          </div>
        </div>
      </div>

      <div className="header">
        <h1 className="title">Music Recommendation Based on Emotion</h1>
        <p className="subtitle">
          Discover the perfect soundtrack for every moment!
        </p>
        <img src="/images/up.png" alt="Decorative" className="header-image" />
        <p className="question">How are you feeling today?</p>
      </div>

      <div className="chat-section">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.sender}`}>
            {msg.image && (
              <img src={msg.image} alt="Uploaded" className="message-image" />
            )}
            <p>{msg.text}</p>
          </div>
        ))}
        <div className="chat-input">
          {imagePreview && (
            <div className="image-preview-container">
              <img src={imagePreview} alt="Preview" className="image-preview" />
              <button
                className="cancel-button"
                onClick={() => {
                  setImagePreview(null);
                  setSelectedImage(null);
                }}
              >
                ✖
              </button>
            </div>
          )}
          <input
            type="text"
            placeholder="Type your message..."
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
          />

          <button className="icon-button" onClick={() => setShowModal(true)}>
            📷
          </button>
          <button onClick={handleSendMessage}>➤</button>
        </div>
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <p>What do you want to do?</p>
            <button onClick={() => setShowCamera(true)}>Take a photo</button>
            <label className="image-upload">
              <input type="file" onChange={handleImageUpload} />
              upload an image
            </label>
            <button onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      {showCamera && (
        <div className="camera-container">
          <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" />
          <button onClick={savePhoto}>Capture</button>
          <button onClick={() => setShowCamera(false)}>Close</button>
        </div>
      )}
    </div>
  );
}

export default App;
