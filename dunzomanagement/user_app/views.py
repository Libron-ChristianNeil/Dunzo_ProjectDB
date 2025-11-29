from django.contrib.auth import logout
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, get_object_or_404, redirect
from django.urls import reverse

from ..task_app.models import Task
from ..project_app.models import Project
from .models import User, Notification
from ..calendarevent_app.models import CalendarEvent
from django import forms
from django.contrib.auth.hashers import make_password

class UserForm(forms.ModelForm):
    password = forms.CharField(widget=forms.PasswordInput)

    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'email', 'password']


dashboard = 'user_app/dashboard.html'
settings = 'user_app/settings.html' # limit to editing profile and showing info and logging out
notifications = 'user_app/notifications.html' # pinafacebook na style, overlay

create = 'user_app/create_user.html'
edit = 'user_app/edit_user.html'
delete = 'user_app/delete_user.html'
user_logout = 'user_app/logout.html'

delete_notif = 'user_app/delete_notification.html' # confirmation page for deleting a notification

def create_user(request):
    if request.method == 'POST':
        form = UserForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            # Here you should hash the password
            user.password_hash = make_password(form.cleaned_data['password'])
            user.save()
            return redirect('get_dashboard')
    else:
        form = UserForm()

    return render(request, create, {
        'form': form,
    })

# @login_required
def get_dashboard(request):
    # stat row containing no. of tasks, projects, notifications, calendar events
    # Tasks in list format
    tasks = Task.objects.filter(users=request.user, status='Active').order_by('due_date')[:5]
    # Projects in list format
    projects = Project.objects.filter(users=request.user, status='Active').order_by('-last_login')[:5]
    # Notifications in list format
    notifs = Notification.objects.filter(user=request.user, is_read=False).order_by('-created_at')[:5]
    # Calendar events in list format
    events = CalendarEvent.objects.filter(user=request.user).order_by('end_date')[:5]

    return render(request, dashboard, {
        "tasks": tasks,
        "projects": projects,
        "notifications": notifs,
        "events": events,
    })

# @login_required
def get_settings(request):
    user = get_object_or_404(User, pk=request.user.pk)

    return render(request, settings, {
        "user": user,
    })

# @login_required
def get_notifications(request):
    user = request.user

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
    notif = get_object_or_404(Notification, pk=notification_id, user=request.user)

    if request.method == 'POST':
        notif.delete()
        return redirect('get_notifications')

    return render(request, delete_notif, {
        "notification": notif,
    })

# @login_required
def edit_user(request):
    user = get_object_or_404(User, pk=request.user.pk)

    if request.method == 'POST':
        form = UserForm(request.POST, instance=user)
        if form.is_valid():
            form.save()
            return redirect('get_settings')
    else:
        form = UserForm(instance=user)

    return render(request, edit, {'form': form, 'user': user})

# @login_required
def delete_user(request):
    user = get_object_or_404(User, pk=request.user.pk)

    if request.method == 'POST':
        user.delete()
        logout(request)
        return redirect(reverse('landingpage'))  # Redirect to home or login page after deletion

    return render(request, delete, {
        "user": user,
    })

# @login_required
def logout_user(request):
    if request.method == 'POST':
        logout(request)
        return redirect(reverse('landingpage'))

    return render(request, user_logout)