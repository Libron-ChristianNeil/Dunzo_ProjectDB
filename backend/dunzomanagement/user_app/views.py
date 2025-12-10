import json
from django.contrib.auth import logout, login
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404, redirect
from django.views.decorators.csrf import csrf_exempt

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

def decode_body(request):
    try:
        return json.loads(request.body.decode('utf-8'))
    except json.JSONDecodeError:
        return {}

@csrf_exempt
def create_user(request):
    if request.method == 'POST':
        data = decode_body(request)

        username = data.get('username')
        password = data.get('password')

        # 1. Basic Validation
        if not username or not password:
            return JsonResponse({'success': False, 'error': 'All fields are required.'}, status=400)

        # 2. Check if User already exists
        if User.objects.filter(username=username).exists():
            return JsonResponse({'success': False, 'error': 'Username already taken.'}, status=400)

        # 3. Create User
        try:
            # create_user automatically hashes the password
            user = User.objects.create_user(username=username, password=password)
            user.save()

            # 4. Log them in immediately
            login(request, user)

            return JsonResponse({'success': True, 'message': 'Registration successful'})

        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)

    return JsonResponse({'error': 'Method not allowed'}, status=405)

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