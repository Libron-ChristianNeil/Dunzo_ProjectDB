import React, { useState, useEffect } from 'react'
import SelectOptions from '../components/SelectOptions';
import TimelineCard from '../components/timeline-app-components/TimelineCard';
import { getProjects, getTimeline } from '../https';

function Timeline() {
    const [expandedCards, setExpandedCards] = useState({});

    // 1. STATE: Track which project is selected
    const [selectedProjectId, setSelectedProjectId] = useState('All');
    const [projects, setProjects] = useState([]);
    const [timelineData, setTimelineData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const time_range = [
        { id: 'All', name: 'All Time' },
        { id: 'Today', name: 'Today' },
        { id: 'This Week', name: 'This Week' },
        { id: 'This Month', name: 'This Month' },
    ];

    // Fetch projects on mount
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await getProjects('Active');
                if (response.success) {
                    setProjects(response.projects || []);
                } else {
                    console.error('Failed to load projects');
                }
            } catch (err) {
                console.error('Network error loading projects');
            }
        };
        fetchProjects();
    }, []);

    // Fetch timeline data when project selection changes
    useEffect(() => {
        const fetchTimelineData = async () => {
            setLoading(true);
            setError(null);

            try {
                let projectsToFetch = [];

                if (selectedProjectId === 'All') {
                    if (projects.length === 0) {
                        setTimelineData([]);
                        setLoading(false);
                        return;
                    }
                    projectsToFetch = projects;
                } else {
                    const project = projects.find(p => (p.project_id || p.id).toString() === selectedProjectId.toString());
                    if (project) {
                        projectsToFetch = [project];
                    }
                }

                const timelinePromises = projectsToFetch.map(async (project) => {
                    const projectId = project.project_id || project.id;
                    try {
                        const response = await getTimeline(projectId);
                        return {
                            id: projectId,
                            name: project.title,
                            color: project.color || '#3b82f6', // Default blue if no color
                            timeline: response.success ? (response.data || []) : []
                        };
                    } catch (err) {
                        console.error(`Error fetching timeline for project ${projectId}`, err);
                        return {
                            id: projectId,
                            name: project.title,
                            color: project.color || '#3b82f6',
                            timeline: []
                        };
                    }
                });

                const results = await Promise.all(timelinePromises);
                // Filter out projects with no timeline entries if you want, or keep them to show empty state
                // For now, let's keep them so the user sees the project exists
                setTimelineData(results);

            } catch (err) {
                console.error('Error fetching timeline data:', err);
                setError('Failed to load timeline data');
            } finally {
                setLoading(false);
            }
        };

        if (projects.length > 0) {
            fetchTimelineData();
        }
    }, [selectedProjectId, projects]);

    // 2. HANDLER: Update state when dropdown changes
    const handleProjectFilter = (value) => {
        setSelectedProjectId(value);
    };

    // Build project options for dropdown
    const projectOptions = [
        { id: 'All', name: 'All Projects' },
        ...projects.map(p => ({
            id: (p.project_id || p.id).toString(),
            name: p.title
        }))
    ];

    return (
        <div className='flex flex-col pb-7 min-h-screen mx-4'>
            <div className='sticky top-0 z-100 bg-gray-100 py-3'>
                <div className='flex flex-row justify-between items-center bg-none'>
                    <h1 className='m-0 p-0'>Timeline.</h1>
                </div>

                {/* filter */}
                <div className='flex flex-row gap-3 my-2'>
                    {/* 4. Pass the handler down to the component */}
                    <SelectOptions
                        context={'Projects'}
                        items={projectOptions}
                        onValueChange={handleProjectFilter}
                    />

                    <SelectOptions
                        context={'Time'}
                        items={time_range}
                        // You can add a time handler here later
                        onValueChange={(val) => console.log("Time selected:", val)}
                    />
                </div>
            </div>

            <div className='flex flex-col gap-3'>

                {loading ? (
                    <p className="text-gray-500 text-center mt-10">Loading timeline...</p>
                ) : error ? (
                    <p className="text-red-500 text-center mt-10">{error}</p>
                ) : timelineData.length === 0 ? (
                    <p className="text-gray-500 text-center mt-10">No projects found.</p>
                ) : (
                    timelineData.map((item) => (
                        <TimelineCard
                            key={item.id}
                            item={item}
                            isExpanded={!!expandedCards[item.id]}
                            setIsExpanded={() =>
                                setExpandedCards((prev) => ({
                                    ...prev,
                                    [item.id]: !prev[item.id],
                                }))
                            }
                        />
                    ))
                )}

            </div>
        </div>
    )
}

export default Timeline