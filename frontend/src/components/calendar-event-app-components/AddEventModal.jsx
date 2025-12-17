import React, { useState, useEffect } from 'react';
import { Temporal } from 'temporal-polyfill';
import { createCalendarEvent, getProjects } from '../../https';

const TIMEZONE = 'Asia/Manila';

function AddEventModal({ onClose, eventsService, onEventCreated }) {

    // Helper to get current datetime in Manila timezone for input
    const getCurrentDateTime = () => {
        const now = Temporal.Now.zonedDateTimeISO(TIMEZONE);
        return now.toPlainDateTime().toString().slice(0, 16);
    };

    const getDefaultEndDateTime = () => {
        const now = Temporal.Now.zonedDateTimeISO(TIMEZONE);
        const oneHourLater = now.add({ hours: 1 });
        return oneHourLater.toPlainDateTime().toString().slice(0, 16);
    };

    const [title, setTitle] = useState("Untitled Event");
    const [description, setDescription] = useState("");
    const [eventType, setEventType] = useState("Event"); // 'Event' or 'Meeting'
    const [start, setStart] = useState(getCurrentDateTime());
    const [end, setEnd] = useState(getDefaultEndDateTime());

    // Project selection for Meetings
    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState("");
    const [managedProjects, setManagedProjects] = useState([]);
    const [loadingProjects, setLoadingProjects] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Fetch user's projects on mount
    useEffect(() => {
        const fetchProjects = async () => {
            setLoadingProjects(true);
            try {
                const response = await getProjects('Active');
                console.log('AddEventModal - Projects response:', response);

                if (response.success && response.projects) {
                    setProjects(response.projects);

                    // Filter projects where user is Manager or Leader
                    // Check both 'user_role' and 'role' field names
                    const managed = response.projects.filter(p => {
                        const role = p.user_role || p.role || p.currentUserRole;
                        console.log(`Project ${p.title}: role = ${role}`);
                        return role === 'Manager' || role === 'Leader';
                    });

                    console.log('Managed projects:', managed);
                    setManagedProjects(managed);
                }
            } catch (error) {
                console.error('Error fetching projects:', error);
            } finally {
                setLoadingProjects(false);
            }
        };
        fetchProjects();
    }, []);

    // Check if user can create meetings
    const canCreateMeeting = managedProjects.length > 0;

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. Check Required Fields
        if (!title || !start || !end) {
            alert("Please fill in all required fields.");
            return;
        }

        // 2. Validate Meeting requires project selection
        if (eventType === 'Meeting' && !selectedProjectId) {
            alert("Please select a project for the Meeting.");
            return;
        }

        // 3. Date validation
        const startPlain = Temporal.PlainDateTime.from(start);
        const endPlain = Temporal.PlainDateTime.from(end);
        const nowPlain = Temporal.Now.zonedDateTimeISO(TIMEZONE).toPlainDateTime();

        // Allow 1 minute buffer for form filling time
        const oneMinuteAgo = nowPlain.subtract({ minutes: 1 });
        if (Temporal.PlainDateTime.compare(startPlain, oneMinuteAgo) < 0) {
            alert("The Start Date cannot be in the past.");
            return;
        }

        if (Temporal.PlainDateTime.compare(endPlain, startPlain) < 0) {
            alert("The End Date cannot be earlier than the Start Date.");
            return;
        }

        setSubmitting(true);

        try {
            // Prepare data for API - send as local Manila time (no UTC conversion)
            const eventData = {
                title: title,
                description: description,
                type: eventType,
                start_date: startPlain.toString(),
                end_date: endPlain.toString(),
                project_id: eventType === 'Meeting' ? parseInt(selectedProjectId) : null,
                participant_ids: [] // Can be extended to add participants
            };

            const response = await createCalendarEvent(eventData);

            if (response.success) {
                console.log("Event created successfully:", response);

                // Refresh the calendar
                if (onEventCreated) {
                    await onEventCreated();
                }

                onClose();
            } else {
                alert("Error creating event: " + (response.error || "Unknown error"));
            }

        } catch (error) {
            console.error("Error creating event:", error);
            alert("Error creating event: " + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const currentDateTime = getCurrentDateTime();

    return (
        <div className='flex fixed inset-0 z-500 bg-zinc-300/80 justify-center items-center'>
            <form onSubmit={handleSubmit} className='w-full max-w-lg'>
                <div className='flex flex-col gap-3 bg-white shadow-md px-5 py-6 rounded-2xl font-medium'>
                    <span className='text-gray-900 font-semibold text-2xl'>Add New Event</span>

                    {/* Event Title */}
                    <div className='flex flex-col gap-1'>
                        <span className='font-semibold text-gray-900'>Event Title <span className='text-red-500'>*</span></span>
                        <input
                            required
                            placeholder='Name your event'
                            type='text'
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className='min-w-100 w-100% border border-gray-300 py-2 px-3 rounded-sm' />
                    </div>

                    {/* Event Type */}
                    <div className='flex flex-col gap-1 text-gray-800'>
                        <span className='font-semibold text-gray-900'>Event Type</span>
                        <select className='border border-gray-300 py-2 px-3 rounded-sm'
                            value={eventType}
                            onChange={(e) => {
                                setEventType(e.target.value);
                                if (e.target.value !== 'Meeting') {
                                    setSelectedProjectId("");
                                }
                            }}
                        >
                            <option value="Event">Event (Personal)</option>
                            {canCreateMeeting && (
                                <option value="Meeting">Meeting</option>
                            )}
                        </select>
                        {!canCreateMeeting && (
                            <span className='text-xs text-gray-500 mt-1'>
                                You must be a Manager or Leader of a project to create Meetings
                            </span>
                        )}
                    </div>

                    {/* Project Selection - Only for Meetings */}
                    {eventType === 'Meeting' && (
                        <div className='flex flex-col gap-1'>
                            <span className='font-semibold text-gray-900'>
                                Project <span className='text-red-500'>*</span>
                            </span>
                            {loadingProjects ? (
                                <span className='text-gray-500 text-sm'>Loading projects...</span>
                            ) : (
                                <select
                                    required
                                    className='border border-gray-300 py-2 px-3 rounded-sm'
                                    value={selectedProjectId}
                                    onChange={(e) => setSelectedProjectId(e.target.value)}
                                >
                                    <option value="">Select a project...</option>
                                    {managedProjects.map((project, index) => (
                                        <option key={project.project_id || project.id || index} value={project.project_id || project.id}>
                                            {project.title || project.name}
                                        </option>
                                    ))}
                                </select>
                            )}
                            <span className='text-xs text-gray-500 mt-1'>
                                All members of this project will see the meeting
                            </span>
                        </div>
                    )}

                    {/* Description */}
                    <div className='flex flex-col gap-1'>
                        <span className='font-semibold text-gray-900'>Event Description</span>
                        <input
                            placeholder='Describe your event…'
                            type='text'
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className='min-w-100 w-100% border border-gray-300 py-2 px-3 rounded-sm' />
                    </div>

                    {/* Date/Time */}
                    <div className='grid grid-cols-2 gap-2'>
                        <div className='flex flex-col'>
                            <span className='font-semibold text-gray-900'>Start Date <span className='text-red-500'>*</span></span>
                            <input
                                required
                                type="datetime-local"
                                value={start}
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
                                min={start}
                                onChange={(e) => setEnd(e.target.value)}
                                className='py-2 px-3 border border-gray-300 rounded-sm' />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className='flex flex-row justify-end gap-3 pt-3'>
                        <button type='button' onClick={onClose} className='text-gray-800 font-semibold'>Cancel</button>
                        <button
                            type='submit'
                            disabled={submitting}
                            className='flex items-center justify-center gap-2 bg-blue-500 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50'
                        >
                            {submitting && <i className="fas fa-spinner fa-spin"></i>}
                            {submitting ? 'Creating...' : 'Create Event'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default AddEventModal;

