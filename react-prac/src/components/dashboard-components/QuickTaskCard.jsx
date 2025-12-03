import React from 'react'

function QuickTaskCard({taskName, dueDate = 'No Due Date', projectName = 'General', priority = 'Low'}) {
    return (
        <div className='flex flex-row justify-between border-b border-gray-200 py-4 items-center cursor-pointer hover:bg-gray-50 px-2'>
            <div className='flex flex-row gap-3 items-center'>
                <input type="checkbox" className='cursor-pointer mb-2 mr-2 ml-3 h-4 w-4 accent-red-500'/>
                    <div className='flex flex-col'>
                        <span className='font-medium text-black text-lg'>{taskName}</span>
                        <div className='flex flex-row gap-2 text-gray-500'>
                            <div>
                                <i className='far fa-calendar'></i>
                                <span className='ml-1 text-sm '>Due: {dueDate}</span>
                            </div>
                                            
                            <div>
                                <i className='far fa-folder'></i>
                                <span className='ml-1 text-sm '>Project: {projectName === '' ? "General" : projectName}</span>
                            </div>
                    </div>
                </div>
            </div>
            <div className={`flex flex-row items-center justify-center text-sm font-semibold px-2 py-1.5 w-fit h-fit rounded-full 
                            ${priority === 'High' && 'text-red-500 bg-red-100'}
                            ${priority === 'Medium' && 'text-yellow-500 bg-yellow-100'}
                            ${priority === 'Low' && 'text-green-500 bg-green-100'}`}>
                {priority}
            </div>                                
        </div>
    )
}

export default QuickTaskCard