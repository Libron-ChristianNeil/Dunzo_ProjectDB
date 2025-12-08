import React from 'react'
import { useState } from 'react'

function TaskCard({setView, item, setTaskItem}) {
    const getInitials = (name) =>
        name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .toUpperCase();

    return (
        <div className='flex flex-col max-w-100 py-5 px-4 bg-white rounded-xl shadow gap-1 transition duration-300 hover:-translate-y-1 cursor-pointer'>
            <div className='flex flex-row justify-between'>
                <div className='flex flex-row gap-2 items-center'>
                    <input type='checkbox' className='h-4 w-4 accent-red-500'/>
                    <span className='text-md text-gray-900 font-semibold'>{item.title}</span>
                </div>

                <button 
                        onClick={() => {
                            setView(true); 
                            setTaskItem(item);
                            }}>
                    <i className='fas fa-ellipsis-v w-4'></i>
                </button>                           
            </div>

            <span className='text-[12px] text-gray-600 font-medium'>{item.due_date}</span>
            {/* tags */}
            <div className='flex flex-row gap-1 h-2'>
                {item.tags.map((tag)=>(
                    <div key={tag.id} 
                        className='h-2 w-15 rounded-full'
                        style={{ backgroundColor: tag.color }}
                        ></div>
                ))}
            </div>

            <div className='flex flex-row text-medium text-gray-700 my-1 gap-2 items-center'>
                <i class="fa-regular fa-folder"></i>
                <span>{item.project === '' ? 'General' : item.project}</span>
            </div>

            {/* Status and priority level */}
            <div className='flex flex-row gap-1 font-medium text-sm'>
                <div className={`py-1 px-4 rounded-md
                        ${item.priority === 'High' && 'text-red-500 bg-red-100'}
                        ${item.priority === 'Medium' && 'text-yellow-500 bg-yellow-100'}
                        ${item.priority === 'Low' && 'text-green-500 bg-green-100'}
                    `}>
                    {item.priority}
                </div>

                <div className={`py-1 px-4 rounded-md
                                ${item.status === 'To Do' && 'bg-blue-100 text-blue-500'}
                                ${item.status === 'In Progress' && 'bg-amber-100 text-amber-500'}
                                ${item.status === 'Done' && 'bg-green-100 text-green-500'}
                                ${item.status === 'Archived' && 'bg-gray-200 text-gray-500'}
                `}>
                    {item.status}
                </div>
            </div>

            
                        
            {/* Assignee */}
            <div className='flex flex-row justify-end'>
                {item.users.slice(0, 3).map((mem, index) => (
                    <div
                    key={mem.id}
                    style={{ backgroundColor: mem.color }}
                    className={`flex items-center justify-center rounded-full h-9 w-9 text-white text-sm font-semibold border-white border-2 transition duration-300 hover:-translate-y-1 cursor-pointer ${
                        index !== 0 ? 'ml-[-7px]' : ''
                    }`}
                    >
                    {getInitials(mem.name)}
                    </div>
                ))}

                {item.users.length > 5 && (
                    <li
                        className={`flex items-center justify-center bg-gray-600 rounded-full h-9 w-9 text-white text-sm font-semibold border-white border-2 ml-[-7px] transition duration-300 hover:-translate-y-1 cursor-pointer`}>
                        +{item.users.length - 3}
                    </li>
                )}
            </div>
        </div>
    )
}

export default TaskCard