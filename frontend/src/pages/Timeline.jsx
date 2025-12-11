import React, { useState } from 'react'
import SelectOptions from '../components/SelectOptions';
import { projectSampleData } from '../data/projectSampleData';
import TimelineCard from '../components/timeline-app-components/TimelineCard';

function Timeline() {
    const [expandedCards, setExpandedCards] = useState({});
    
    // 1. STATE: Track which project is selected
    const [selectedProjectId, setSelectedProjectId] = useState('all');

    const time_range = [
        { id: 1, name: 'Today' },
        { id: 2, name: 'This Week' },
        { id: 3, name: 'This Month' },
        { id: 4, name: 'Older' },
    ];

    // 2. HANDLER: Update state when dropdown changes
    const handleProjectFilter = (value) => {
        setSelectedProjectId(value);
    };

    // 3. FILTER LOGIC: Create a new list based on the selection
    const filteredProjects = selectedProjectId === 'all'
        ? projectSampleData
        : projectSampleData.filter(item => item.id === Number(selectedProjectId));

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
                        items={projectSampleData} 
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

                {/* 5. Render filteredProjects instead of the raw data */}
                {filteredProjects.map((item) => (
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
                ))}
                
                {/* 6. Friendly message if nothing matches */}
                {filteredProjects.length === 0 && (
                    <p className="text-gray-500 text-center mt-10">No projects found.</p>
                )}
                
            </div>
        </div>
    )
}

export default Timeline