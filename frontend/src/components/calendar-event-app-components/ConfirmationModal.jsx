import React from 'react'

function ConfirmationModal({ onClose, onConfirm, title, message }) {
    return (
        <div className='flex fixed inset-0 z-1100 bg-zinc-800/60 justify-center items-center backdrop-blur-sm'>
            <div className='flex flex-col gap-4 min-w-[350px] max-w-[400px] px-6 py-6 bg-white rounded-2xl shadow-xl font-medium'>
                
                <div className='flex flex-col gap-1'>
                    <span className='text-gray-900 font-bold text-2xl'>
                        {title || "Confirm Action"}
                    </span>
                    <p className='text-gray-600 font-normal leading-relaxed'>
                        {message || "Are you sure you want to proceed?"}
                    </p>
                </div>

                <div className='flex flex-row gap-3 mt-2'>
                    <button 
                        className='grow bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2.5 rounded-lg transition-colors duration-200'
                        onClick={onConfirm}>
                        Delete
                    </button>
                    <button 
                        className='grow bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-4 py-2.5 rounded-lg transition-colors duration-200'
                        onClick={onClose}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmationModal