import React from 'react'

function ModalAddProject({onClose}) {
    const dateCreated = new Date(); //checker rani
    return (
        <div className='flex fixed inset-0 z-1000 bg-zinc-300/80 justify-center items-center '>
            <div className='flex flex-col gap-3 bg-white shadow-md px-5 py-6 rounded-2xl font-medium'>
                <span className=' text-gray-900 font-semibold text-2xl'>Create New Project</span>

                <div className='flex flex-col gap-1'>
                    <span className='font-semibold text-gray-900'>Project Name</span>
                    <input  placeholder='Name your project'
                            type='text'
                            className='min-w-100 w-100% border border-gray-300 py-2 px-3 rounded-sm'/>
                </div>

                <div className='flex flex-row gap-1 text-gray-800 items-center'>
                    <input  type='color'
                            className='h-10 w-15 border-none rounded'/>
                    <span>Pick a color for your project</span>
                </div>

                <div className='flex flex-col gap-1'>
                    <span className='font-semibold text-gray-900'>Project Description</span>
                    <input  placeholder='Describe your project…'
                            type='text'
                            className='min-w-100 w-100% border border-gray-300 py-2 px-3 rounded-sm'/>
                </div>

                <div className='grid grid-cols-2 gap-2'>
                    <div className='flex flex-col'>
                        <span className='font-semibold text-gray-900'>Start Date</span>
                        <input type='date'
                                className='py-2 px-3 border border-gray-300 rounded-sm'
                                />
                    </div>

                    <div className='flex flex-col'>
                        <span className='font-semibold text-gray-900'>End Date</span>
                        <input type='date'
                                className='py-2 px-3 border border-gray-300 rounded-sm'/>    
                    </div>
                    
                    
                </div>

                <div className='flex flex-col gap-1'>
                    <span className='font-semibold text-gray-900'>Project Description</span>
                    <input  placeholder='Describe your project…'
                            type='text'
                            className='min-w-100 w-100% border border-gray-300 py-2 px-3 rounded-sm'/>
                </div>

                <div className='flex flex-col gap-1'>
                    <span className='font-semibold text-gray-900'>Team</span>
                    <div>
                        <button className='h-9 w-9 rounded-full border-2 border-gray-400'>
                            <i class="fa-solid fa-plus text-gray-700"></i>
                        </button>
                    </div>
                </div>
                
                <div className='flex flex-row justify-center gap-2 my-5'>
                    <button className='py-2 w-40 rounded-md bg-green-600 font-semibold text-white'
                        onClick={onClose}>
                        Create Project
                    </button>

                    <button className='py-2 w-40 rounded-md bg-red-600 font-semibold text-white'
                        onClick={onClose}>
                        Discard
                    </button>
                </div>
            </div>
            
            
        </div>
        
    )
}

export default ModalAddProject