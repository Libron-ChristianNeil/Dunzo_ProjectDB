import React from 'react'
import { sampleTaskData } from '../data/taskSampleData';
import { projectSampleData } from '../data/projectSampleData';
import { useNavigate } from 'react-router-dom';
import Statcard from '../components/dashboard-components/Statcard';
import QuickTaskCard from '../components/dashboard-components/QuickTaskCard';
import QuickProjectCard from '../components/dashboard-components/QuickProjectCard';
import QuickNotifCard from '../components/dashboard-components/QuickNotifCard';
import QuickDeadlineCard from '../components/dashboard-components/QuickDeadlineCard';


function Dashboard() {
    const navigate = useNavigate()
    // data para sa stat cards, add ra og value: 
    const statCardItems = [
        { icon: 'fas fa-tasks', title: 'Active Tasks', bgColor: 'bg-red-500', iconColor: 'text-white' },
        { icon: 'fa-solid fa-folder', title: 'Projects', bgColor: 'bg-red-500', iconColor: 'text-white' },
        { icon: 'fas fa-bell', title: 'Notifications', bgColor: 'bg-red-500', iconColor: 'text-white' },
        { icon: 'fas fa-calendar-check', title: 'Upcoming Deadlines', bgColor: 'bg-red-500', iconColor: 'text-white' }
    ]

    //sample data for notifications

    const notifications = [
        {
            notificationContext: 'New comment on your task "App Dev"',
            time: '2 hours ago'
        },

        {
            notificationContext: 'New comment on your task "Django"',
            time: '4 hours ago'
        },
    ]

    //sample data for deadlines

    const deadlines = [
        {
            deadlineContext: 'Deadline for "App Dev" project',
            date: 'Dec 10, 2024'
        },
        {
            deadlineContext: 'Deadline for "Django" project',
            date: 'Dec 12, 2024'
        },
        
        {
            deadlineContext: 'Deadline for "App Dev" project',
            date: 'Dec 10, 2024'
        },
        {
            deadlineContext: 'Deadline for "Django" project',
            date: 'Dec 12, 2024'
        },

        {
            deadlineContext: 'Deadline for "App Dev" project',
            date: 'Dec 10, 2024'
        },
        {
            deadlineContext: 'Deadline for "Django" project',
            date: 'Dec 12, 2024'
        },

        {
            deadlineContext: 'Deadline for "App Dev" project',
            date: 'Dec 10, 2024'
        },
        {
            deadlineContext: 'Deadline for "Django" project',
            date: 'Dec 12, 2024'
        },
        
        {
            deadlineContext: 'Deadline for "Project Report"',
            date: 'Dec 15, 2024'
        }
    ]

    return (
        <div className='flex flex-col h-screen mx-4'>
            <div className='bg-none py-3'>
                <h1 className='m-0 p-0'>Dashboard.</h1>
            </div>
            {/* stats */}
            <div className='grid gap-5 grid-cols-4'>
                {statCardItems.map((item, index)=> (
                    <Statcard
                        key={index}
                        icon={item.icon}
                        title={item.title}
                        bgColor={item.bgColor}
                        iconColor={item.iconColor}
                    />
                ))}
            </div>
            
            {/* grid */}
            <div className='mt-5 my-3 grid gap-4 lg:grid-cols-[2fr_1fr] max-sm:grid-cols-1 '>
                {/* tasks */}
                <div className='flex flex-col bg-white p-5 rounded-sm shadow-sm max-h-100 shrink-0'>
                    <div className='flex flex-row mb-3 justify-between'>
                        <span className='font-semibold text-xl'>My Task</span>
                        <button className='bg-none font-medium text-red-500 hover:underline cursor-pointer'
                                onClick={()=> navigate('/task')}>
                            View All
                        </button>
                    </div>

                    <div className='overflow-y-auto flex-1'>
                        {/* Checks if naa bay tasks */}
                        {sampleTaskData.length === 0 ? (
                            <p className='text-gray-500'>No tasks available.</p>
                        ) : (
                            <ul>
                            {sampleTaskData.map((task) => (
                                <li key={task.id}>
                                    <QuickTaskCard
                                        item={task}
                                    />
                                </li>
                            ))}
                        </ul>   
                        )}
                    </div>

                    
                </div>

                {/* Notifications */}
                <div className='flex flex-col shrink-0 max-h-100 bg-white p-5 rounded-sm shadow-sm'>
                    <div className='flex flex-row mb-3'>
                        <span className='font-semibold text-xl'>Notifications</span>
                    </div>

                    <div className='overflow-y-auto flex-1'>
                        {notifications.length === 0 ? (
                            <p className='text-gray-500'>No notifications.</p>
                        ) : (
                            <ul>
                                {notifications.map((notif, index) => (
                                    <li key={index}>
                                        <QuickNotifCard
                                            notificationContext={notif.notificationContext}
                                            time={notif.time}
                                        />
                                    </li>
                                ))}
                            </ul>
                        )}  
                    </div> 
                </div>
                
                {/* projects */}
                <div className='flex flex-col shrink-0 max-h-100 bg-white p-5 rounded-sm shadow-sm'>
                    <div className='flex flex-row mb-3 justify-between'>
                        <span className='font-semibold text-xl'>Recent Projects</span>
                        <button className='bg-none  text-red-500 font-medium hover:underline cursor-pointer'
                                onClick={()=> navigate('/project')}>
                            View All
                        </button>
                    </div>
                    
                    <div className='overflow-y-auto flex-1'>
                        {projectSampleData.length === 0 ? (
                            <p className='text-gray-500'>No projects available.</p>
                        ) : (
                            <ul>
                                {projectSampleData.map((project, index) => (
                                    <li key={index}>
                                        <QuickProjectCard item={project}/>
                                    </li>
                                ))}
                            </ul>
                        )} 
                    </div>
                    
                </div>
                
                {/* upcoming deadlines */}
                <div className='flex flex-col shrink-0 max-h-100 bg-white p-5 rounded-sm shadow-sm'>
                    <div className='flex flex-row mb-3 justify-between'>
                        <span className='font-semibold text-xl'>Upcoming Deadlines</span>
                        <button className='bg-none  text-red-500 font-medium hover:underline cursor-pointer'
                                onClick={()=> navigate('/task')}>
                            View All
                        </button>
                    </div>

                    <div className='overflow-y-auto flex-1'>
                        {deadlines.length == 0 ? (
                            <p className='text-gray-500'>No upcoming deadlines.</p>
                        ):(
                            <ul>
                                {deadlines.map((deadline, index) => (
                                    <li key={index}>
                                        <QuickDeadlineCard
                                            deadlineContext={deadline.deadlineContext}
                                            date={deadline.date}
                                        />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
        

    )
}

export default Dashboard