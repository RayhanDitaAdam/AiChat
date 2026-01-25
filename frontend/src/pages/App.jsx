import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './Landing.jsx';
import Chat from './Chat.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/chat" element={<Chat />} />
        {/* Adh-hoc components or other pages can be added here */}
      </Routes>
    </Router>
  );
}

export default App;
