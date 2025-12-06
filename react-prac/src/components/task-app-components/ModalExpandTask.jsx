import React from 'react'

function ModalExpandTask({item, onClose}) {

    const getInitials = (name) =>
        name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .toUpperCase();


    return (
        <div className='flex fixed justify-center overflow-y-scroll inset-0 z-1000 bg-zinc-300/80'>
            <div className='flex flex-row my-auto min-h-100 h-fit rounded-2xl shadow'>
                <div className='flex flex-col w-160 py-5 px-5 bg-white gap-1 transition duration-300'
                    onClick={() => setView(true)}>
                    <div className='flex flex-row justify-between'>
                        <div className='flex flex-row gap-2'>
                            <input type='checkbox'/>
                            <span className='text-xl text-gray-900 font-semibold'>{item.title}</span>
                        </div>

                        <button>
                            <i className="fa-regular fa-pen-to-square"></i>
                        </button>
                        
                    </div>
                    <span className='text-[12px] text-gray-600 font-medium'>Date Created: {item.created_at}</span>
                    <span className='text-[12px] text-gray-600 font-medium'>Due Date: {item.due_date}</span>
                    {/* tags */}
                    <div className='flex flex-row gap-1'>
                        <div className='flex flex-row items-center border-2 w-7 border-gray-300 bg-gray-100 text-gray-600 justify-center text-sm font-medium rounded-full'>
                            <i class="fa-solid fa-plus"></i>
                        </div>  
                        {item.tags.map((tag)=>(
                            <div key={tag.id} 
                                className='flex flex-row justify-center py-1 px-5 text-sm font-medium rounded-full'
                                style={{ backgroundColor: tag.color }}>
                                    {tag.name}
                            </div>
                        ))}
                        
                    </div>

                    <div className='flex flex-row text-medium text-gray-700 my-1 gap-2 items-center'>
                        <i class="fa-regular fa-folder"></i>
                        <span>{item.project === '' ? 'General' : item.project}</span>
                    </div>
                    
                    {/* Status and priority level */}
                    <div className='flex flex-row gap-1 font-medium text-sm'>
                        <div className={`py-1 px-4 rounded-md
                                ${item.priority === 'High' && 'text-red-500 bg-red-100'}
                                ${item.priority === 'Medium' && 'text-yellow-500 bg-yellow-100'}
                                ${item.priority === 'Low' && 'text-green-500 bg-green-100'}
                            `}>
                            {item.priority}
                        </div>

                        <div className={`py-1 px-4 rounded-md
                                        ${item.status === 'To Do' && 'bg-blue-100 text-blue-500'}
                                        ${item.status === 'In Progress' && 'bg-amber-100 text-amber-500'}
                                        ${item.status === 'Done' && 'bg-green-100 text-green-500'}
                                        ${item.status === 'Archived' && 'bg-gray-200 text-gray-500'}
                        `}>
                            {item.status}
                        </div>
                    </div>

                    <span className='text-md mt-2 font-medium text-gray-900'>Members</span>
                    {/* Assignee */}
                    <div className='flex flex-row gap-1'>
                        <div className='flex items-center justify-center rounded-full h-9 w-9 bg-gray-100 text-gray-600 text-sm font-semibold border-gray-300 border-2 cursor-pointer'>
                            <i class="fa-solid fa-plus"></i>
                        </div>
                        {item.users.map((mem, index) => (
                            <div
                            key={mem.id}
                            style={{ backgroundColor: mem.color }}
                            className='flex items-center justify-center rounded-full h-9 w-9 text-white text-sm font-semibold border-white border-2 transition duration-300 hover:-translate-y-1 cursor-pointer'
                            >
                            {getInitials(mem.name)}
                            </div>
                        ))}
                    </div>

                    <div className='flex flex-col mt-4'>
                        <span className='text-md font-medium text-gray-900'>Description</span>
                        <textarea
                            value={item.description}
                            className="w-full p-2 border rounded resize-none overflow-hidden"
                            onInput={(e) => {
                                e.target.style.height = "auto";
                                e.target.style.height = `${e.target.scrollHeight}px`;
                            }}
                        />

                    </div>

                </div>

                <div className='flex flex-col w-120 py-5 px-5 bg-gray-100'>
                    <div className='flex flex-row justify-between gap-2 '>
                        <div className='flex flex-row items-center gap-2 text-md font-medium text-gray-900'>
                            <i class="fa-regular fa-message"></i>
                            <span>Comments</span>
                        </div>

                        <button className='cursor-pointer'onClick={onClose}>
                            <i class="fa-regular fa-circle-xmark text-xl"></i>
                        </button>
                        
                    </div>
                    
                    <textarea
                        placeholder="Write a short description..."
                        className="w-full mt-2 p-2 border rounded resize-none overflow-hidden text-sm min-h-[60px]"
                        onInput={(e) => {
                            e.target.style.height = "auto";
                            e.target.style.height = `${e.target.scrollHeight}px`;
                        }}
                    />

                </div>

                
            </div>
        </div>
    )
}

export default ModalExpandTask