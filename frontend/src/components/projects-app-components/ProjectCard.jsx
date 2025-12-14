import React from 'react'
import { getInitials } from '../../utils/getInitials';

function ProjectCard({ project, setViewProject, setSelectedProjectId }) {
    // Guard against undefined project
    if (!project) {
        return null;
    }

    const handleClick = () => {
        setSelectedProjectId(project.project_id);
        setViewProject(true);
    };

    return (
        <div className='flex flex-col rounded-xl shadow bg-white p-6 min-w-100 gap-3 transition duration-300 hover:-translate-y-1 cursor-pointer'
            onClick={handleClick}>
            {/* ... (rest of the JSX remains the same) */}

            {/* dates */}
            <div className='text-sm text-gray-700'>
                <p>Start Date: <span className='text-gray-900'>{new Date(project.start_date).toLocaleDateString()}</span></p>
                <p>End Date: <span className='text-gray-900'>{new Date(project.end_date).toLocaleDateString()}</span></p>
            </div>

            {/* ... (rest of the JSX remains the same) */}
        </div>
    )
}

export default ProjectCard