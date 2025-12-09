from django.contrib.auth import logout, login
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, get_object_or_404, redirect
from task_app.models import Task
from project_app.models import Project
from .models import User, Notification
from calendarevent_app.models import CalendarEvent
from django import forms
from django.contrib.auth.hashers import make_password

class UserForm(forms.ModelForm):
    password = forms.CharField(widget=forms.PasswordInput)

    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'email', 'password'] #email is optional

### URL names to use for redirect function
DASHBOARD = 'user_app:dashboard'
SETTINGS = 'user:app:settings'
LANDING_PAGE = 'landingpage'


dashboard = 'user_app/dashboard.html'
settings = 'user_app/settings.html' # limit to editing profile and showing info and logging out
notifications = 'user_app/notifications.html' # pinafacebook na style, overlay

create = 'user_app/sign_up.html' # url naa sa dunzomanagement/urls.py
edit = 'user_app/edit_user.html'
delete = 'user_app/delete_user.html' # confirmation overlay
user_logout = 'user_app/logout.html' #  confirmation overlay

delete_notif = 'user_app/delete_notification.html' # confirmation overlay

def create_user(request):
    if request.method == 'POST':
        form = UserForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.set_password(form.cleaned_data['password'])  # hash password properly
            user.save()
            login(request, user)  # log in the user immediately after signup
            return redirect(DASHBOARD)  # redirect to dashboard
    else:
        form = UserForm()

    return render(request, create, {
        'form': form,
    })

# @login_required
def get_dashboard(request):
    # stat row containing no. of tasks, projects, notifications, calendar events
    # Tasks in list format
    tasks = Task.objects.filter(users=request.user.pk, status='Active').order_by('due_date')[:5]
    # Projects in list format
    projects = Project.objects.filter(users=request.user.pk, status='Active').order_by('-last_login')[:5]
    # Notifications in list format
    notifs = Notification.objects.filter(user=request.user.pk, is_read=False).order_by('-created_at')[:5]
    # Calendar events in list format
    events = CalendarEvent.objects.filter(user=request.user.pk).order_by('end_date')[:5]

    return render(request, dashboard, {
        "tasks": tasks,
        "projects": projects,
        "notifications": notifs,
        "events": events,
    })

# @login_required
def get_settings(request):
    user = request.user
    return render(request, settings, {'user': user})

# @login_required
def get_notifications(request):
    user = request.user.pk

    # Get all notifications for the user
    notifs = Notification.objects.filter(user=user).order_by('-created_at')

    # Session key to track first visit
    session_key = 'visited_notifications'

    if request.session.get(session_key):
        # User has visited before → mark all unread as read
        Notification.objects.filter(user=user, is_read=False).update(is_read=True)
    else:
        # First visit → keep everything unread
        request.session[session_key] = True

    return render(request, notifications, {
        "notifications": notifs,
    })

# @login_required
def delete_notification(request, notification_id):
    notif = get_object_or_404(Notification, pk=notification_id, user=request.user.pk)

    if request.method == 'POST':
        notif.delete()
        return redirect(DASHBOARD)

    return render(request, delete_notif, {
        "notification": notif,
    })

# @login_required
def edit_user(request):
    user = request.user

    if request.method == 'POST':
        form = UserForm(request.POST, instance=user)
        if form.is_valid():
            form.save()
            return redirect(SETTINGS)
    else:
        form = UserForm(instance=user)

    return render(request, edit, {'form': form, 'user': user})

# @login_required
def delete_user(request):
    user = request.user

    if request.method == 'POST':
        user.delete()
        logout(request)
        return redirect(LANDING_PAGE)  # Redirect to home or login page after deletion

    return render(request, delete, {
        "user": user,
    })

# @login_required
def logout_user(request):
    if request.method == 'POST':
        logout(request)
        return redirect(LANDING_PAGE)

    return render(request, user_logout)