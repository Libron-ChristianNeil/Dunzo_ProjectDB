import React from 'react'

function TaskCard({setView, item, setTaskItem}) {
    const getInitials = (name) =>
        name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .toUpperCase();

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div
            className='flex flex-col max-w-100 py-5 px-4 bg-white rounded-xl shadow gap-1 transition duration-300 hover:-translate-y-1 cursor-pointer'
            onClick={() => {
                setView(true);
                setTaskItem(item);
            }}
        >
            <div className='flex flex-row justify-between'>
                <div className='flex flex-row gap-2 items-center'>
                    <input
                        type='checkbox'
                        className='h-4 w-4 accent-red-500'
                        checked={item.status === 'Done'}
                        readOnly
                    />
                    <span className='text-md text-gray-900 font-semibold'>{item.title}</span>
                </div>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setView(true);
                        setTaskItem(item);
                    }}
                >
                    <i className='fas fa-ellipsis-v w-4'></i>
                </button>
            </div>

            <span className='text-[12px] text-gray-600 font-medium'>
                Due: {formatDate(item.due_date)}
            </span>

            {/* tags */}
            <div className='flex flex-row gap-2 h-5 my-1'>
                {item.tags && item.tags.map((tag) => (
                    <div
                        key={tag.id}
                        className='h-5 px-2 rounded-full text-xs flex items-center justify-center text-white font-medium'
                        style={{ backgroundColor: tag.hex_color }}
                    >
                        {tag.name}
                    </div>
                ))}
            </div>

            {/* Status */}
            <div className='flex flex-row gap-1 font-medium text-sm my-2'>
                <div className={`py-1 px-4 rounded-md
                                ${item.status === 'To Do' && 'bg-blue-100 text-blue-500'}
                                ${item.status === 'In Progress' && 'bg-amber-100 text-amber-500'}
                                ${item.status === 'Done' && 'bg-green-100 text-green-500'}
                                ${item.status === 'Archived' && 'bg-gray-200 text-gray-500'}
                `}>
                    {item.status}
                </div>
            </div>

            {/* Assignees */}
            <div className='flex flex-row justify-end'>
                {item.assignees && item.assignees.slice(0, 3).map((mem, index) => (
                    <div
                        key={mem.user_id}
                        style={{ backgroundColor: `hsl(${mem.user_id * 137.508 % 360}, 70%, 60%)` }}
                        className={`flex items-center justify-center rounded-full h-9 w-9 text-white text-sm font-semibold border-white border-2 transition duration-300 hover:-translate-y-1 cursor-pointer ${
                            index !== 0 ? 'ml-[-7px]' : ''
                        }`}
                        title={`${mem.username} (${mem.role})`}
                    >
                        {getInitials(mem.username)}
                    </div>
                ))}

                {item.assignees && item.assignees.length > 3 && (
                    <div
                        className={`flex items-center justify-center bg-gray-600 rounded-full h-9 w-9 text-white text-sm font-semibold border-white border-2 ml-[-7px] transition duration-300 hover:-translate-y-1 cursor-pointer`}
                        title={`${item.assignees.length - 3} more assignees`}
                    >
                        +{item.assignees.length - 3}
                    </div>
                )}
            </div>
        </div>
    )
}

export default TaskCard