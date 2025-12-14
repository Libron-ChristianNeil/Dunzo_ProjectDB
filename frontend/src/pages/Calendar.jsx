import React from 'react'
import { useState } from 'react';
import { ScheduleXCalendar, useCalendarApp } from "@schedule-x/react";
import { createViewDay, createViewWeek, createViewMonthGrid } from '@schedule-x/calendar';
import '@schedule-x/theme-default/dist/index.css'
import { createCurrentTimePlugin } from '@schedule-x/current-time'
import { createEventModalPlugin } from '@schedule-x/event-modal'
import { createEventsServicePlugin } from '@schedule-x/events-service'
import AddEventModal from '../components/calendar-event-app-components/AddEventModal';
import EditEventModal from '../components/calendar-event-app-components/EditEventModal';

function Calendar() {
    const [openAddEvent, setOpenAddEvent] = useState(false);

     // 2. New State for managing the Edit Modal
    const [openEditEvent, setOpenEditEvent] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);

    const eventsService = useState(() => createEventsServicePlugin())[0]
    //calendar config pls ayaw hilabti ang uban except sa events[]
    const calendar = useCalendarApp({ 
        timezone: 'Asia/Manila',
        
        views: [
            createViewDay(), 
            createViewWeek(), 
            createViewMonthGrid()
        ],

        //event types
        calendars: {
            deadline: {
                colorName: 'deadline',
                lightColors: {
                    main: '#ef4444',
                    container: '#fee2e2',
                    onContainer: '#b91c1c',
                },
            },
            normal: {
                colorName: 'normal',
                lightColors: {
                    main: '#3b82f6',
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

        //sample events 
        events: [
        {
            id: '1',
            calendarId: 'deadline',
            title: 'Project Submission',
            description:'tulin machine hahahhaha',
            start: Temporal.ZonedDateTime.from({ year: 2025, month: 12, day: 14, hour: 10, minute: 0, timeZone: 'Asia/Manila' }), 
            end: Temporal.ZonedDateTime.from({ year: 2025, month: 12, day: 14, hour: 11, minute: 0, timeZone: 'Asia/Manila' }),
        },

        {
            id: '2',
            calendarId: 'meeting',
            title: 'Project Submission',
            description:'tulin machine hahahhaha',
            start: Temporal.ZonedDateTime.from({ year: 2025, month: 12, day: 12, hour: 13, minute: 0, timeZone: 'Asia/Manila' }), 
            end: Temporal.ZonedDateTime.from({ year: 2025, month: 12, day: 13, hour: 15, minute: 0, timeZone: 'Asia/Manila' }),
        },

        {
            id: '3',
            calendarId: 'normal',
            title: 'Project Submission',
            description:'tulin machine hahahhaha',
            start: Temporal.ZonedDateTime.from({ year: 2025, month: 12, day: 12, hour: 15, minute: 0, timeZone: 'Asia/Manila' }), 
            end: Temporal.ZonedDateTime.from({ year: 2025, month: 12, day: 12, hour: 16, minute: 0, timeZone: 'Asia/Manila' }),
        }
        ],

        callbacks: {
            onEventClick(calendarEvent) {
                console.log("Clicked:", calendarEvent);
                setSelectedEvent(calendarEvent); // Save the clicked event data
                setOpenEditEvent(true);          // Open your custom modal
            },
        },

        //for funtionality, pls don't touch
        plugins: [
            createCurrentTimePlugin(),
            // createEventModalPlugin(),
            eventsService 
        ]
    });

    return (
        <div className='flex flex-col h-screen mx-4'>
            {openAddEvent && (
                <AddEventModal 
                    onClose={() => setOpenAddEvent(false)} 
                    eventsService={eventsService} 
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