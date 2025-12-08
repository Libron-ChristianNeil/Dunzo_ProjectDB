
# from django.urls import path
# from . import views
#
# urlpatterns = [
#     path('calendarevent/', views.CalendarEventViews.as_view(), name='calendarevent_app'),
# ]
# from django.urls import path
# from . import views
#
# app_name = 'calendarevent_app'
#
# urlpatterns = [
#     path('', views.get_calendar, name='calendar'),
# ]


from django.urls import path
from .views import (
    GetCalendar, GetEventDetails, ScheduleMeeting, CreateEvent,
    EditEvent, RescheduleMeeting, DeleteEvent, CalendarAPI,
    GetProjectMembersAPI, get_calendar  # Legacy function
)

app_name = 'calendarevent_app'

urlpatterns = [
    # Calendar Views
    path('', GetCalendar.as_view(), name='calendar'),
    path('event/<int:event_id>/', GetEventDetails.as_view(), name='event_details'),

    # Create Event Views
    path('meeting/schedule/', ScheduleMeeting.as_view(), name='schedule_meeting'),
    path('event/create/', CreateEvent.as_view(), name='create_event'),

    # Edit/Update Event Views
    path('event/<int:event_id>/edit/', EditEvent.as_view(), name='edit_event'),
    path('meeting/<int:event_id>/reschedule/', RescheduleMeeting.as_view(), name='reschedule_meeting'),

    # Delete Event Views
    path('event/<int:event_id>/delete/', DeleteEvent.as_view(), name='delete_event'),

    # API Endpoints
    path('api/events/', CalendarAPI.as_view(), name='calendar_api'),
    path('api/project/<int:project_id>/members/', GetProjectMembersAPI.as_view(), name='project_members_api'),

    # Legacy URL (for backward compatibility)
    path('legacy/', get_calendar, name='calendar_legacy'),
]

