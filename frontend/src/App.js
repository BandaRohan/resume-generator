import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './components/home/HomePage';
import ChatApp from './components/ChatApp';
import './App.css';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chat" element={<ChatApp />} />
      </Routes>
    </div>
  );
}

export default App;
