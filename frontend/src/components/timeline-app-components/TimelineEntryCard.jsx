import React from 'react'

function TimelineEntryCard({ item }) {
    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
        });
    };

    return (
        <div className='flex flex-col bg-gray-100 px-5 gap-0 rounded-sm py-2'>
            <div className='flex flex-row items-center gap-4'>
                <i className="fa-solid fa-caret-right text-black"></i>
                <div className='flex flex-col'>
                    <p>
                        {/* If we have separate actor/action/target */}
                        {item.actor && <span className='font-semibold mr-1'>{item.actor}</span>}
                        {item.username && !item.actor && <span className='font-semibold mr-1'>{item.username}</span>}

                        {item.action}

                        {item.target && <span className='font-semibold italic'> {item.target} </span>}
                    </p>
                    <p className='font-medium text-sm text-gray-600'>
                        {formatDate(item.timestamp || item.created_at)}
                    </p>
                </div>

            </div>
        </div>
    )
}

export default TimelineEntryCard