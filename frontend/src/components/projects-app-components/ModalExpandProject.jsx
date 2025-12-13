import React, { useState, useEffect } from 'react'
import { formatToDateInput } from '../../utils/formatToDateInput';
import { getInitials } from '../../utils/getInitials'
import { useNavigate} from 'react-router-dom';
import {
    getProjectDetails,
    updateProject,
    addProjectMember,
    removeProjectMember,
    updateProjectMemberRole,
    createTag,
    updateTag,
    deleteTag
} from '../../utils/https';

function ModalExpandProject({projectId, onClose, onDelete, onUpdate}) {
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);

    // ... (rest of the state variables remain the same)

    const fetchProjectDetails = async () => {
        setLoading(true);
        const result = await getProjectDetails(projectId);
        if (result.success) {
            const projectData = result.project;
            setProject(projectData);
            setTitle(projectData.title);
            setDescription(projectData.description || '');
            setStartDate(formatToDateInput(projectData.start_date));
            setEndDate(formatToDateInput(projectData.end_date));
            setStatus(projectData.status);
        } else {
            alert(`Failed to load project: ${result.error}`);
            onClose();
        }
        setLoading(false);
    };

    // ... (rest of the functions remain the same)

    return (
        <div className='flex fixed justify-center overflow-y-scroll inset-0 z-1000 bg-zinc-300/80 p-4'>
            {/* Item */}
            <div className='flex flex-row my-auto min-h-100 h-fit rounded-2xl shadow max-w-6xl w-full'>
                <div className='flex flex-col bg-white p-6 flex-1 gap-3 overflow-y-auto'>
                    {/* ... (rest of the JSX remains the same) */}

                    {/* dates */}
                    <div className='text-sm text-gray-700'>
                        <div className='flex flex-row gap-2 items-center mb-2'>
                            <p className='w-20'>Start Date</p>
                            {editMode ? (
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="border rounded px-2 py-1"
                                />
                            ) : (
                                <span className='text-gray-900'>{new Date(project.start_date).toLocaleDateString()}</span>
                            )}
                        </div>

                        <div className='flex flex-row gap-2 items-center'>
                            <p className='w-20'>End Date</p>
                            {editMode ? (
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="border rounded px-2 py-1"
                                />
                            ) : (
                                <span className='text-gray-900'>{new Date(project.end_date).toLocaleDateString()}</span>
                            )}
                        </div>
                    </div>

                    {/* ... (rest of the JSX remains the same) */}
                </div>
            </div>
        </div>
    )
}

export default ModalExpandProject