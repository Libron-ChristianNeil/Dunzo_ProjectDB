import React from 'react'
import Statcard from '../components/dashboard-components/Statcard';
import QuickTaskCard from '../components/dashboard-components/QuickTaskCard';
import QuickProjectCard from '../components/dashboard-components/QuickProjectCard';
import QuickNotifCard from '../components/dashboard-components/QuickNotifCard';
import QuickDeadlineCard from '../components/dashboard-components/QuickDeadlineCard';


function Dashboard() {
    // data para sa stat cards, add ra og value: 
    const statCardItems = [
        { icon: 'fas fa-tasks', title: 'Active Tasks', bgColor: 'bg-green-100', iconColor: 'text-green-500' },
        { icon: 'fa-solid fa-folder', title: 'Projects', bgColor: 'bg-blue-100', iconColor: 'text-blue-500' },
        { icon: 'fas fa-bell', title: 'Notifications', bgColor: 'bg-red-100', iconColor: 'text-red-500' },
        { icon: 'fas fa-calendar-check', title: 'Upcoming Deadlines', bgColor: 'bg-yellow-100', iconColor: 'text-yellow-500' }
    ]

    // sample data para sa quick task cards
    const quickTaskItems = [
        {
            taskName: 'Cram Djangoooo',
            dueDate: 'Dec 9',
            projectName: 'Django',
            priority: 'High'
        },

        {
            taskName: 'Project Report',
            dueDate: 'Dec 3',
            projectName: '',
            priority: 'High'
        },

        {
            taskName: 'App Dev',
            dueDate: 'Dec 15',
            projectName: 'NavCIT',
            priority: 'Medium'
        },

        {
            taskName: 'Cram Djangoooo',
            dueDate: 'Dec 9',
            projectName: 'Django',
            priority: 'High'
        },

        {
            taskName: 'Project Report',
            dueDate: 'Dec 3',
            projectName: '',
            priority: 'High'
        },

        {
            taskName: 'App Dev',
            dueDate: 'Dec 15',
            projectName: 'NavCIT',
            priority: 'Medium'
        }
        // add more tasks as needed
    ];

    // sample data for recent projects

    const recentProjects = [
        {
            projectName: 'Django',
            color: 'bg-green-500',
            numTask: 12,
            percentage: 75
        },

        {
            projectName: 'NavCIT',
            color: 'bg-yellow-500',
            numTask: 20,
            percentage: 75
        },

        {
            projectName: 'Django',
            color: 'bg-green-500',
            numTask: 12,
            percentage: 75
        },

        {
            projectName: 'Django',
            color: 'bg-green-500',
            numTask: 12,
            percentage: 75
        },

        {
            projectName: 'Django',
            color: 'bg-green-500',
            numTask: 12,
            percentage: 75
        },

        {
            projectName: 'Django',
            color: 'bg-green-500',
            numTask: 12,
            percentage: 75
        }
    ];

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
        <div className='flex flex-col'>
            <div className='bg-none '>
                <h1>Dashboard</h1>
            </div>
            {/* stats */}
            <div className='grid gap-5 grid-cols-[repeat(auto-fill,minmax(240px,1fr))]'>
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
                <div className='flex flex-col bg-white p-5 rounded-sm shadow-md max-h-100 shrink-0'>
                    <div className='flex flex-row mb-3 justify-between'>
                        <span className='font-semibold text-xl'>My Task</span>
                        <button className='bg-none font-medium text-red-500 hover:underline cursor-pointer'>
                            View All
                        </button>
                    </div>

                    <div className='overflow-y-auto flex-1'>
                        {/* Checks if naa bay tasks */}
                        {quickTaskItems.length === 0 ? (
                            <p className='text-gray-500'>No tasks available.</p>
                        ) : (
                            <ul>
                            
                            {quickTaskItems.map((task, index) => (
                                <li key={index}>
                                    <QuickTaskCard
                                        taskName={task.taskName}
                                        dueDate={task.dueDate}
                                        projectName={task.projectName}
                                        priority={task.priority}
                                    />
                                </li>
                            ))}
                        </ul>   
                        )}
                    </div>

                    
                </div>

                {/* Notifications */}
                <div className='flex flex-col shrink-0 max-h-100 bg-white p-5 rounded-sm shadow-md'>
                    <div className='flex flex-row mb-3 justify-between'>
                        <span className='font-semibold text-xl'>Notifications</span>
                        <button className='bg-none  text-red-500 font-medium hover:underline cursor-pointer'>
                            View All
                        </button>
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
                <div className='flex flex-col shrink-0 max-h-100 bg-white p-5 rounded-sm shadow-md'>
                    <div className='flex flex-row mb-3 justify-between'>
                        <span className='font-semibold text-xl'>Recent Projects</span>
                        <button className='bg-none  text-red-500 font-medium hover:underline cursor-pointer'>
                            View All
                        </button>
                    </div>
                    
                    <div className='overflow-y-auto flex-1'>
                        {recentProjects.length === 0 ? (
                            <p className='text-gray-500'>No recent projects available.</p>
                        ) : (
                            <ul>
                                {recentProjects.map((project, index) => (
                                    <li key={index}>
                                        <QuickProjectCard
                                            projectName={project.projectName}
                                            numTask={project.numTask}
                                            percentage={project.percentage}
                                            projectColor={project.color}
                                        />
                                    </li>
                                ))}
                            </ul>
                        )} 
                    </div>
                    
                </div>
                
                {/* upcoming deadlines */}
                <div className='flex flex-col shrink-0 max-h-100 bg-white p-5 rounded-sm shadow-md'>
                    <div className='flex flex-row mb-3 justify-between'>
                        <span className='font-semibold text-xl'>Upcoming Deadlines</span>
                        <button className='bg-none  text-red-500 font-medium hover:underline cursor-pointer'>
                            View All
                        </button>
                    </div>

                    <div className='overflow-y-auto flex-1'>
                        {deadlines.lenght == 0 ? (
                            <p className='text-gray-500'>No upcoming deadlines.</p>
                        ):(
                            <ul>
                                {deadlines.map((deadline, index) => (
                                    <li KEY={index}>
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