import React from 'react'
import TimelineEntryCard from './TimelineEntryCard'
function TimelineCard({ isExpanded = false, setIsExpanded, item }) {
    return (
        <div className='flex flex-col justify-center mx-auto bg-white px-3 py-2 shadow-md rounded-xl'>
            <div className='flex flex-row justify-between items-center min-w-[1000px]'>
                <div className='flex flex-row items-center gap-4'>
                    <div className='flex items-center justify-center bg-red-500 h-12 w-12 rounded-xl '>
                        <span className='font-bold text-white text-xl'>
                            {item.name?.[0] || '?'}
                        </span>
                    </div>
                    <h1 className='text-xl mt-3'>{item.name || 'Untitled'}</h1>
                </div>
                <button className='px-3 py-2 cursor-pointer' onClick={setIsExpanded}>
                    <i
                        className={`fa-solid fa-angle-down transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''
                            }`}
                    ></i>
                </button>
            </div>

            {isExpanded && (
                <div className='flex flex-col gap-2 mt-2'>
                    {(item.timeline || []).map((entry) => (
                        <TimelineEntryCard key={entry.id} item={entry} />
                    ))}
                </div>
            )}
        </div>
    )
}

export default TimelineCard