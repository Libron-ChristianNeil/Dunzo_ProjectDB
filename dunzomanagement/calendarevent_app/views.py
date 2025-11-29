from django.contrib.auth.decorators import login_required
from django.shortcuts import render

calendar = 'calendarevent_app/calendarevent_app.html'
event_details = 'calendarevent_app/event_details.html'

schedule_meeting = 'calendarevent_app/schedule_meeting.html'
create_event = 'calendarevent_app/create_event.html'

edit_event = 'calendarevent_app/edit_event.html' # should not be accessible when the event type is deadline (generated from task or project)
reschedule = 'calendarevent_app/reschedule_meeting.html'

delete_event = 'calendarevent_app/delete_event.html' # deletes any event type except the deadline type

# @login_required
def get_calendar(request):
    # Display the calendar view for the user
    return render(request, calendar)

