from django.shortcuts import render

def user_dashboard(request):
    return render(request, 'user_app/user_dashboard.html')

def edit_profile(request):
    return render(request, 'user_app/edit_profile.html')

def view_notifications(request):
    return render(request, 'user_app/view_notifications.html')
