import React from 'react'
import { useState } from 'react';
import { createTask } from '../../https';

function ModalAddTask({ onClose, projects, refreshTasks }) {
    const [taskData, setTaskData] = useState({
        project_id: projects[0]?.id || '',
        title: '',
        description: '',
        due_date: '',
        assignee_ids: [],
        tag_ids: []
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!taskData.project_id || !taskData.title || !taskData.due_date) {
            setError('Please fill in all required fields');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await createTask(taskData);

            if (response.success) {
                alert('Task created successfully!');
                refreshTasks();
                onClose();
            } else {
                setError(response.error || 'Failed to create task');
            }
        } catch (err) {
            setError('Network error creating task');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='flex fixed justify-center overflow-y-scroll inset-0 z-1000 bg-zinc-300/80'>
            <div className='my-auto gap-2 flex flex-col min-w-100 bg-white shadow-md px-5 py-6 rounded-2xl font-medium'>
                <span className='text-gray-900 font-semibold text-2xl'>Create New Task</span>

                {error && (
                    <div className='text-red-500 text-sm'>{error}</div>
                )}

                <div className='flex flex-col gap-1'>
                    <span className='font-semibold text-gray-900'>Task Name *</span>
                    <input
                        placeholder='Name your task'
                        type='text'
                        value={taskData.title}
                        onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
                        className='min-w-100 w-100% border border-gray-300 py-2 px-3 rounded-sm'
                    />
                </div>

                <div className='flex flex-col gap-1'>
                    <span className='font-semibold text-gray-900'>Description</span>
                    <textarea
                        placeholder='Describe your task…'
                        value={taskData.description}
                        onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
                        className='min-w-100 w-100% border border-gray-300 py-2 px-3 rounded-sm'
                        rows="3"
                    />
                </div>

                <div className='flex flex-col'>
                    <span className='font-semibold text-gray-900'>Project *</span>
                    <select
                        className='min-w-100 w-100% border border-gray-300 py-2 px-3 rounded-sm cursor-pointer'
                        value={taskData.project_id}
                        onChange={(e) => setTaskData({ ...taskData, project_id: e.target.value })}
                    >
                        <option value="">Select a project</option>
                        {projects.map((project) => (
                            <option key={project.id} value={project.id}>
                                {project.title}
                            </option>
                        ))}
                    </select>
                </div>

                <div className='flex flex-col gap-1'>
                    <span className='font-semibold text-gray-900'>Due Date *</span>
                    <input
                        type='datetime-local'
                        value={taskData.due_date}
                        onChange={(e) => setTaskData({ ...taskData, due_date: e.target.value })}
                        className='min-w-100 w-100% border border-gray-300 py-2 px-3 rounded-sm'
                    />
                </div>

                <div className='flex flex-row justify-center gap-2 my-5'>
                    <button
                        className='py-2 w-40 rounded-md bg-green-600 font-semibold text-white disabled:bg-green-400'
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? 'Creating...' : 'Create Task'}
                    </button>

                    <button
                        className='py-2 w-40 rounded-md bg-red-600 font-semibold text-white'
                        onClick={onClose}
                        disabled={loading}
                    >
                        Discard
                    </button>
                </div>

            </div>

        </div>
    )
}

export default ModalAddTask