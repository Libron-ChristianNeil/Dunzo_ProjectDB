import React from 'react'

function ModalExpandTask({onClose}) {
    return (
        <div className='flex fixed justify-center overflow-y-scroll inset-0 z-1000 bg-zinc-300/80'>
            <div className='flex flex-row my-auto min-h-100 h-fit rounded-2xl shadow'>
                <div className='flex flex-col w-160 py-5 px-5 bg-white gap-1 transition duration-300'
                    onClick={() => setView(true)}>
                    <div className='flex flex-row justify-between'>
                        <div className='flex flex-row gap-2'>
                            <input type='checkbox'/>
                            <span className='text-xl text-gray-900 font-semibold'>Task Title</span>
                        </div>

                        <button>
                            <i className='fas fa-ellipsis-v'></i>
                        </button>
                        
                    </div>
                    <span className='text-[12px] text-gray-600 font-medium'>Date Created: Dec 12</span>
                    <span className='text-[12px] text-gray-600 font-medium'>Due: Dec 12</span>
                    {/* tags */}
                    <div className='flex flex-row gap-1'>
                        <div className='flex flex-row justify-center py-1 px-5 text-sm font-medium bg-red-500 rounded-full'>Tag1</div>
                        <div className='flex flex-row justify-center py-1 px-5 text-sm font-medium bg-blue-500 rounded-full'>Tag2</div>
                        <div className='flex flex-row justify-center py-1 px-5 text-sm font-medium  bg-yellow-500 rounded-full'>Tag3</div>
                    </div>
                    {/* Status and priority level */}
                    <div className='flex flex-row gap-1 my-2 font-medium text-sm'>
                            <div className='py-1 px-4  bg-red-100 text-red-600 rounded-md'>
                                High
                            </div>

                            <div className='py-1 px-4  bg-blue-100 text-blue-600 rounded-md'>
                                In Progress
                            </div>
                    </div>
                    <span className='text-md font-medium text-gray-900'>Members</span>
                    {/* Assignee */}
                    <div className='flex flex-row gap-1'>
                        <div className='flex items-center justify-center bg-orange-500 rounded-full h-9 w-9 
                                    text-white text-sm font-semibold border-white border-2 transition duration-300 hover:-translate-y-1 cursor-pointer'>
                            JV
                        </div>

                        <div className='flex items-center justify-center bg-blue-500 rounded-full h-9 w-9 
                                    text-white text-sm font-semibold border-white border-2 transition duration-300 hover:-translate-y-1 cursor-pointer'>
                            JT
                        </div>

                        <div className='flex items-center justify-center bg-white rounded-full h-9 w-9 
                                    text-gray-400 text-sm font-semibold border-gray-200 border-2 transition duration-300 hover:-translate-y-1 cursor-pointer'>
                            <i class="fa-solid fa-plus"></i>
                        </div>
                    </div>

                    <div className='flex flex-col mt-4'>
                        <span className='text-md font-medium text-gray-900'>Description</span>
                        <textarea
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

                    <input type></input>

                    <textarea
                        placeholder="Write a short description..."
                        className="w-full mt-0 p-2 border rounded resize-none overflow-hidden text-sm min-h-[60px]"
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