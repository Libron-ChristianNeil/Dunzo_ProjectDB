import React from 'react'
import { useState } from 'react';
import { sampleTaskData } from '../data/taskSampleData';
import { projectSampleData } from '../data/projectSampleData';
import SelectOptions from '../components/SelectOptions';
import TaskCard from '../components/task-app-components/TaskCard';
import ModalExpandTask from '../components/task-app-components/ModalExpandTask';
import ModalAddTask from '../components/task-app-components/ModalAddTask';
function Task() {
    
    // para dali ra ma edit lols XDXDXD
    const taskStatus = [
        { id: 0, name: 'All' },
        { id: 1, name: 'To Do' },
        { id: 2, name: 'In Progress' },
        { id: 3, name: 'Done' },
        { id: 4, name: 'Archived' }
    ];

    const sortList = [
        { id: 0, name: 'Recent' },
        { id: 1, name: 'Name' },
        { id: 2, name: 'Due Date' }
    ]

    const [view, setView] = useState(false) //for sa view task pero ari ibutang kay mao man ang parent
    const [taskItem, setTaskItem] = useState(null) // para sa pagselect sa item ex(task[0] <-- mao ni i display)
    const [openAddTask, setOpenAddTask] = useState(false) // para sa modal sa add task


    return (
        <div className='flex flex-col h-screen mx-4'>
            {view && <ModalExpandTask  item={taskItem} onClose={()=>setView(false)}/>}
            {openAddTask && <ModalAddTask onClose={()=>setOpenAddTask(false)}/>}

            <div className='sticky top-0 z-100 bg-gray-100 py-3'>
                <div className='flex flex-row justify-between items-center bg-none'>
                    <h1 className='m-0 p-0'>Tasks.</h1>
                    <button className='bg-red-500 mr-4 py-1.5 px-4 text-white font-medium rounded-full cursor-pointer'
                            onClick={()=>setOpenAddTask(true)}
                        >
                        <span className='mr-2'><i class="fa-solid fa-plus"></i></span>
                        New Task
                    </button>
                </div>

                {/* filter */}
                <div className='flex flex-row gap-3 my-2'>
                    <SelectOptions context={'Status'} items={taskStatus}/>
                    <SelectOptions context={'Project'} items={projectSampleData}/>
                    <SelectOptions context={'Sort by'} items={sortList}/>
                </div>
            </div>
            

            <div className='mt-4 gap-3 grid grid-cols-[repeat(auto-fit,minmax(270px,1fr))]'>
                {sampleTaskData.map((task)=>(
                    <TaskCard setTaskItem={setTaskItem} 
                            setView={setView}
                            item={task}/>
                ))}
            </div>
        </div>
    )
}

export default Task