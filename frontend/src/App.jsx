import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import TruthDashboardPage from './pages/TruthDashboardPage';
import ChatPage from './pages/ChatPage';
import AboutPage from './pages/AboutPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/verify" element={<TruthDashboardPage />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Routes>
  );
}

export default App;