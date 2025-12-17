import json
from django.db import connection
from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views import View

def decode_body(request):
    try:
        return json.loads(request.body.decode('utf-8'))
    except json.JSONDecodeError:
        return {}
from datetime import datetime

def dictfetchall(cursor):
    """
    Convert cursor results to list of dicts.
    Datetime values are converted to ISO format strings WITHOUT 'Z' suffix
    so the frontend treats them as local Manila time (not UTC).
    """
    columns = [col[0] for col in cursor.description]
    rows = []
    for row in cursor.fetchall():
        row_dict = {}
        for col, val in zip(columns, row):
            # Convert datetime to ISO string without 'Z' (so frontend treats as local time)
            if isinstance(val, datetime):
                row_dict[col] = val.strftime('%Y-%m-%dT%H:%M:%S')
            else:
                row_dict[col] = val
        rows.append(row_dict)
    return rows

@method_decorator(csrf_exempt, name='dispatch')
class CalendarView(View):
    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
        return super().dispatch(request, *args, **kwargs)
    # display the calendar along with the events that correspond with the user
    # so if it has deadlines of a project or task, it should be able to see if the user is a member of that project or assigned to that task
    def get(self, request):
        try:
            user_id = request.user.user_id

            # Call Stored Procedure
            with connection.cursor() as cursor:
                cursor.callproc('get_user_calendar', [user_id])

                # Fetch results
                events = dictfetchall(cursor)

            return JsonResponse({'success': True, 'data': events}, safe=False)

        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class EventView(View):
    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
        return super().dispatch(request, *args, **kwargs)
    # get the details for the specific calendarevent
    def get(self, request):
        try:
            # 1. Extract event_id from Query Parameters
            event_id = request.GET.get('event_id')
            user_id = request.user.user_id

            if not event_id:
                return JsonResponse({'success': False, 'error': 'event_id is required'}, status=400)

            # 2. Call Stored Procedure
            with connection.cursor() as cursor:
                cursor.callproc('get_calendar_event', [
                    event_id,
                    user_id
                ])

                # 3. Fetch Result (Returns one row)
                result = dictfetchall(cursor)

            if not result:
                return JsonResponse({'success': False, 'error': 'Event not found'}, status=404)

            # Return the single event object
            return JsonResponse({'success': True, 'data': result[0]}, safe=False)

        except Exception as e:
            # Catches "Access Denied" if user doesn't have permission
            return JsonResponse({'success': False, 'error': str(e)}, status=500)
    # create a calendarevent of either a type Meeting or Event (Deadline should not be an option since it is generated automatically based on the business logic I provided
    # Meeting will only have the users manytomanyfield populated, the users should be members of the same project, this essentially creates a notification to the corresponding users to notify them of a meeting that they are a part of,
    # Event will only have one user(event creator) in the users manytomanyfield, this is essentially a personal reminder for the user
    def post(self, request):
        try:
            data = decode_body(request)
            creator_id = request.user.user_id

            # 1. Extract Fields
            event_type = data.get('type')  # 'Meeting' or 'Event'
            title = data.get('title')
            description = data.get('description', '')
            start_date = data.get('start_date')
            end_date = data.get('end_date')

            # For Meetings: project_id and participant_ids are required
            project_id = data.get('project_id')  # Can be None if type is 'Event'
            participant_ids = data.get('participant_ids', [])  # List of User IDs

            # 2. Basic Validation
            if not all([title, event_type, start_date, end_date]):
                return JsonResponse({'success': False, 'error': 'Missing required fields'}, status=400)

            if event_type == 'Deadline':
                return JsonResponse({'success': False, 'error': 'Cannot manually create Deadlines'}, status=400)

            # 3. Call Stored Procedure
            with connection.cursor() as cursor:
                cursor.callproc('create_calendar_event', [
                    creator_id,
                    project_id,
                    title,
                    description,
                    event_type,
                    start_date,
                    end_date,
                    participant_ids
                ])

                # Fetch new event ID
                result = cursor.fetchone()
                new_event_id = result[0] if result else None

            return JsonResponse({
                'success': True,
                'message': f'{event_type} created successfully',
                'event_id': new_event_id
            }, status=201)

        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)
    # update the calendarevent, only the Meeting and Event types can be updated, Deadline type cannot be updated since it is generated automatically based on the business logic I provided
    # the editable fields for both Meeting and Event types are title, description, start_date, end_date, and users(manytomanyfield) (only meeting type can update users)
    def put(self, request):
        try:
            data = decode_body(request)
            user_id = request.user.user_id

            # 1. Extract Fields
            event_id = data.get('event_id')
            title = data.get('title')
            description = data.get('description', '')
            start_date = data.get('start_date')
            end_date = data.get('end_date')
            participant_ids = data.get('participant_ids', []) # Only for Meeting

            # 2. Validation
            if not all([event_id, title, start_date, end_date]):
                return JsonResponse({'success': False, 'error': 'Missing required fields'}, status=400)

            # 3. Call Stored Procedure
            with connection.cursor() as cursor:
                cursor.callproc('update_calendar_event', [
                    event_id,
                    user_id,
                    title,
                    description,
                    start_date,
                    end_date,
                    participant_ids
                ])
                # Returns VOID

            return JsonResponse({'success': True, 'message': 'Event updated successfully'}, status=200)

        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)
    # delete the calendarevent, only Meeting and Event types can be deleted, Deadline type cannot be deleted since it is generated automatically based on the business logic I provided
    def delete(self, request):
        try:
            data = decode_body(request)
            user_id = request.user.user_id

            # 1. Extract Fields
            event_id = data.get('event_id')

            # 2. Validation
            if not event_id:
                return JsonResponse({'success': False, 'error': 'event_id is required'}, status=400)

            # 3. Call Stored Procedure
            with connection.cursor() as cursor:
                cursor.callproc('delete_calendar_event', [
                    event_id,
                    user_id
                ])
                # Returns VOID

            return JsonResponse({'success': True, 'message': 'Event deleted successfully'}, status=200)

        except Exception as e:
            # Will catch "Access Denied" or "Deadlines cannot be deleted"
            return JsonResponse({'success': False, 'error': str(e)}, status=500)