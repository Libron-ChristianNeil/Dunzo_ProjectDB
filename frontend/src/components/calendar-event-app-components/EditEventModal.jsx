import React, { useState, useMemo } from 'react';
import { Temporal } from 'temporal-polyfill';
import ConfirmationModal from './ConfirmationModal';
import { updateCalendarEvent, deleteCalendarEvent } from '../../https';

const TIMEZONE = 'Asia/Manila';

function EditEventModal({ onClose, eventsService, event, onEventUpdated }) {

    // Helper: Convert Temporal/String to input format
    const formatDateForInput = (dateValue) => {
        if (!dateValue) return "";
        if (typeof dateValue === 'string') return dateValue.replace(' ', 'T').slice(0, 16);
        try {
            return dateValue.toPlainDateTime().toString().slice(0, 16);
        } catch (e) {
            return String(dateValue).slice(0, 16);
        }
    };

    // Get original data - if came from backend it has _original
    const originalData = event._original || {};
    const eventType = originalData.type || 'Event';
    const isDeadline = eventType === 'Deadline';
    const eventId = originalData.event_id || event.id;

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Store original values for change detection
    const [originalValues] = useState({
        title: event.title || '',
        description: event.description || '',
        start: formatDateForInput(event.start),
        end: formatDateForInput(event.end)
    });

    // Form state
    const [title, setTitle] = useState(originalValues.title);
    const [description, setDescription] = useState(originalValues.description);
    const [start, setStart] = useState(originalValues.start);
    const [end, setEnd] = useState(originalValues.end);

    // Change detection - enable Update button only when values differ
    const hasChanges = useMemo(() => {
        return (
            title !== originalValues.title ||
            description !== originalValues.description ||
            start !== originalValues.start ||
            end !== originalValues.end
        );
    }, [title, description, start, end, originalValues]);

    const handleDeleteClick = () => setShowDeleteConfirm(true);

    const handleConfirmDelete = async () => {
        setSubmitting(true);
        try {
            const response = await deleteCalendarEvent(eventId);

            if (response.success) {
                // Remove from local calendar
                eventsService.remove(event.id);

                // Refresh calendar
                if (onEventUpdated) {
                    await onEventUpdated();
                }

                setShowDeleteConfirm(false);
                onClose();
            } else {
                alert("Error deleting event: " + (response.error || "Unknown error"));
                setShowDeleteConfirm(false);
            }
        } catch (error) {
            console.error("Error deleting event:", error);
            alert("Error deleting event: " + error.message);
            setShowDeleteConfirm(false);
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        // Validation
        if (Temporal.PlainDateTime.compare(
            Temporal.PlainDateTime.from(end),
            Temporal.PlainDateTime.from(start)
        ) < 0) {
            alert("End date cannot be earlier than start date.");
            return;
        }

        setSubmitting(true);

        try {
            const startZoned = Temporal.PlainDateTime.from(start).toZonedDateTime(TIMEZONE);
            const endZoned = Temporal.PlainDateTime.from(end).toZonedDateTime(TIMEZONE);

            // Prepare API data
            const updateData = {
                event_id: eventId,
                title: title,
                description: description,
                start_date: startZoned.toInstant().toString(),
                end_date: endZoned.toInstant().toString(),
                participant_ids: [] // Preserve existing or empty
            };

            const response = await updateCalendarEvent(updateData);

            if (response.success) {
                // Update local calendar
                eventsService.update({
                    ...event,
                    title: title,
                    description: description,
                    start: startZoned,
                    end: endZoned,
                });

                // Refresh from backend
                if (onEventUpdated) {
                    await onEventUpdated();
                }

                onClose();
            } else {
                alert("Error updating event: " + (response.error || "Unknown error"));
            }
        } catch (error) {
            console.error("Error updating event:", error);
            alert("Error updating event: " + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    // Get event type badge color
    const getTypeBadge = () => {
        const colors = {
            'Deadline': 'bg-red-100 text-red-700',
            'Meeting': 'bg-green-100 text-green-700',
            'Event': 'bg-blue-100 text-blue-700'
        };
        return colors[eventType] || colors['Event'];
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
                    {/* Header */}
                    <div className='flex flex-row justify-between items-center'>
                        <div className='flex items-center gap-2'>
                            <span className='text-gray-900 font-semibold text-2xl'>
                                {isDeadline ? 'View Deadline' : 'Edit Event'}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${getTypeBadge()}`}>
                                {eventType}
                            </span>
                        </div>
                        <span className='text-gray-500 cursor-pointer hover:text-red-500' onClick={onClose}>✕</span>
                    </div>

                    {/* Deadline warning */}
                    {isDeadline && (
                        <div className='bg-amber-50 border border-amber-200 text-amber-800 px-3 py-2 rounded-md text-sm'>
                            ⚠️ Deadlines cannot be edited here. Please edit in the Project or Task tab.
                        </div>
                    )}

                    {/* Title */}
                    <div className='flex flex-col gap-1'>
                        <span className='font-semibold text-gray-900'>Event Title</span>
                        <input
                            required
                            type='text'
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            disabled={isDeadline}
                            className={`min-w-100 w-100% border border-gray-300 py-2 px-3 rounded-sm 
                                ${isDeadline ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        />
                    </div>

                    {/* Description */}
                    <div className='flex flex-col gap-1'>
                        <span className='font-semibold text-gray-900'>Description</span>
                        <input
                            type='text'
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            disabled={isDeadline}
                            className={`min-w-100 w-100% border border-gray-300 py-2 px-3 rounded-sm
                                ${isDeadline ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        />
                    </div>

                    {/* Dates */}
                    <div className='grid grid-cols-2 gap-2'>
                        <div className='flex flex-col'>
                            <span className='font-semibold text-gray-900'>Start Date</span>
                            <input
                                required
                                type="datetime-local"
                                value={start}
                                onChange={e => setStart(e.target.value)}
                                max={end}
                                disabled={isDeadline}
                                className={`py-2 px-3 border border-gray-300 rounded-sm
                                    ${isDeadline ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                            />
                        </div>
                        <div className='flex flex-col'>
                            <span className='font-semibold text-gray-900'>End Date</span>
                            <input
                                required
                                type="datetime-local"
                                value={end}
                                onChange={e => setEnd(e.target.value)}
                                min={start}
                                disabled={isDeadline}
                                className={`py-2 px-3 border border-gray-300 rounded-sm
                                    ${isDeadline ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                            />
                        </div>
                    </div>

                    {/* Buttons - Hide for Deadlines */}
                    {!isDeadline && (
                        <div className='flex flex-row justify-center gap-2 my-5'>
                            <button
                                type="submit"
                                disabled={!hasChanges || submitting}
                                className={`py-2 w-32 rounded-md font-semibold text-white cursor-pointer
                                    ${!hasChanges || submitting
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700'}`}
                            >
                                {submitting ? 'Saving...' : 'Update'}
                            </button>

                            <button
                                type="button"
                                onClick={handleDeleteClick}
                                disabled={submitting}
                                className='py-2 w-32 rounded-md bg-red-600 font-semibold text-white cursor-pointer hover:bg-red-700'
                            >
                                Delete
                            </button>
                        </div>
                    )}

                    {/* Close button for Deadlines */}
                    {isDeadline && (
                        <div className='flex justify-center my-5'>
                            <button
                                type="button"
                                onClick={onClose}
                                className='py-2 w-32 rounded-md bg-gray-600 font-semibold text-white cursor-pointer hover:bg-gray-700'
                            >
                                Close
                            </button>
                        </div>
                    )}
                </div>
            </form>
        </div>
    )
}

export default EditEventModal