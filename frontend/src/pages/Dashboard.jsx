import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Statcard from '../components/dashboard-components/Statcard';
import QuickTaskCard from '../components/dashboard-components/QuickTaskCard';
import QuickProjectCard from '../components/dashboard-components/QuickProjectCard';
import QuickNotifCard from '../components/dashboard-components/QuickNotifCard';
import QuickDeadlineCard from '../components/dashboard-components/QuickDeadlineCard';
import { getDashboard } from '../https';

/**
 * Format ISO date string to readable format
 * @param {string} isoString - ISO date string from API
 * @returns {string} - Formatted date like "Dec 19, 2025 at 9:21 PM"
 */
const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
        const date = new Date(isoString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    } catch (e) {
        return isoString;
    }
};

/**
 * Format relative time for notifications (e.g., "2 hours ago")
 */
const formatRelativeTime = (isoString) => {
    if (!isoString) return '';
    try {
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        return formatDate(isoString);
    } catch (e) {
        return isoString;
    }
};

function Dashboard() {
    const navigate = useNavigate();

    // Dashboard data state
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState({
        counts: {
            tasks: 0,
            projects: 0,
            notifications: 0,
            events: 0
        },
        data: {
            tasks: [],
            projects: [],
            notifications: [],
            events: []
        }
    });

    // Fetch dashboard data on mount
    useEffect(() => {
        const fetchDashboard = async () => {
            setLoading(true);
            try {
                const response = await getDashboard();
                console.log('Dashboard response:', response);

                if (response && !response.error) {
                    setDashboardData({
                        counts: response.counts || { tasks: 0, projects: 0, notifications: 0, events: 0 },
                        data: response.data || { tasks: [], projects: [], notifications: [], events: [] }
                    });
                } else {
                    console.error('Error fetching dashboard:', response?.error);
                }
            } catch (error) {
                console.error('Error fetching dashboard:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    // Generate stat cards with real values
    const statCardItems = [
        { icon: 'fas fa-tasks', title: 'Active Tasks', value: dashboardData.counts.tasks, bgColor: 'bg-red-500', iconColor: 'text-white' },
        { icon: 'fa-solid fa-folder', title: 'Projects', value: dashboardData.counts.projects, bgColor: 'bg-red-500', iconColor: 'text-white' },
        { icon: 'fas fa-bell', title: 'Notifications', value: dashboardData.counts.notifications, bgColor: 'bg-red-500', iconColor: 'text-white' },
        { icon: 'fas fa-calendar-check', title: 'Upcoming Deadlines', value: dashboardData.counts.events, bgColor: 'bg-red-500', iconColor: 'text-white' }
    ];

    return (
        <div className='flex flex-col h-screen mx-4'>
            <div className='bg-none py-3'>
                <h1 className='m-0 p-0'>Dashboard.</h1>
            </div>

            {/* Loading indicator */}
            {loading && (
                <div className='text-gray-500 text-center py-4'>Loading dashboard...</div>
            )}

            {/* stats */}
            <div className='grid gap-5 grid-cols-4'>
                {statCardItems.map((item, index) => (
                    <Statcard
                        key={index}
                        icon={item.icon}
                        title={item.title}
                        value={item.value}
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
                            onClick={() => navigate('/user/task')}>
                            View All
                        </button>
                    </div>

                    <div className='overflow-y-auto flex-1'>
                        {dashboardData.data.tasks.length === 0 ? (
                            <p className='text-gray-500'>No tasks available.</p>
                        ) : (
                            <ul>
                                {dashboardData.data.tasks.map((task, index) => (
                                    <li key={task.id || index}>
                                        <QuickTaskCard item={{ ...task, due_date: formatDate(task.due_date) }} />
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
                        {dashboardData.data.notifications.length === 0 ? (
                            <p className='text-gray-500'>No notifications.</p>
                        ) : (
                            <ul>
                                {dashboardData.data.notifications.map((notif, index) => (
                                    <li key={notif.id || index}>
                                        <QuickNotifCard
                                            notificationContext={notif.message}
                                            time={formatRelativeTime(notif.created_at)}
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
                            onClick={() => navigate('/user/project')}>
                            View All
                        </button>
                    </div>

                    <div className='overflow-y-auto flex-1'>
                        {dashboardData.data.projects.length === 0 ? (
                            <p className='text-gray-500'>No projects available.</p>
                        ) : (
                            <ul>
                                {dashboardData.data.projects.map((project, index) => (
                                    <li key={project.id || index}>
                                        <QuickProjectCard item={project} />
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
                            onClick={() => navigate('/user/task')}>
                            View All
                        </button>
                    </div>

                    <div className='overflow-y-auto flex-1'>
                        {dashboardData.data.events.length === 0 ? (
                            <p className='text-gray-500'>No upcoming deadlines.</p>
                        ) : (
                            <ul>
                                {dashboardData.data.events.map((event, index) => (
                                    <li key={event.id || index}>
                                        <QuickDeadlineCard
                                            deadlineContext={event.title}
                                            date={formatDate(event.end_date || event.start_date)}
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