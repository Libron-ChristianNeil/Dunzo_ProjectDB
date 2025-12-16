import React from 'react'
import { useState, useEffect } from 'react';
import { createTask, getProjectDetails } from '../../https';

function ModalAddTask({ onClose, projects, refreshTasks }) {
    const [taskData, setTaskData] = useState({
        project_id: projects[0]?.project_id || projects[0]?.id || '',
        title: '',
        description: '',
        due_date: '',
        assignee_ids: [],
        tag_ids: []
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [userRole, setUserRole] = useState(null);
    const [checkingRole, setCheckingRole] = useState(false);

    // Check user's role when project changes
    useEffect(() => {
        const checkUserRole = async () => {
            if (!taskData.project_id) {
                setUserRole(null);
                return;
            }

            setCheckingRole(true);
            try {
                const res = await getProjectDetails(taskData.project_id);
                if (res.success && res.data) {
                    setUserRole(res.data.user_role);
                } else {
                    setUserRole(null);
                }
            } catch (err) {
                console.error('Error checking role:', err);
                setUserRole(null);
            } finally {
                setCheckingRole(false);
            }
        };

        checkUserRole();
    }, [taskData.project_id]);

    const canCreateTask = userRole === 'Leader' || userRole === 'Manager';

    const handleSubmit = async () => {
        if (!taskData.project_id || !taskData.title || !taskData.due_date) {
            setError('Please fill in all required fields');
            return;
        }

        // Check permission
        if (!canCreateTask) {
            setError('Only Leaders and Managers can create tasks for this project.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await createTask(taskData);

            if (response.success) {
                alert('Task created successfully!');
                refreshTasks?.();
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

                {/* Permission Warning */}
                {taskData.project_id && !checkingRole && !canCreateTask && (
                    <div className='bg-amber-50 border border-amber-200 text-amber-700 px-3 py-2 rounded-lg text-sm flex items-center gap-2'>
                        <i className="fa-solid fa-triangle-exclamation"></i>
                        <span>Only Leaders and Managers can create tasks for this project.</span>
                    </div>
                )}

                {error && (
                    <div className='text-red-500 text-sm bg-red-50 border border-red-200 px-3 py-2 rounded-lg'>{error}</div>
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
                        className='min-w-100 w-100% border border-gray-300 py-2 px-3 rounded-sm cursor-pointer bg-white text-gray-900'
                        value={taskData.project_id}
                        onChange={(e) => setTaskData({ ...taskData, project_id: e.target.value })}
                    >
                        <option value="">Select a project</option>
                        {projects.map((project) => (
                            <option key={project.project_id || project.id} value={project.project_id || project.id}>
                                {project.title || project.name || 'Untitled Project'}
                            </option>
                        ))}
                    </select>
                    {checkingRole && (
                        <span className='text-xs text-gray-500 mt-1'>Checking permissions...</span>
                    )}
                    {userRole && (
                        <span className='text-xs text-gray-500 mt-1'>Your role: {userRole}</span>
                    )}
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
                        className={`py-2 w-40 rounded-md font-semibold text-white ${canCreateTask ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'}`}
                        onClick={handleSubmit}
                        disabled={loading || checkingRole || !canCreateTask}
                    >
                        {loading ? 'Creating...' : 'Create Task'}
                    </button>

                    <button
                        className='py-2 w-40 rounded-md bg-red-600 font-semibold text-white hover:bg-red-700'
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