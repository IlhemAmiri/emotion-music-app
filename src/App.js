import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './style.css';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); // Pour afficher un aperçu de l'image

  useEffect(() => {
    document.body.className = darkMode ? 'dark-mode' : 'light-mode';
  }, [darkMode]);

  const handleSendMessage = async () => {
    if (!currentMessage && !selectedImage) return;

    let base64Image = null;

    // Si une image est sélectionnée, la convertir en Base64
    if (selectedImage) {
      const reader = new FileReader();
      reader.readAsDataURL(selectedImage);
      await new Promise((resolve) => {
        reader.onloadend = () => {
          base64Image = reader.result.split(',')[1];
          resolve();
        };
      });
    }

    const newMessage = { sender: 'user', text: currentMessage, image: imagePreview };
    setMessages([...messages, newMessage]);
    setCurrentMessage('');
    setSelectedImage(null);
    setImagePreview(null);

    try {
      let response;

      if (base64Image) {
        // Envoi de l'image
        response = await axios.post('http://127.0.0.1:5000/predict_emotion_image', {
          image: base64Image,
        });
      } else {
        // Envoi du texte
        response = await axios.post('http://127.0.0.1:5000/predict_emotion_text', {
          text: currentMessage,
        });
      }

      const botMessage = {
        sender: 'bot',
        text: `Emotion detected: ${response.data.emotion}. Recommendation: ${response.data.recommendation?.song} by ${response.data.recommendation?.artist}.`,
        image: null,
      };

      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = { sender: 'bot', text: 'An error occurred. Please try again.', image: null };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setSelectedImage(file);

    // Créer un aperçu de l'image
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="App">
      {/* Navbar */}
      <div className="navbar">
        <img src="/images/logo2.png" alt="Logo" className="logo" />
        <div className="navbar-icons">
          <img src="/images/profile-icon.png" alt="Profile" className="icon" />
          <div className="switch-mode" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? '🌞' : '🌙'}
          </div>
        </div>
      </div>
  
      {/* Header */}
      <div className="header">
        <h1 className="title">Music Recommendation Based on Emotion</h1>
        <p className="subtitle">Discover the perfect soundtrack for every moment!</p>
        <img src="/images/up.png" alt="Decorative" className="header-image" />
        <p className="question">How are you feeling today?</p>
      </div>
  
      {/* Chat Section */}
      <div className="chat-section">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.sender}`}>
            {msg.image && <img src={msg.image} alt="Uploaded" className="message-image" />}
            <p>{msg.text}</p>
          </div>
        ))}
        <div className="chat-input">
          {/* Aperçu de l'image avec bouton d'annulation */}
          {imagePreview && (
            <div className="image-preview-container">
              <img src={imagePreview} alt="Preview" className="image-preview" />
              <button className="cancel-button" onClick={() => {
                setImagePreview(null);
                setSelectedImage(null);
              }}>✖</button>
            </div>
          )}
          <input
            type="text"
            placeholder="Type your message..."
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
          />
          <label className="image-upload">
            <input type="file" onChange={handleImageUpload} />
            📷
          </label>
          <button onClick={handleSendMessage}>➤</button>
        </div>
      </div>
    </div>
  );
  
}

export default App;
