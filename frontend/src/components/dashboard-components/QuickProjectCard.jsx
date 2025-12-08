import React from 'react'

function QuickProjectCard({item}) {
    return (
        <div className='flex flex-row items-center gap-4 py-4 px-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50'>
            <div style={{ backgroundColor: item.color }}
                className={`w-4 h-4 rounded-full mr-3`}></div>
            <div className='flex flex-col '>
                <span className='font-medium text-black text-lg'>{item.name}</span>
                <div className='flex flex-row gap-2 text-gray-500 text-sm'>
                    <span>
                        {item.numTask} Tasks &#8226;
                        {item.percentage}% Complete
                    </span>
                </div>
            </div>
            
        </div>
    )
}

export default QuickProjectCard