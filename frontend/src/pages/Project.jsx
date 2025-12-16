import React, { useState, useEffect } from 'react';
import { getProjects } from '../https';
import SelectOptions from '../components/SelectOptions';
import ProjectCard from '../components/projects-app-components/ProjectCard';
import ModalAddProject from '../components/projects-app-components/ModalAddProject';
import ModalExpandProject from '../components/projects-app-components/ModalExpandProject';

function Project() {

    const projectStatuses = [
        { id: 'Active', name: 'Active' },
        { id: 'Completed', name: 'Completed' },
        { id: 'Archived', name: 'Archived' },
    ];

    const sortList = [
        { id: 'Name', name: 'Name' },
        { id: 'Progress', name: 'Progress' },
        { id: 'Due Date', name: 'Due Date' }
    ];

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedProjectStatus, setSelectedProjectStatus] = useState('Active');
    const [selectedSortOption, setSelectedSortOption] = useState('all');

    // Fetch projects from API
    const fetchProjects = async () => {
        setLoading(true);
        try {
            const response = await getProjects(selectedProjectStatus === 'all' ? 'Active' : selectedProjectStatus);
            if (response.success) {
                setProjects(response.projects || []);
            } else {
                setError('Failed to load projects');
            }
        } catch (err) {
            setError('Network error loading projects');
        } finally {
            setLoading(false);
        }
    };

    // Fetch on mount and when filter changes
    useEffect(() => {
        fetchProjects();
    }, [selectedProjectStatus]);

    const handleProjectStatusFilter = (value) => {
        setSelectedProjectStatus(value);
    };

    const handleSortOptionChange = (value) => {
        setSelectedSortOption(value);
    };

    // ==========================================
    // SORT STEP
    // ==========================================
    const displayedProjects = [...projects].sort((a, b) => {

        if (selectedSortOption === 'Name') {
            return (a.title || '').localeCompare(b.title || '');
        }

        if (selectedSortOption === 'Progress') {
            return (b.percentage || 0) - (a.percentage || 0);
        }

        if (selectedSortOption === 'Due Date') {
            return new Date(a.end_date) - new Date(b.end_date);
        }

        // Default: Sort by ID
        return (a.project_id || 0) - (b.project_id || 0);
    });

    //for modal
    const [openAddProject, setOpenAddProject] = useState(false);
    const [viewProject, setViewProject] = useState(false);
    const [projectItem, setProjectItem] = useState(null);

    // Transform API project to format expected by ProjectCard
    const transformProject = (project) => ({
        ...project,
        id: project.project_id || project.id,
        name: project.title,
        desc: project.description,
        startDate: project.start_date ? new Date(project.start_date).toLocaleDateString() : '',
        endDate: project.end_date ? new Date(project.end_date).toLocaleDateString() : '',
        numTask: project.total_tasks || 0,
        numComplete: project.completed_tasks || 0,
        numMembers: project.member_count || 0,
        percentage: project.progress || 0,
        color: '#EF4444', // Default red color
        members: project.members || [],
    });

    return (
        <div className='flex flex-col h-screen mx-4'>
            {openAddProject && (
                <ModalAddProject
                    onClose={() => setOpenAddProject(false)}
                    onSuccess={fetchProjects}
                />
            )}
            {viewProject && (
                <ModalExpandProject
                    item={projectItem}
                    onClose={() => setViewProject(false)}
                    onUpdate={fetchProjects}
                />
            )}

            <div className='sticky top-0 z-100 bg-gray-100 py-3'>
                <div className='flex flex-row justify-between items-center bg-none'>
                    <h1 className='m-0 p-0'>Projects.</h1>
                    <button className='bg-red-500 mr-4 py-1.5 px-4 text-white font-medium rounded-full cursor-pointer'
                        onClick={() => setOpenAddProject(true)}>
                        <span className='mr-2'><i className="fa-solid fa-plus"></i></span>
                        New Project
                    </button>

                </div>

                {/* filter */}
                <div className='flex flex-row gap-3 my-2'>
                    <SelectOptions
                        context={'Status'}
                        items={projectStatuses}
                        onValueChange={handleProjectStatusFilter} />

                    <SelectOptions
                        context={'Sort by'}
                        items={sortList}
                        onValueChange={handleSortOptionChange}
                    />
                </div>
            </div>

            <div className='mt-4 grid gap-4 grid-cols-[repeat(auto-fit,minmax(360px,1fr))]'>
                {loading ? (
                    <p className="mx-auto my-auto">Loading projects...</p>
                ) : error ? (
                    <p className="mx-auto my-auto">{error}</p>
                ) : displayedProjects.length === 0 ? (
                    <p className="mx-auto my-auto">No projects found.</p>
                ) : (
                    displayedProjects.map((project) => (
                        <ProjectCard
                            key={project.project_id || project.id}
                            item={transformProject(project)}
                            setViewProject={setViewProject}
                            setProjectItem={setProjectItem}
                        />
                    ))
                )}
            </div>
        </div>
    )
}

export default Project;