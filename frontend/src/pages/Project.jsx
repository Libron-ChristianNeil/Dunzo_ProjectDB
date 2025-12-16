import React, { useState, useEffect } from 'react';
import { getProjects } from '../https';
import SelectOptions from '../components/SelectOptions';
import ProjectCard from '../components/projects-app-components/ProjectCard';
import ModalAddProject from '../components/projects-app-components/ModalAddProject';
import ModalExpandProject from '../components/projects-app-components/ModalExpandProject';

function Project() {

    const projectStatuses = [
        { id: 'All', name: 'All' },
        { id: 'Active', name: 'Active' },
        { id: 'Complete', name: 'Complete' },
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
    const [selectedSortOption, setSelectedSortOption] = useState('Name');

    // Fetch projects from API
    const fetchProjects = async () => {
        setLoading(true);
        try {
            const response = await getProjects(selectedProjectStatus);
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
        // Get values with fallbacks for different field names
        const nameA = (a.title || a.name || '').toLowerCase();
        const nameB = (b.title || b.name || '').toLowerCase();
        const progressA = a.progress || a.percentage || 0;
        const progressB = b.progress || b.percentage || 0;
        const dateA = a.end_date || a.endDate || '';
        const dateB = b.end_date || b.endDate || '';

        if (selectedSortOption === 'Name') {
            return nameA.localeCompare(nameB);
        }

        if (selectedSortOption === 'Progress') {
            return progressB - progressA; // Higher progress first
        }

        if (selectedSortOption === 'Due Date') {
            if (!dateA && !dateB) return 0;
            if (!dateA) return 1; // No date goes to end
            if (!dateB) return -1;
            return new Date(dateA) - new Date(dateB); // Earliest due date first
        }

        // Default: Sort by ID
        return (a.project_id || a.id || 0) - (b.project_id || b.id || 0);
    });

    //for modal
    const [openAddProject, setOpenAddProject] = useState(false);
    const [viewProject, setViewProject] = useState(false);
    const [projectItem, setProjectItem] = useState(null);

    // Transform API project to format expected by ProjectCard
    const transformProject = (project) => ({
        ...project,
        id: project.project_id || project.id,
        name: project.title || project.name,
        desc: project.description || project.desc,
        startDate: project.start_date || project.startDate ? new Date(project.start_date || project.startDate).toLocaleDateString() : '',
        endDate: project.end_date || project.endDate ? new Date(project.end_date || project.endDate).toLocaleDateString() : '',
        numTask: project.total_tasks || project.numTask || 0,
        numComplete: project.completed_tasks || project.numComplete || 0,
        numMembers: project.member_count || project.numMembers || 0,
        percentage: project.progress || project.percentage || 0,
        color: project.color || '#EF4444',
        members: project.members || [],
        currentUserRole: project.user_role || project.currentUserRole || 'Member', // Check user_role from API
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