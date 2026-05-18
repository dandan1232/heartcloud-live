import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import StudentPage from './routes/StudentPage';
import ScreenPage from './routes/ScreenPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/student" element={<StudentPage />} />
        <Route path="/screen" element={<ScreenPage />} />
        <Route path="/" element={<Navigate to="/student" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
