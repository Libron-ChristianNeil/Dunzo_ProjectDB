from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from django.views import View

calendar = 'calendarevent_app/calendarevent_app.html'

# @login_required
def get_calendar(request):
    # Display the calendar view for the user
    return render(request, calendar)

