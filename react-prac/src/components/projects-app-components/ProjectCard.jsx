import React from 'react'

function ProjectCard({item}) {

    const getInitials = (name) =>
        name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .toUpperCase();
    
    return (
        <div className='flex flex-col rounded-xl bg-white p-6 min-w-100 gap-3 transition duration-300 hover:-translate-y-1 cursor-pointer'>
            {/* project icon */}
            <div className={`flex items-center justify-center bg-linear-to-br ${item.color} h-12 w-12 rounded-xl`}>
                <span className='font-bold text-white text-xl'>{item.name[0]}</span>
            </div>

            {/* project name */}
            <div className='flex flex-row justify-between'>
                <span className='font-semibold text-gray-900 text-md'>{item.name}</span>
                <i className='fas fa-ellipsis-v'></i>
            </div>

            {/* dates */}
            <div className='text-sm text-gray-700'>
                <p>Start Date: <span className='text-gray-900'>{item.startDate}</span></p>
                <p>End Date: <span className='text-gray-900'>{item.endDate}</span></p>
            </div>

            {/* Description */}
            <div className='text-gray-700 text-sm'>
                {item.desc}
            </div>

            {/* stats */}
            <div className='flex flex-row justify-around bg-gray-50 py-4 rounded-xl shadow-2xs'>
                <div className='flex flex-col items-center justify-center'>
                    <p className='font-bold text-xl text-gray-800 m-0 p-0'>{item.numTask}</p>
                    <p className='m-0 p-0 text-sm text-gray-600'>Task</p>
                </div>

                <div className='flex flex-col items-center justify-center'>
                    <p className='font-bold text-xl text-gray-800 m-0 p-0'>{item.numComplete}</p>
                    <p className='m-0 p-0 text-sm text-gray-600'>Done</p>
                </div>

                <div className='flex flex-col items-center justify-center'>
                    <p className='font-bold text-xl text-gray-800 m-0 p-0'>{item.numMembers}</p>
                    <p className='m-0 p-0 text-sm text-gray-600'>Team</p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className='flex flex-col'>
                <span className='text-gray-600 text-sm mb-1'>Overall Progress</span>
                <div className='bg-gray-300 w-full h-2 rounded-full shadow-2xl'>
                    <div className={`bg-green-500 h-2 rounded-full`} style={{ width: `${item.percentage}%` }}></div>
                </div>
            </div>
                    
            <div className='flex flex-row mt-3 justify-between align-middle'>
                {/* members */}
                <div>
                    <ul className='flex flex-row'>
                        {item.members.slice(0, 5).map((mem, index) => (
                            <li
                                key={mem.id}
                                className={`flex items-center justify-center ${mem.avatarColor} rounded-full h-9 w-9 text-white text-sm font-semibold border-white border-2 transition duration-300 hover:-translate-y-1 cursor-pointer
                                            ${index !== 0 ? 'ml-[-7px]' : ''}`}>
                                {getInitials(mem.name)}
                            </li>
                        ))}

                        {item.members.length > 5 && (
                            <li
                                className={`flex items-center justify-center bg-gray-600 rounded-full h-9 w-9 text-white text-sm font-semibold border-white border-2 ml-[-7px] transition duration-300 hover:-translate-y-1 cursor-pointer`}>
                                +{item.members.length - 5}
                            </li>
                        )}
                    </ul>
                </div>
                {/* status */}
                <div className={`flex flex-row items-center justify-center font-semibold py-1 px-4 rounded-full
                        ${item.status === 'Active' && 'bg-blue-100 text-blue-500'}
                        ${item.status === 'Completed' && 'bg-green-100 text-green-500'}
                        ${item.status === 'Archived' && 'bg-gray-200 text-gray-700'}`}>
                    {item.status}
                </div>
            </div>
        </div>
    )
}

export default ProjectCard