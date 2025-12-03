import React from 'react'

function Statcard({icon, value = 0, title, bgColor, iconColor}) {

    return (
        <div className='flex flex-row items-center p-6 bg-white shadow-md rounded-md transition duration-300 hover:-translate-y-1'>
            <div className={`flex items-center justify-center w-[60px] h-[60px] rounded-lg ${iconColor} ${bgColor} text-2xl mr-4`}>
                <i className={`${icon}`}></i>
            </div>

            <div className='flex flex-col'>
                <span className='text-2xl font-bold'>{value}</span>
                <span className='text-md text-gray-500'>{title}</span>
            </div>
        </div>
    )
}


export default Statcard