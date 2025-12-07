import React from 'react'
import { useState } from 'react';
import { projectSampleData } from '../../data/projectSampleData'
function ModalAddTask({onClose}) {

    const [selected, setSelected] = useState(projectSampleData[0]?.id || "");

    return (
        <div className='flex fixed justify-center overflow-y-scroll inset-0 z-1000 bg-zinc-300/80'>
            <div className='my-auto gap-2 flex flex-col min-w-100 bg-white shadow-md px-5 py-6 rounded-2xl font-medium'>
                <span className=' text-gray-900 font-semibold text-2xl'>Create New Task</span>

                <div className='flex flex-col gap-1'>
                    <span className='font-semibold text-gray-900'>Task Name</span>
                    <input  placeholder='Name your task'
                            type='text'
                            className='min-w-100 w-100% border border-gray-300 py-2 px-3 rounded-sm'/>
                </div>

                <div className='flex flex-col gap-1'>
                    <span className='font-semibold text-gray-900'>Description</span>
                    <input  placeholder='Describe your task…'
                            type='text'
                            className='min-w-100 w-100% border border-gray-300 py-2 px-3 rounded-sm'/>
                </div>

                <div className='flex flex-col'>
                    <span className='font-semibold text-gray-900'>Project</span>

                    <select className='min-w-100 w-100% border border-gray-300 py-2 px-3 rounded-sm cursor-pointer'
                        value={selected} onChange={(e) => setSelected(e.target.value)}>
                        {projectSampleData.map((project) => (
                            <option key={project.id} 
                                    value={project.id}>
                                {project.name}
                            </option>
                        ))}
                    </select>
                </div>
                
                <div className='flex flex-row justify-center gap-2 my-5'>
                    <button className='py-2 w-40 rounded-md bg-green-600 font-semibold text-white'
                        onClick={onClose}>
                        Create Task
                    </button>

                    <button className='py-2 w-40 rounded-md bg-red-600 font-semibold text-white'
                        onClick={onClose}>
                        Discard
                    </button>
                </div>

            </div>
            
        </div>
    )
}

export default ModalAddTask