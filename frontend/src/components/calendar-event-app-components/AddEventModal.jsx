import React, { useState } from 'react'

function AddEventModal({ onClose, eventsService }) { 
    
    // Helper to get local date string for HTML inputs (YYYY-MM-DDTHH:mm)
    const getLocalISOString = (date) => {
        const offsetDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
        return offsetDate.toISOString().slice(0, 16);
    };

    const [title, setTitle] = useState("Untitled Event");
    const [description, setDescription] = useState("");
    const [eventType, setEventType] = useState("normal"); 
    
    // Default start: NOW
    const [start, setStart] = useState(getLocalISOString(new Date()));
    
    // Default end: NOW + 1 Hour
    const defaultEnd = new Date();
    defaultEnd.setHours(defaultEnd.getHours() + 1);
    const [end, setEnd] = useState(getLocalISOString(defaultEnd));

    const handleSubmit = (e) => {
        e.preventDefault();

        // 1. Check Required Fields
        if (!title || !start || !end) {
            alert("Please fill in all required fields.");
            return;
        }

        const startDateObj = new Date(start);
        const endDateObj = new Date(end);
        const now = new Date();

        // 2. CONSTRAINT: Start Date cannot be in the past
        // We allow a small buffer (e.g., 1 minute) to account for the time taken to fill the form
        if (startDateObj < new Date(now.getTime() - 60000)) {
            alert("The Start Date cannot be in the past.");
            return;
        }

        // 3. CONSTRAINT: End Date must be greater than or equal to Start Date
        if (endDateObj < startDateObj) {
            alert("The End Date cannot be earlier than the Start Date.");
            return;
        }

        try {
            const timeZone = 'Asia/Manila';
            
            // Convert strings to Temporal ZonedDateTime
            const startZoned = Temporal.PlainDateTime.from(start).toZonedDateTime(timeZone);
            const endZoned = Temporal.PlainDateTime.from(end).toZonedDateTime(timeZone);

            if (eventsService) {
                eventsService.add({
                    id: Math.random().toString(36).substring(2, 9),
                    title: title,
                    description: description,
                    start: startZoned, 
                    end: endZoned,    
                    calendarId: eventType 
                });
                console.log("Event added successfully");
            }

        } catch (error) {
            console.error("Error creating event:", error);
            alert("Error adding event: " + error.message);
            return; 
        }

        onClose();
    };

    // Calculate current time string for the "min" attribute
    const currentDateTime = getLocalISOString(new Date());

    return (
        <div className='flex fixed inset-0 z-500 bg-zinc-300/80 justify-center items-center '>
            <form onSubmit={handleSubmit} className='w-full max-w-lg'>
                <div className='flex flex-col gap-3 bg-white shadow-md px-5 py-6 rounded-2xl font-medium'>
                    <span className=' text-gray-900 font-semibold text-2xl'>Add New Event</span>

                    <div className='flex flex-col gap-1'>
                        <span className='font-semibold text-gray-900'>Project Name <span className='text-red-500'>*</span></span>
                        <input 
                            required
                            placeholder='Name your event'
                            type='text'
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className='min-w-100 w-100% border border-gray-300 py-2 px-3 rounded-sm'/>
                    </div>

                    <div className='flex flex-col gap-1 text-gray-800'>
                        <span className='font-semibold text-gray-900'>Event Type</span>
                        <select className='border border-gray-300 py-2 px-3 rounded-sm'
                            value={eventType} 
                            onChange={(e) => setEventType(e.target.value)}
                        >
                            <option value="normal">Normal</option>
                            <option value="deadline">Deadline</option>
                            <option value="meeting">Meeting</option>
                        </select>
                    </div>

                    <div className='flex flex-col gap-1'>
                        <span className='font-semibold text-gray-900'>Event Description</span>
                        <input 
                            placeholder='Describe your event…'
                            type='text'
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className='min-w-100 w-100% border border-gray-300 py-2 px-3 rounded-sm'/>
                    </div>

                    <div className='grid grid-cols-2 gap-2'>
                        <div className='flex flex-col'>
                            <span className='font-semibold text-gray-900'>Start Date <span className='text-red-500'>*</span></span>
                            <input 
                                required
                                type="datetime-local"
                                value={start}
                                // MIN ATTRIBUTE: Prevents picking past dates in the UI
                                min={currentDateTime}
                                onChange={(e) => setStart(e.target.value)}
                                className='py-2 px-3 border border-gray-300 rounded-sm'
                            />
                        </div>

                        <div className='flex flex-col'>
                            <span className='font-semibold text-gray-900'>End Date <span className='text-red-500'>*</span></span>
                            <input 
                                required
                                type="datetime-local"
                                value={end}
                                // MIN ATTRIBUTE: Prevents picking a date before the start date
                                min={start} 
                                onChange={(e) => setEnd(e.target.value)}
                                className='py-2 px-3 border border-gray-300 rounded-sm'/>    
                        </div>
                    </div>
                    
                    <div className='flex flex-row justify-center gap-2 my-5'>
                        <button type="submit" 
                            className='py-2 w-40 rounded-md bg-green-600 font-semibold text-white cursor-pointer hover:bg-green-700'>
                            Create Event
                        </button>

                        <button type="button" 
                            className='py-2 w-40 rounded-md bg-red-600 font-semibold text-white cursor-pointer hover:bg-red-700'
                            onClick={onClose}>
                            Discard
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default AddEventModal