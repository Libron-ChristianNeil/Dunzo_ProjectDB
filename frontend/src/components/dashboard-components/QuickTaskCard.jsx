import React from 'react'

function QuickTaskCard({ item }) {
    return (
        <div className='flex flex-row justify-between border-b border-gray-200 py-4 items-center cursor-pointer hover:bg-gray-50 px-2'>
            <div className='flex flex-row gap-3 items-center'>
                <div className='flex flex-col'>
                    <span className='font-medium text-black text-lg'>{item.title}</span>
                    <div className='flex flex-row gap-2 text-gray-500'>
                        <div>
                            <i className='far fa-calendar'></i>
                            <span className='ml-1 text-sm '>Due: {item.due_date === '' ? 'No Due Date' : item.due_date}</span>
                        </div>

                        <div>
                            <i className='far fa-folder'></i>
                            <span className='ml-1 text-sm '>Project: {item.project === '' ? "General" : item.project}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className={`flex flex-row items-center justify-center text-sm font-semibold px-2 py-1.5 w-fit h-fit rounded-full 
                            ${item.priority === 'High' && 'text-red-500 bg-red-100'}
                            ${item.priority === 'Medium' && 'text-yellow-500 bg-yellow-100'}
                            ${item.priority === 'Low' && 'text-green-500 bg-green-100'}`}>
                {item.priority}
            </div>
        </div>
    )
}

export default QuickTaskCard