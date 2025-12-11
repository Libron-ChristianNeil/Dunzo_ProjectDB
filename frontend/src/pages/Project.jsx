import React, { useState } from 'react';
import { projectSampleData } from '../data/projectSampleData';
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

    const [selectedProjectStatus, setSelectedProjectStatus] = useState('all');
    const [selectedSortOption, setSelectedSortOption] = useState('all');

    const handleProjectStatusFilter = (value) => {
        setSelectedProjectStatus(value);
    };

    const handleSortOptionChange = (value) => {
        setSelectedSortOption(value);
    };

    // ==========================================
    // 1. FILTER STEP
    // ==========================================
    const filteredList = projectSampleData.filter((item) => {
        if (selectedProjectStatus === 'all') return true;
        return item.status === selectedProjectStatus;
    });

    // ==========================================
    // 2. SORT STEP
    // ==========================================
    // We use [...filteredList] to create a copy so we don't mutate the original data
    const displayedProjects = [...filteredList].sort((a, b) => {
        
        if (selectedSortOption === 'Name') {
            return a.name.localeCompare(b.name);
        }
        
        if (selectedSortOption === 'Progress') {
            return b.percentage - a.percentage;
        }

        if (selectedSortOption === 'Due Date') {
            return new Date(a.endDate) - new Date(b.endDate);
        }

        // Default: Sort by ID (0, 1, 2...) so it always goes back to original state
        return a.id - b.id; 
    });

    //for modal
    const [openAddProject, setOpenAddProject] = useState(false);
    const [viewProject, setViewProject] = useState(false); 
    const [projectItem, setProjectItem] = useState(null);

    return (
        <div className='flex flex-col h-screen mx-4'>
            {openAddProject && <ModalAddProject onClose={() => setOpenAddProject(false)}/>}
            {viewProject && <ModalExpandProject item={projectItem} onClose={() => setViewProject(false)}/>}

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
                        onValueChange={handleProjectStatusFilter}/>

                    {/* FIXED: Added onValueChange here */}
                    <SelectOptions 
                        context={'Sort by'} 
                        items={sortList}
                        onValueChange={handleSortOptionChange} 
                        />
                </div>
            </div>
            
            {/* FIXED: Map over displayedProjects */}
            <div className='mt-4 grid gap-4 grid-cols-[repeat(auto-fit,minmax(360px,1fr))]'>
                {displayedProjects.map((project, index)=>(
                    <ProjectCard
                        key={project.id}
                        item={project}
                        setViewProject={setViewProject}
                        setProjectItem={setProjectItem}
                        />
                ))}
                
                {displayedProjects.length === 0 && (
                        <p className="text-gray-500 mt-10">No projects found.</p>
                )}
            </div>
        </div>
    )
}

export default Project;