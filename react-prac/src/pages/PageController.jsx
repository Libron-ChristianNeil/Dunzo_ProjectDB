import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Dashboard from './Dashboard';
import Project from './Project';
import Task from './Task';
import Timeline from './Timeline';
import Calendar from './Calendar';
import Settings from './Settings';

function PageController() {
    return (
        <div className='flex flex-row h-full w-full'>
        <Sidebar/>
            <div id='main-content' className='ml-[260px] w-screen h-screen bg-gray-100 px-4 py-5'>
                {/* <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/project" element={<Project />} />
                    <Route path="/task" element={<Task />} />
                    <Route path="/timeline" element={<Timeline />} />
                    <Route path="/calendar" element={<Calendar />} />
                    <Route path="/settings" element={<Settings />} />
                </Routes> */}

                <Outlet />
            </div>
        </div>
    )
}

export default PageController