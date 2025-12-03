import React from 'react'

function QuickProjectCard({projectName = 'Untitled', numTask = 0, percentage = 0, projectColor = 'bg-blue-500'}) {
    return (
        <div className='flex flex-row items-center gap-4 py-4 px-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50'>
            <div className={`w-4 h-4 rounded-full ${projectColor} mr-3`}></div>
            <div className='flex flex-col '>
                <span className='font-medium text-black text-lg'>{projectName}</span>
                <div className='flex flex-row gap-2 text-gray-500 text-sm'>
                    <span>
                        {numTask} Tasks &#8226;
                        {percentage}% Complete
                    </span>
                </div>
            </div>
            
        </div>
    )
}

export default QuickProjectCard