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

const App = () => {
  return(
    <div className='bg-white min-h-screen min-w-screen'>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/user" element={<PageController />}>
          <Route index element={<Dashboard />} />           {/* /user */}
          <Route path="dashboard" element={<Dashboard />} /> {/* /user/dashboard */}
          <Route path="project" element={<Project />} />     {/* /user/project */}
          <Route path="task" element={<Task />} />           {/* /user/task */}
          <Route path="timeline" element={<Timeline />} />   {/* /user/timeline */}
          <Route path="calendar" element={<Calendar />} />   {/* /user/calendar */}
          <Route path="settings" element={<Settings />} />   {/* /user/settings */}
        </Route>
      </Routes>
    </div>
  )
}

export default App