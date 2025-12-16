import React from 'react'

function QuickProjectCard({ item }) {
    const name = item.name || item.title || 'Untitled Project';
    const color = item.color || '#ef4444';

    return (
        <div className='flex flex-row items-center gap-4 py-4 px-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50'>
            <div style={{ backgroundColor: color }}
                className={`w-4 h-4 rounded-full mr-3`}></div>
            <div className='flex flex-col '>
                <span className='font-medium text-black text-lg'>{name}</span>
            </div>
        </div>
    )
}

export default QuickProjectCard