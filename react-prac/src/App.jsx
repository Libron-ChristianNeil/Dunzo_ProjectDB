import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from "./components/Sidebar"; 

import Dashboard from './pages/Dashboard';
import Project from './pages/Project';
import Task from './pages/Task';
import Timeline from './pages/Timeline';
import Calendar from './pages/Calendar';
import Settings from './pages/Settings';

const App = () => {
  return (
    <div className='flex flex-row h-full w-full'>
      <Sidebar/>
      <div id='main-content' className='ml-[260px] w-screen h-screen bg-gray-100 px-4 py-5'>
        <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/project" element={<Project />} />
            <Route path="/task" element={<Task />} />
            <Route path="/timeline" element={<Timeline />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </div>
    
  )
}

export default App