import React, { useState, useEffect, useCallback } from 'react';
import { ScheduleXCalendar, useCalendarApp } from "@schedule-x/react";
import { createViewDay, createViewWeek, createViewMonthGrid } from '@schedule-x/calendar';
import '@schedule-x/theme-default/dist/index.css'
import { createCurrentTimePlugin } from '@schedule-x/current-time'
import { createEventsServicePlugin } from '@schedule-x/events-service'
import AddEventModal from '../components/calendar-event-app-components/AddEventModal';
import EditEventModal from '../components/calendar-event-app-components/EditEventModal';
import { getCalendarEvents } from '../https';
import { Temporal } from 'temporal-polyfill';

const TIMEZONE = 'Asia/Manila';

/**
 * Transform backend event to ScheduleX format
 */
const transformEvent = (backendEvent) => {
    // Determine calendarId based on type and source
    let calendarId = 'normal';

    if (backendEvent.type === 'Deadline') {
        // Distinguish between Task and Project deadlines
        if (backendEvent.task_id) {
            calendarId = 'task_deadline';  // Task deadline (has task_id)
        } else if (backendEvent.project_id) {
            calendarId = 'project_deadline';  // Project deadline (has project_id only)
        } else {
            calendarId = 'task_deadline';  // Default to task deadline
        }
    } else if (backendEvent.type === 'Meeting') {
        calendarId = 'meeting';
    } else {
        calendarId = 'normal';
    }

    // Parse dates - backend sends ISO strings
    const parseDate = (dateString) => {
        if (!dateString) return null;
        try {
            // Convert to ZonedDateTime in Manila timezone
            const instant = Temporal.Instant.from(
                dateString.endsWith('Z') ? dateString : dateString.replace(' ', 'T') + 'Z'
            );
            return instant.toZonedDateTimeISO(TIMEZONE);
        } catch (e) {
            // Fallback: try parsing as PlainDateTime
            try {
                const plain = Temporal.PlainDateTime.from(dateString.replace(' ', 'T'));
                return plain.toZonedDateTime(TIMEZONE);
            } catch (e2) {
                console.error('Failed to parse date:', dateString, e2);
                return null;
            }
        }
    };

    // Parse the dates
    let startDate = parseDate(backendEvent.start_date);
    let endDate = parseDate(backendEvent.end_date);

    // For Task Deadlines: if start_date is null, create a 1-hour event before due time
    // This makes the text visible in the calendar view
    if (!startDate && endDate && backendEvent.task_id) {
        // Set start to 1 hour before the due time
        startDate = endDate.subtract({ hours: 1 });
    } else if (!startDate && endDate) {
        // For other events without start, just use end as start
        startDate = endDate;
    }

    return {
        id: String(backendEvent.event_id),
        calendarId: calendarId,
        title: backendEvent.title || 'Untitled',
        description: backendEvent.description || '',
        start: startDate,
        end: endDate,
        // Preserve original data for edit modal
        _original: backendEvent
    };
};

function Calendar() {
    const [openAddEvent, setOpenAddEvent] = useState(false);
    const [openEditEvent, setOpenEditEvent] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [loading, setLoading] = useState(true);

    const eventsService = useState(() => createEventsServicePlugin())[0];

    // Fetch events from backend
    const fetchEvents = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getCalendarEvents();
            if (response.success && response.data) {
                // Clear existing events
                const existingEvents = eventsService.getAll();
                existingEvents.forEach(event => eventsService.remove(event.id));

                // Add new events
                response.data.forEach(backendEvent => {
                    const transformed = transformEvent(backendEvent);
                    if (transformed.start && transformed.end) {
                        eventsService.add(transformed);
                    }
                });
            } else {
                console.error('Failed to fetch calendar events:', response.error);
            }
        } catch (error) {
            console.error('Error fetching calendar events:', error);
        } finally {
            setLoading(false);
        }
    }, [eventsService]);

    // Load events on mount
    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    // Handle event click - check if Deadline (view-only)
    const handleEventClick = (calendarEvent) => {
        console.log("Clicked:", calendarEvent);

        // Check if this is a Deadline (view-only)
        const originalData = calendarEvent._original;
        if (originalData && originalData.type === 'Deadline') {
            // Show alert for deadlines - they are view-only
            alert('Deadlines cannot be edited here. Please edit in the Project or Task tab.');
            return;
        }

        setSelectedEvent(calendarEvent);
        setOpenEditEvent(true);
    };

    const calendar = useCalendarApp({
        timezone: TIMEZONE,

        views: [
            createViewDay(),
            createViewWeek(),
            createViewMonthGrid()
        ],

        // Event type colors
        calendars: {
            task_deadline: {
                colorName: 'task_deadline',
                lightColors: {
                    main: '#f97316',      // Orange
                    container: '#ffedd5',
                    onContainer: '#c2410c',
                },
            },
            project_deadline: {
                colorName: 'project_deadline',
                lightColors: {
                    main: '#a855f7',      // Purple
                    container: '#f3e8ff',
                    onContainer: '#7e22ce',
                },
            },
            normal: {
                colorName: 'normal',
                lightColors: {
                    main: '#3b82f6',      // Blue
                    container: '#dbeafe',
                    onContainer: '#1d4ed8',
                },
            },
            meeting: {
                colorName: 'meeting',
                lightColors: {
                    main: '#22c55e',
                    container: '#dcfce7',
                    onContainer: '#15803d',
                },
            },
        },

        // Start with empty events - will be loaded from backend
        events: [],

        callbacks: {
            onEventClick: handleEventClick,
        },

        plugins: [
            createCurrentTimePlugin(),
            eventsService
        ]
    });

    return (
        <div className='flex flex-col h-screen mx-4'>
            {openAddEvent && (
                <AddEventModal
                    onClose={() => setOpenAddEvent(false)}
                    eventsService={eventsService}
                    onEventCreated={fetchEvents}
                />
            )}

            {openEditEvent && selectedEvent && (
                <EditEventModal
                    event={selectedEvent}
                    eventsService={eventsService}
                    onClose={() => {
                        setOpenEditEvent(false);
                        setSelectedEvent(null);
                    }}
                    onEventUpdated={fetchEvents}
                />
            )}

            <div className='flex flex-row justify-between items-center bg-none py-3'>
                <h1 className='m-0 p-0'>Calendar.</h1>
                <button className='bg-red-500 mr-4 py-1.5 px-4 text-white font-medium rounded-full cursor-pointer'
                    onClick={() => setOpenAddEvent(true)}>
                    <span className='mr-2'><i className="fa-solid fa-plus"></i></span>
                    New Event
                </button>
            </div>

            {loading && (
                <div className='flex justify-center items-center py-4'>
                    <span className='text-gray-500'>Loading events...</span>
                </div>
            )}

            <div className='flex flex-col items-center mt-6'
                style={{
                    '--sx-color-primary': '#ef4444',
                    '--sx-color-primary-container': '#fee2e2',
                    '--sx-color-on-primary': '#ffffff',
                }}>
                <ScheduleXCalendar calendarApp={calendar} />
            </div>

        </div>

    )
}

export default Calendar