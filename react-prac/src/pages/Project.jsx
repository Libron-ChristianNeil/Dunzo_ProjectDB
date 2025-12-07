import React from 'react'
import { useState } from 'react';
import { projectSampleData } from '../data/projectSampleData';
import SelectOptions from '../components/SelectOptions';
import ProjectCard from '../components/projects-app-components/ProjectCard';
import ModalAddProject from '../components/projects-app-components/ModalAddProject';
import ModalExpandProject from '../components/projects-app-components/ModalExpandProject';
function Project() {
    // para dali ra ma edit lols XDXDXD
    const projectStatuses = [
        { id: 0, name: 'All' },
        { id: 1, name: 'Active' },
        { id: 2, name: 'Completed' },
        { id: 3, name: 'Archived' },
    ];

    //sample datas
    const teamList = [
        {id: 0, name: 'All'},
        {id: 1, name: 'ProjectDB'},
        {id: 2, name: 'Pyongyang AI Liberation Front'}
    ]

    const sortList = [
        { id: 0, name: 'Recent' },
        { id: 1, name: 'Name' },
        { id: 2, name: 'Progress' },
        { id: 3, name: 'Due Date' }
    ]

    //for modal
    const [openAddProject, setOpenAddProject] = useState(false);
    const [viewProject, setViewProject] = useState(false); //for viewing
    const [projectItem, setProjectItem] = useState(null);

    return (
        <div className='flex flex-col'>
            {openAddProject && <ModalAddProject onClose={() => setOpenAddProject(false)}/>}
            {viewProject && <ModalExpandProject item={projectItem} onClose={() => setViewProject(false)}/>}

            <div className='sticky top-0 z-100 bg-gray-100 py-3'>
                <div className='flex flex-row justify-between items-center bg-none'>
                    <h1 className='m-0 p-0'>Projects.</h1>
                    <button className='bg-red-500 mr-4 py-1.5 px-4 text-white font-medium rounded-full cursor-pointer'
                            onClick={() => setOpenAddProject(true)}>
                        <span className='mr-2'><i class="fa-solid fa-plus"></i></span>
                        New Project
                    </button>
                    
                </div>

                {/* filter */}
                <div className='flex flex-row gap-3 my-2'>
                    <SelectOptions context={'Status'} items={projectStatuses}/>
                    <SelectOptions context={'Sort by'} items={sortList}/>
                </div>
            </div>
            <div className='mt-4 grid gap-4 grid-cols-[repeat(auto-fit,minmax(360px,1fr))]'>
                {projectSampleData.map((project, index)=>(
                    <ProjectCard
                        key={project.id || index}
                        item={project}
                        setViewProject={setViewProject}
                        setProjectItem={setProjectItem}
                        />
                ))}
            </div>
        </div>
    )
}

export default Project