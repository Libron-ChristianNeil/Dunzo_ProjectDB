import React, { useState } from 'react'
import { Temporal } from 'temporal-polyfill'
import ConfirmationModal from './ConfirmationModal';

function EditEventModal({ onClose, eventsService, event }) {
    
    // HELPER: Convert Temporal Object -> String "YYYY-MM-DDTHH:mm" (ISO format for input)
    const formatDateForInput = (dateValue) => {
        if (!dateValue) return "";
        
        // If it's already a string, just ensure it has the 'T' separator
        if (typeof dateValue === 'string') return dateValue.replace(' ', 'T');

        // If it's a Temporal Object, convert to ISO string
        try {
            // .toPlainDateTime() removes timezone offset jargon
            // .toString() gives "2025-12-14T10:00:00"
            // .slice(0, 16) removes the seconds ":00" to match standard inputs
            return dateValue.toPlainDateTime().toString().slice(0, 16);
        } catch (e) {
            return String(dateValue);
        }
    };

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    
    // Initialize state using the helper
    const [title, setTitle] = useState(event.title);
    const [description, setDescription] = useState(event.description || "");
    
    // State for dates
    const [start, setStart] = useState(formatDateForInput(event.start));
    const [end, setEnd] = useState(formatDateForInput(event.end));

    // Store original start to use as the hard minimum limit
    const [originalStart] = useState(formatDateForInput(event.start));

    const handleDeleteClick = () => setShowDeleteConfirm(true); 
    
    const handleConfirmDelete = () => {
        eventsService.remove(event.id);
        setShowDeleteConfirm(false); 
        onClose(); 
    };

    const handleUpdate = (e) => {
        e.preventDefault();

        // VALIDATION: Double check in JS (in case HTML min/max is bypassed)
        if (new Date(end) < new Date(start)) {
            alert("End date cannot be earlier than start date.");
            return;
        }

        // Convert the String back to Temporal Object for the update
        try {
            const timeZone = 'Asia/Manila';
            const startZoned = Temporal.PlainDateTime.from(start).toZonedDateTime(timeZone);
            const endZoned = Temporal.PlainDateTime.from(end).toZonedDateTime(timeZone);

            eventsService.update({
                ...event,
                title: title,
                description: description,
                start: startZoned,
                end: endZoned,
            });

            onClose();
        } catch (error) {
            alert("Invalid Date Format. Use YYYY-MM-DD HH:mm");
        }
    };

    return (
        <div className='flex fixed inset-0 z-500 bg-zinc-300/80 justify-center items-center'>
            {showDeleteConfirm && (
                <ConfirmationModal 
                    title="Delete Event"
                    message="Are you sure you want to delete this event? This action cannot be undone."
                    onClose={() => setShowDeleteConfirm(false)}
                    onConfirm={handleConfirmDelete}
                />
            )}

            <form onSubmit={handleUpdate} className='w-full max-w-lg'>
                <div className='flex flex-col gap-3 bg-white shadow-md px-5 py-6 rounded-2xl font-medium'>
                    <div className='flex flex-row justify-between items-center'>
                        <span className='text-gray-900 font-semibold text-2xl'>Edit Event</span>
                        <span className='text-gray-500 cursor-pointer hover:text-red-500' onClick={onClose}>✕</span>
                    </div>

                    <div className='flex flex-col gap-1'>
                        <span className='font-semibold text-gray-900'>Project Name</span>
                        <input required type='text' value={title} onChange={e => setTitle(e.target.value)}
                            className='min-w-100 w-100% border border-gray-300 py-2 px-3 rounded-sm'/>
                    </div>

                    <div className='flex flex-col gap-1'>
                        <span className='font-semibold text-gray-900'>Description</span>
                        <input type='text' value={description} onChange={e => setDescription(e.target.value)}
                            className='min-w-100 w-100% border border-gray-300 py-2 px-3 rounded-sm'/>
                    </div>

                    <div className='grid grid-cols-2 gap-2'>
                        <div className='flex flex-col'>
                            <span className='font-semibold text-gray-900'>Start (YYYY-MM-DD HH:mm)</span>
                            <input 
                                required 
                                type="datetime-local" 
                                value={start} 
                                onChange={e => setStart(e.target.value)}
                                // Min: Original Start Date (cannot move earlier than it was)
                                min={originalStart}
                                // Max: Current End Date (cannot start after the event ends)
                                max={end}
                                className='py-2 px-3 border border-gray-300 rounded-sm' 
                            />
                        </div>
                        <div className='flex flex-col'>
                            <span className='font-semibold text-gray-900'>End (YYYY-MM-DD HH:mm)</span>
                            <input 
                                required 
                                type="datetime-local" 
                                value={end} 
                                onChange={e => setEnd(e.target.value)}
                                // Min: Current Start Date (cannot end before it starts)
                                min={start}
                                className='py-2 px-3 border border-gray-300 rounded-sm' 
                            />    
                        </div>
                    </div>
                    
                    <div className='flex flex-row justify-center gap-2 my-5'>
                        <button type="submit" className='py-2 w-32 rounded-md bg-blue-600 font-semibold text-white cursor-pointer hover:bg-blue-700'>
                            Update
                        </button>

                        <button 
                            type="button" 
                            onClick={handleDeleteClick} 
                            className='py-2 w-32 rounded-md bg-red-600 font-semibold text-white cursor-pointer hover:bg-red-700'>
                            Delete
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default EditEventModal