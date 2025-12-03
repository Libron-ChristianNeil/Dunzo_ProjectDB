import React from 'react'

function QuickDeadlineCard({deadlineContext, date}) {
    return (
        <div className='flex flex-row items-center gap-4 py-4 px-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50'>
            <div className='flex flex-col '>
                <span className='font-medium text-black text-md'>{deadlineContext}</span>
                <div className='flex flex-row gap-2 text-gray-500'>
                    <div>
                        <i className='far fa-calendar'></i>
                        <span className='ml-1 text-sm '>{date}</span>
                    </div>
                </div>
            </div>     
        </div>
    )
}

export default QuickDeadlineCard