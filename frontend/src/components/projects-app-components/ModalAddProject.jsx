import React, { useState } from 'react'
import { createProject } from '../../https';

function ModalAddProject({ onClose, onSuccess }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!title || !startDate || !endDate) {
            alert('Please fill in all required fields');
            return;
        }

        setLoading(true);
        const result = await createProject({
            title: title,
            description: description,
            start_date: startDate,
            end_date: endDate
        });

        setLoading(false);

        if (result.success) {
            alert('Project created successfully!');
            onSuccess?.();
            onClose();
        } else {
            alert(`Failed to create project: ${result.error}`);
        }
    };

    return (
        <div className='flex fixed inset-0 z-1000 bg-zinc-300/80 justify-center items-center '>
            <div className='flex flex-col gap-3 bg-white shadow-md px-5 py-6 rounded-2xl font-medium'>
                <span className=' text-gray-900 font-semibold text-2xl'>Create New Project</span>

                <div className='flex flex-col gap-1'>
                    <span className='font-semibold text-gray-900'>Project Name *</span>
                    <input
                        placeholder='Name your project'
                        type='text'
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className='min-w-100 w-100% border border-gray-300 py-2 px-3 rounded-sm' />
                </div>

                <div className='flex flex-col gap-1'>
                    <span className='font-semibold text-gray-900'>Project Description</span>
                    <input
                        placeholder='Describe your project…'
                        type='text'
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className='min-w-100 w-100% border border-gray-300 py-2 px-3 rounded-sm' />
                </div>

                <div className='grid grid-cols-2 gap-2'>
                    <div className='flex flex-col'>
                        <span className='font-semibold text-gray-900'>Start Date *</span>
                        <input
                            type='date'
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className='py-2 px-3 border border-gray-300 rounded-sm'
                        />
                    </div>

                    <div className='flex flex-col'>
                        <span className='font-semibold text-gray-900'>End Date *</span>
                        <input
                            type='date'
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className='py-2 px-3 border border-gray-300 rounded-sm' />
                    </div>
                </div>

                <div className='flex flex-row justify-center gap-2 my-5'>
                    <button
                        className={`py-2 w-40 rounded-md font-semibold text-white ${loading ? 'bg-green-400' : 'bg-green-600'}`}
                        onClick={handleSubmit}
                        disabled={loading}>
                        {loading ? 'Creating...' : 'Create Project'}
                    </button>

                    <button
                        className='py-2 w-40 rounded-md bg-red-600 font-semibold text-white'
                        onClick={onClose}
                        disabled={loading}>
                        Discard
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ModalAddProject