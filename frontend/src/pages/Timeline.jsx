import React from 'react'
import { useState } from 'react'
import SelectOptions from '../components/SelectOptions';
import { projectSampleData } from '../data/projectSampleData';
import TimelineCard from '../components/timeline-app-components/TimelineCard';
function Timeline() {
	const [expandedCards, setExpandedCards] = useState({});
	const time_range = [
		{ id: 1, name: 'Today' },
		{ id: 2, name: 'This Week' },
		{ id: 3, name: 'This Month' },
		{ id: 4, name: 'Older' },
	];
    return (
		<div className='flex flex-col pb-7 min-h-screen mx-4'>
			<div className='sticky top-0 z-100 bg-gray-100 py-3'>
                <div className='flex flex-row justify-between items-center bg-none'>
                    <h1 className='m-0 p-0'>Timeline.</h1>
                </div>  

				{/* filter */}
                <div className='flex flex-row gap-3 my-2'>
                    <SelectOptions context={'Projects'} items={projectSampleData}/>
                    <SelectOptions context={'Time'} items={time_range}/>
                </div>
            </div>

			<div className='flex flex-col gap-3'>

				{/* {projectSampleData.map((item, index) => (
					<TimelineCard key={index} isExpanded={isExpanded} setIsExpanded={isExpanded} item={item}/>
				))} */}

				{projectSampleData.map((item) => (
                    <TimelineCard
                        key={item.id}
                        item={item}
                        isExpanded={!!expandedCards[item.id]} // true/false
                        setIsExpanded={() =>
                            setExpandedCards((prev) => ({
                                ...prev,
                                [item.id]: !prev[item.id], // toggle this card
                            }))
                        }
                    />
                ))}
				
			</div>

			

			
		</div>
    )
}

export default Timeline