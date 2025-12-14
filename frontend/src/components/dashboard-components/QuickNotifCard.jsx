import React from 'react'

function QuickNotifCard({ notificationContext, time }) {
    return (
        <div className='flex flex-row items-center gap-4 py-4 px-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50'>

            <span className='text-red-600 text-xl'><i className="fa-solid fa-bell"></i></span>
            <div className='flex flex-col '>
                <span className='font-medium text-black text-md'>{notificationContext}</span>
                <div className='flex flex-row gap-2 text-gray-500 text-sm'>
                    <span>
                        {time}
                    </span>
                </div>
            </div>
        </div>

    )
}

export default QuickNotifCard