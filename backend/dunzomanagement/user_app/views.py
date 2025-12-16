import json
from django.contrib.auth import logout
from django.contrib.auth.decorators import login_required
from django.db import connection
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views import View
from django.apps import apps

from .models import Notification
Task = apps.get_model(app_label='task_app', model_name='Task')
Project = apps.get_model(app_label='project_app', model_name='Project')
CalendarEvent = apps.get_model(app_label='calendarevent_app', model_name='CalendarEvent')


def decode_body(request):
    try:
        return json.loads(request.body.decode('utf-8'))
    except json.JSONDecodeError:
        return {}

@login_required
def get_dashboard(request):
    user_id = request.user.pk

    try:
        with connection.cursor() as cursor:
            cursor.callproc("get_user_dashboard_data", [user_id])

            # Fetch the result (returns a tuple, we want the first element)
            row = cursor.fetchone()

            if row and row[0]:
                result = row[0]
                return JsonResponse(result, safe=False)
            else:
                # Handle case where procedure returns NULL (shouldn't happen with this SQL)
                return JsonResponse({'error': 'No data returned'}, status=500)

    except Exception as e:
        # Log the specific error for debugging
        print(f"Dashboard Stored Procedure Error: {e}")
        return JsonResponse({'error': 'Internal Server Error'}, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class UserView(View):
    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
        return super().dispatch(request, *args, **kwargs)

    # settings
    def get(self, request):
        user = request.user
        user_data = {
            "user_id": user.pk,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
        }
        return JsonResponse(user_data)
    # edit user details
    def put(self, request):
        data = decode_body(request)
        user = request.user

        # Update fields if they are provided in the request
        user.username = data.get('username', user.username)
        user.email = data.get('email', user.email)
        user.first_name = data.get('first_name', user.first_name)
        user.last_name = data.get('last_name', user.last_name)

        # If password is provided, verify old password first
        new_password = data.get('password')
        old_password = data.get('old_password')
        if new_password:
            if not old_password:
                return JsonResponse({'success': False, 'error': 'Old password is required'}, status=400)
            if not user.check_password(old_password):
                return JsonResponse({'success': False, 'error': 'Old password is incorrect'}, status=400)
            user.set_password(new_password)

        try:
            user.save()
            return JsonResponse({'success': True, 'message': 'User updated successfully'})
        except Exception as e:
            # Catch errors like "Username already taken"
            return JsonResponse({'success': False, 'error': str(e)}, status=400)
    # delete user
    def delete(self, request):
        user = request.user
        user.delete()
        logout(request)
        return JsonResponse({'success': True, 'message': 'User deleted successfully'})

@method_decorator(csrf_exempt, name='dispatch')
class NotificationView(View):
    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
        return super().dispatch(request, *args, **kwargs)

    def get(self, request):
        user = request.user.pk
        notifs = Notification.objects.filter(user=user).order_by('-created_at')
        notif_list = [
            {
                "notification_id": n.pk,
                "title": n.title,
                "message": n.message,
                "is_read": n.is_read,
                "created_at": n.created_at,
            }
            for n in notifs
        ]
        return JsonResponse(notif_list, safe=False)

    def delete(self, request, notification_id):
        notif = get_object_or_404(Notification, pk=notification_id, user=request.user.pk)
        notif.delete()
        return JsonResponse({'success': True, 'message': 'Notification deleted successfully'})