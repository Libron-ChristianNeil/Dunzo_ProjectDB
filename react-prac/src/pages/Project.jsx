import React from 'react'
import { useState } from 'react';
import SelectOptions from '../components/projects-app-components/SelectOptions';
import ProjectCard from '../components/projects-app-components/ProjectCard';
import ModalAddProject from '../components/projects-app-components/ModalAddProject';

function Project() {
    // para dali ra ma edit lols XDXDXD
    const projectStatuses = [
        { id: 0, name: 'All Projects' },
        { id: 1, name: 'Active' },
        { id: 2, name: 'Completed' },
        { id: 3, name: 'Archived' },
    ];

    //sample datas
    const teamList = [
        {id: 0, name: 'All Teams'},
        {id: 1, name: 'ProjectDB'},
        {id: 2, name: 'Pyongyang AI Liberation Front'}
    ]

    const sortList = [
        { id: 0, name: 'Recent' },
        { id: 1, name: 'Name' },
        { id: 2, name: 'Progress' },
        { id: 3, name: 'Due Date' },
    ]


    //projects sample data

    // --- 1. The Sample Data Array ---
    const projectData = [
    {
        id: 1,
        name: "Mobile App Redesign",
        // Using standard Tailwind gradient classes
        color: "from-purple-500 to-indigo-600", 
        startDate: "Jan 10, 2024",
        endDate: "Mar 15, 2024",
        desc: "Revamping the UX/UI for the main iOS and Android application.",
        numTask: 45,
        numComplete: 32,
        numMembers: 8,
        percentage: 71, // 71%
        status: "Active",
        members: [
        { id: 101, name: "Alice Johnson", avatarColor: "bg-emerald-500" },
        { id: 102, name: "Bob Smith", avatarColor: "bg-red-500" },
        { id: 103, name: "Charlie Davis", avatarColor: "bg-orange-500" },
        ]
    },
    {
        id: 2,
        name: "Marketing Website",
        color: "from-blue-400 to-cyan-500",
        startDate: "Nov 01, 2023",
        endDate: "Jan 20, 2024",
        desc: "SEO optimization and landing page overhaul for Q1 campaign.",
        numTask: 20,
        numComplete: 20,
        numMembers: 4,
        percentage: 100,
        status: "Completed",
        members: [
        { id: 201, name: "David Wilson", avatarColor: "bg-cyan-500" },
        { id: 202, name: "Eva Green", avatarColor: "bg-amber-500" },
        ]
    },
    {
        id: 3,
        name: "Internal Dashboard",
        color: "from-orange-400 to-pink-500",
        startDate: "Feb 01, 2024",
        endDate: "Aug 30, 2024",
        desc: "Building analytics tools for the admin team to track sales.",
        numTask: 150,
        numComplete: 15,
        numMembers: 12,
        percentage: 10,
        status: "Active",
        members: [
        { id: 301, name: "Frank Miller", avatarColor: "bg-blue-500" },
        { id: 302, name: "Grace Lee", avatarColor: "bg-red-500"},
        { id: 303, name: "Henry Ford", avatarColor: "bg-green-500" },
        { id: 304, name: "Ivy Thomas", avatarColor: "bg-gray-500" },
        ]
    },
    {
        id: 4,
        name: "Legacy Migration",
        color: "from-gray-500 to-gray-700",
        startDate: "Jun 15, 2022",
        endDate: "Dec 10, 2022",
        desc: "Migrating old SQL databases to the new cloud infrastructure.",
        numTask: 80,
        numComplete: 80,
        numMembers: 3,
        percentage: 100,
        status: "Archived",
        members: [
        { id: 401, name: "Jack Ryan", avatarColor: "bg-orange-500" },
        { id: 402, name: "Kelly Clark", avatarColor: "bg-purple-500" },
        ]
    }
    ];



    //for modal
    const [openAddProject, setOpenAddProject] = useState(false);


    return (
        <div className='flex flex-col'>
            <div className='flex flex-row justify-between items-center bg-none py-3'>
                <h1 className='m-0 p-0'>Projects</h1>
                <button className='bg-red-500 mr-4 py-1.5 px-4 text-white font-medium rounded-full cursor-pointer'
                onClick={() => setOpenAddProject(true)}>
                    <span className='mr-2'><i class="fa-solid fa-plus"></i></span>
                    New Project
                </button>
                {openAddProject && <ModalAddProject onClose={()=> setOpenAddProject(false)}/>}
            </div>

            {/* filter */}
            <div className='flex flex-row gap-3 my-2'>
                <SelectOptions context={'Status'} items={projectStatuses}/>
                <SelectOptions context={'Team'} items={teamList}/>
                <SelectOptions context={'Sort by'} items={sortList}/>
            </div>

            <div className='mt-4 grid gap-4 grid-cols-[repeat(auto-fit,minmax(400px,1fr))]'>
                {projectData.map((project, index)=>(
                    <ProjectCard
                        key={project.id || index}
                        item={project}
                        />
                ))}
            </div>
        </div>
    )
}

export default Project