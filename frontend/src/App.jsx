import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Home from './pages/Home';
import { ToastContainer } from './components/Toast';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<Home />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
}
