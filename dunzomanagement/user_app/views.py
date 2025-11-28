from django.contrib.auth.decorators import login_required
from django.shortcuts import render

dashboard = 'user_app/dashboard.html'
settings = 'user_app/settings.html'

# @login_required
def get_dashboard(request):
    # stat row containing no. of tasks, projects, notifications, calendar events
    # Tasks in list format
    # Projects in list format
    # Notifications in list format
    # Calendar events in list format
    return render(request, dashboard)

# @login_required
def get_settings(request):
    # bruh keep it as simple as possible
    # limit to editing profile and info and logging out
    return render(request, settings)


