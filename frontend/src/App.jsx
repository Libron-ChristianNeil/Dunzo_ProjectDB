import React from 'react'
import { Routes, Route } from 'react-router-dom';
import PageController from './pages/PageController'
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';

import Dashboard from "./pages/Dashboard";
import Project from "./pages/Project";
import Task from "./pages/Task";
import Timeline from "./pages/Timeline";
import Calendar from "./pages/Calendar";
import Settings from "./pages/Settings";

import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  return(
    <div className='bg-white min-h-screen min-w-screen'>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/user" element={<PageController />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="project" element={<Project />} />
            <Route path="task" element={<Task />} />
            <Route path="timeline" element={<Timeline />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>
      </Routes>
    </div>
  )
}

export default App