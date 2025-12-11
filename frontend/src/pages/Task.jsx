import React, { useState } from 'react';
import { sampleTaskData } from '../data/taskSampleData';
import { projectSampleData } from '../data/projectSampleData';
import SelectOptions from '../components/SelectOptions';
import TaskCard from '../components/task-app-components/TaskCard';
import ModalExpandTask from '../components/task-app-components/ModalExpandTask';
import ModalAddTask from '../components/task-app-components/ModalAddTask';

function Task() {
    
    const taskStatus = [
        { id: 'all', name: 'All Statuses' }, // Added "All" option
        { id: 'To Do', name: 'To Do' },
        { id: 'In Progress', name: 'In Progress' },
        { id: 'Done', name: 'Done' },
        { id: 'Archived', name: 'Archived' }
    ];

    const sortList = [
        { id: 'all', name: 'Default' },
        { id: 'Name', name: 'Name' },
        { id: 'Due Date', name: 'Due Date' }
    ]

    const [view, setView] = useState(false) 
    const [taskItem, setTaskItem] = useState(null) 
    const [openAddTask, setOpenAddTask] = useState(false) 

    // Filters State
    const [statusFilter, setStatusFilter] = useState('all');
    const [projectFilter, setProjectFilter] = useState('all');
    const [sortFilter, setSortFilter] = useState('all');

    const handleStatusFilter = (value) => {
        setStatusFilter(value);
    };

    const handleProjectFilter = (value) => {
        setProjectFilter(value);
    };
    
    const handleSortFilter = (value) => {
        setSortFilter(value);
    };

    // ==========================================
    // 1. FILTER LOGIC (Combine Status AND Project)
    // ==========================================
    const filteredTasks = sampleTaskData.filter((task) => {
        // Check Status
        if (statusFilter !== 'all' && task.status !== statusFilter) {
            return false;
        }

        // Check Project
        // Note: projectFilter comes from HTML select as a string (e.g., "1")
        // task.projectId is usually a number (e.g., 1). 
        // We use != (loose inequality) to handle "1" != 1 correctly.
        // MAKE SURE your task data uses 'projectId' or 'project' to refer to the ID.
        if (projectFilter !== 'all' && task.project != projectFilter) { 
            return false;
        }

        return true;
    });

    // ==========================================
    // 2. SORT LOGIC
    // ==========================================
    const displayedTasks = [...filteredTasks].sort((a, b) => {
        if (sortFilter === 'Name') {
            return a.title.localeCompare(b.title);
        }
        if (sortFilter === 'Due Date') {
            return new Date(a.dueDate) - new Date(b.dueDate);
        }
        return 0; // Default order
    });


    return (
        <div className='flex flex-col h-screen mx-4'>
            {view && <ModalExpandTask item={taskItem} onClose={()=>setView(false)}/>}
            {openAddTask && <ModalAddTask onClose={()=>setOpenAddTask(false)}/>}

            <div className='sticky top-0 z-100 bg-gray-100 py-3'>
                <div className='flex flex-row justify-between items-center bg-none'>
                    <h1 className='m-0 p-0'>Tasks.</h1>
                    <button className='bg-red-500 mr-4 py-1.5 px-4 text-white font-medium rounded-full cursor-pointer'
                            onClick={()=>setOpenAddTask(true)}
                        >
                        <span className='mr-2'><i className="fa-solid fa-plus"></i></span>
                        New Task
                    </button>
                </div>

                {/* Filter Section */}
                <div className='flex flex-row gap-3 my-2'>
                    {/* Added onValueChange to all of them */}
                    <SelectOptions 
                        context={'Status'} 
                        items={taskStatus} 
                        onValueChange={handleStatusFilter}
                    />
                    
                    {/* Make sure projectSampleData has an 'all' option or add it manually like this: */}
                    <SelectOptions 
                        context={'Project'} 
                        items={[{id: 'all', name: 'All Projects'}, ...projectSampleData]} 
                        onValueChange={handleProjectFilter}
                    />
                    
                    <SelectOptions 
                        context={'Sort by'} 
                        items={sortList} 
                        onValueChange={handleSortFilter}
                    />
                </div>
            </div>
            
            <div className='mt-4 gap-3 grid grid-cols-[repeat(auto-fit,minmax(270px,1fr))]'>
                {/* Map over displayedTasks instead of sampleTaskData */}
                {displayedTasks.map((task)=>(
                    <TaskCard 
                        key={task.id} // Don't forget the KEY!
                        setTaskItem={setTaskItem} 
                        setView={setView}
                        item={task}
                    />
                ))}

                {displayedTasks.length === 0 && (
                    <p className="text-gray-500 mt-10 text-center col-span-full">No tasks found.</p>
                )}
            </div>
        </div>
    )
}

export default Task