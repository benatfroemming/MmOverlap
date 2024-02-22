import { useEffect, useState } from 'react'
import './App.css'
import LandingPage from './pages/LandingPage'
import CoursePage from './pages/CoursePage'
import ProgressPage from './pages/ProgressPage'
import {BrowserRouter, Routes, Route} from "react-router-dom";

function App() {
  return (
    <>
      <nav>
        <ul>
          <li><a href="/">Landing Page</a></li>
          <li><a href="/your-courses">Select Courses</a></li>
          <li><a href="/progress-report">Progress Report</a></li>
        </ul>
      </nav>
        
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="your-courses" element={<CoursePage />} />
            <Route path="progress-report" element={<ProgressPage />} />
          </Routes>
        </BrowserRouter>
    </>
  );
}

export default App
