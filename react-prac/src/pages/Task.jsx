import React from 'react'
import { useState } from 'react';
import SelectOptions from '../components/SelectOptions';
import ModalExpandTask from '../components/task-app-components/ModalExpandTask';
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

    //sample datas
    const projectList = [
        {id: 0, name: 'All'},
        {id: 1, name: 'ProjectDB'},
        {id: 2, name: 'Pyongyang AI Liberation Front'}
    ]

    const [view, setView] = useState(false)


    return (
        <div className='flex flex-col'>
            {view && <ModalExpandTask onClose={()=>setView(false)}/>}
            <div className='flex flex-row justify-between items-center bg-none py-3'>
                <h1 className='m-0 p-0'>Tasks</h1>
                <button className='bg-red-500 mr-4 py-1.5 px-4 text-white font-medium rounded-full cursor-pointer'>
                    <span className='mr-2'><i class="fa-solid fa-plus"></i></span>
                    New Task
                </button>
            </div>

            {/* filter */}
            <div className='flex flex-row gap-3 my-2'>
                <SelectOptions context={'Status'} items={taskStatus}/>
                <SelectOptions context={'Project'} items={projectList}/>
                <SelectOptions context={'Sort by'} items={sortList}/>
            </div>

            <div className='mt-4 gap-3 grid grid-cols-[repeat(auto-fit,minmax(270px,1fr))]'>
                <div className='flex flex-col max-w-100 py-3 px-4 bg-white rounded-xl shadow gap-1 transition duration-300 hover:-translate-y-1 cursor-pointer'
                    onClick={() => setView(true)}>
                    <div className='flex flex-row justify-between'>
                        <div className='flex flex-row gap-2'>
                            <input type='checkbox'/>
                            <span className='text-md text-gray-900 font-semibold'>Task Title</span>
                        </div>

                        <button>
                            <i className='fas fa-ellipsis-v'></i>
                        </button>
                        
                    </div>
                    <span className='text-[12px] text-gray-600 font-medium'>Due: Dec 12</span>
                    {/* tags */}
                    <div className='flex flex-row gap-1 h-2'>
                        <div className='h-2 w-15 bg-red-500 rounded-full'></div>
                        <div className='h-2 w-15 bg-blue-500 rounded-full'></div>
                        <div className='h-2 w-15 bg-yellow-500 rounded-full'></div>
                    </div>
                    {/* Status and priority level */}
                    <div className='flex flex-row gap-1 my-2 font-medium text-sm'>
                            <div className='py-1 px-4  bg-red-100 text-red-600 rounded-md'>
                                High
                            </div>

                            <div className='py-1 px-4  bg-blue-100 text-blue-600 rounded-md'>
                                In Progress
                            </div>
                    </div>
                    
                    {/* Assignee */}
                    <div className='flex flex-row gap-1 justify-end'>
                        <div className='flex items-center justify-center bg-orange-500 rounded-full h-9 w-9 
                                    text-white text-sm font-semibold border-white border-2 transition duration-300 hover:-translate-y-1 cursor-pointer'>
                            JV
                        </div>

                        <div className='flex items-center justify-center bg-blue-500 rounded-full h-9 w-9 
                                    text-white text-sm font-semibold border-white border-2 transition duration-300 hover:-translate-y-1 cursor-pointer'>
                            JT
                        </div>
                    </div>
                </div>

                
            </div>
        </div>
    )
}

export default Task