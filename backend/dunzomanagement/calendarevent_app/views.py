
# from django.shortcuts import render
# from django.views import View
#
# # Create your views here.
# class CalendarEventViews(View):
#     template_name = 'calendarevent_app/calendarevent_app.html'
#     def get(self, request):
#         return render(request, self.template_name)
#
#
# =======
# # from django.contrib.auth.decorators import login_required
# # from django.shortcuts import render
# #
# # calendar = 'calendarevent_app/calendarevent_app.html'
# # event_details = 'calendarevent_app/event_details.html'
# #
# # schedule_meeting = 'calendarevent_app/schedule_meeting.html'
# # create_event = 'calendarevent_app/create_event.html'
# #
# # edit_event = 'calendarevent_app/edit_event.html' # should not be accessible when the event type is deadline (generated from task or project)
# # reschedule = 'calendarevent_app/reschedule_meeting.html'
# #
# # delete_event = 'calendarevent_app/delete_event.html' # deletes any event type except the deadline type
# #
# # # @login_required
# # def get_calendar(request):
# #     # Display the calendar view for the user
# #     return render(request, calendar)
# #


from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseForbidden, JsonResponse
from django.db import connection
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.views import View
from django.utils.decorators import method_decorator
import json
from datetime import datetime, timedelta

from .models import CalendarEvent
from project_app.models import Project
from user_app.models import User
from task_app.models import Task

# Template paths
CALENDAR_TEMPLATE = 'calendarevent_app/calendarevent_app.html'
EVENT_DETAILS_TEMPLATE = 'calendarevent_app/event_details.html'
SCHEDULE_MEETING_TEMPLATE = 'calendarevent_app/schedule_meeting.html'
CREATE_EVENT_TEMPLATE = 'calendarevent_app/create_event.html'
EDIT_EVENT_TEMPLATE = 'calendarevent_app/edit_event.html'
RESCHEDULE_TEMPLATE = 'calendarevent_app/reschedule_meeting.html'
DELETE_EVENT_TEMPLATE = 'calendarevent_app/delete_event.html'


# ========== HELPER FUNCTIONS ==========
def get_user_projects(user_id):
    """Get all projects the user is a member of"""
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT p.project_id, p.title 
            FROM project_app_project p
            INNER JOIN project_app_projectmembership pm ON p.project_id = pm.project_id
            WHERE pm.user_id = %s AND p.status = 'Active'
            ORDER BY p.title
        """, [user_id])
        return cursor.fetchall()


def get_project_members(project_id):
    """Get all members of a project"""
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT u.user_id, u.username, u.email, pm.role
            FROM user_app_user u
            INNER JOIN project_app_projectmembership pm ON u.user_id = pm.user_id
            WHERE pm.project_id = %s
            ORDER BY 
                CASE pm.role 
                    WHEN 'Leader' THEN 1
                    WHEN 'Manager' THEN 2
                    WHEN 'Member' THEN 3
                END,
                u.username
        """, [project_id])
        return cursor.fetchall()


# ========== STORED PROCEDURES CLASS-BASED VIEWS ==========

class GetCalendar(View):
    template = CALENDAR_TEMPLATE

    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def get(self, request):
        # Get date range from query parameters (default to current month)
        year = request.GET.get('year', datetime.now().year)
        month = request.GET.get('month', datetime.now().month)

        try:
            year = int(year)
            month = int(month)
            start_date = datetime(year, month, 1)
            if month == 12:
                end_date = datetime(year + 1, 1, 1) - timedelta(seconds=1)
            else:
                end_date = datetime(year, month + 1, 1) - timedelta(seconds=1)
        except ValueError:
            # Default to current month if invalid date
            start_date = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            end_date = start_date.replace(month=start_date.month % 12 + 1, day=1) - timedelta(seconds=1)

        # Get user's calendar events using stored procedure
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT * FROM get_user_calendar_events(%s, %s, %s)
            """, [request.user.id, start_date, end_date])

            events = []
            columns = [col[0] for col in cursor.description]
            for row in cursor.fetchall():
                event = dict(zip(columns, row))
                # Convert to serializable format
                event['start_date'] = event['start_date'].isoformat() if event['start_date'] else None
                event['end_date'] = event['end_date'].isoformat() if event['end_date'] else None
                events.append(event)

        # Get month navigation
        prev_month = month - 1 if month > 1 else 12
        prev_year = year if month > 1 else year - 1
        next_month = month + 1 if month < 12 else 1
        next_year = year if month < 12 else year + 1

        return render(request, self.template, {
            'events': events,
            'current_year': year,
            'current_month': month,
            'prev_year': prev_year,
            'prev_month': prev_month,
            'next_year': next_year,
            'next_month': next_month,
            'month_names': [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ]
        })


class GetEventDetails(View):
    template = EVENT_DETAILS_TEMPLATE

    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def get(self, request, event_id):
        event = get_object_or_404(CalendarEvent, pk=event_id)

        # Check if user can view this event
        can_view = False

        # User can view if:
        # 1. They created it
        # 2. They are a participant (for meetings)
        # 3. It's a project deadline and they're a project member
        # 4. It's a task deadline and they're assigned to the task

        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT EXISTS(
                    SELECT 1 FROM get_user_calendar_events(%s) 
                    WHERE event_id = %s
                )
            """, [request.user.id, event_id])
            can_view = cursor.fetchone()[0]

        if not can_view:
            return HttpResponseForbidden("You don't have permission to view this event")

        # Get event details
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT * FROM get_user_calendar_events(%s) 
                WHERE event_id = %s
            """, [request.user.id, event_id])

            columns = [col[0] for col in cursor.description]
            event_data = cursor.fetchone()

            if event_data:
                event_details = dict(zip(columns, event_data))

                # Get participants for meetings
                participants = []
                if event.type == 'Meeting':
                    participants = list(event.participants.all())

                # Get related project/task info
                project = event.project if event.project else None
                task = event.task if event.task else None

                return render(request, self.template, {
                    'event': event,
                    'event_details': event_details,
                    'participants': participants,
                    'project': project,
                    'task': task,
                    'can_edit': self._can_edit_event(request.user, event),
                    'can_delete': self._can_delete_event(request.user, event)
                })

        return render(request, self.template, {'event': event})

    def _can_edit_event(self, user, event):
        """Check if user can edit the event"""
        if event.type == 'Deadline':
            return False  # Deadlines cannot be edited

        if event.type == 'Event':
            return event.user_id == user.id

        if event.type == 'Meeting':
            # Creator or participants can edit
            if event.user_id == user.id:
                return True
            return event.participants.filter(id=user.id).exists()

        return False

    def _can_delete_event(self, user, event):
        """Check if user can delete the event"""
        if event.type == 'Deadline':
            return False  # Deadlines cannot be deleted

        if event.type == 'Event':
            return event.user_id == user.id

        if event.type == 'Meeting':
            # Creator or participants can delete
            if event.user_id == user.id:
                return True
            return event.participants.filter(id=user.id).exists()

        return False


class ScheduleMeeting(View):
    template = SCHEDULE_MEETING_TEMPLATE

    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def get(self, request):
        # Get user's projects for dropdown
        projects = get_user_projects(request.user.id)

        if not projects:
            return render(request, self.template, {
                'error': 'You need to be a member of a project to schedule meetings',
                'projects': []
            })

        # Default to first project
        default_project_id = projects[0][0] if projects else None

        # Get members of default project
        members = []
        if default_project_id:
            members = get_project_members(default_project_id)

        return render(request, self.template, {
            'projects': projects,
            'members': members,
            'default_project_id': default_project_id
        })

    def post(self, request):
        try:
            # Get form data
            project_id = request.POST.get('project_id')
            title = request.POST.get('title')
            description = request.POST.get('description', '')
            start_date_str = request.POST.get('start_date')
            end_date_str = request.POST.get('end_date')

            # Get participant IDs
            participant_ids = request.POST.getlist('participants[]')
            participant_ids = [int(pid) for pid in participant_ids if pid]

            # Add creator as participant if not already included
            if request.user.id not in participant_ids:
                participant_ids.append(request.user.id)

            # Validate required fields
            if not all([project_id, title, start_date_str, end_date_str]):
                projects = get_user_projects(request.user.id)
                members = get_project_members(project_id) if project_id else []
                return render(request, self.template, {
                    'projects': projects,
                    'members': members,
                    'error': 'All required fields must be filled',
                    'form_data': request.POST
                })

            # Parse dates
            try:
                if 'T' in start_date_str:
                    start_date = datetime.fromisoformat(start_date_str.replace('Z', '+00:00'))
                else:
                    start_date = datetime.strptime(start_date_str, '%Y-%m-%d %H:%M:%S')

                if 'T' in end_date_str:
                    end_date = datetime.fromisoformat(end_date_str.replace('Z', '+00:00'))
                else:
                    end_date = datetime.strptime(end_date_str, '%Y-%m-%d %H:%M:%S')
            except ValueError:
                # Try alternative format
                start_date = datetime.strptime(start_date_str, '%Y-%m-%dT%H:%M')
                end_date = datetime.strptime(end_date_str, '%Y-%m-%dT%H:%M')

            # Call the stored procedure
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT * FROM create_calendar_event(
                        %s, %s, %s, %s, %s, %s, %s, %s, %s::integer[], %s, %s
                    )
                """, [
                    'Meeting',  # event_type
                    title,  # title
                    end_date,  # end_date
                    int(project_id),  # project_id
                    None,  # task_id
                    request.user.id,  # user_id (creator)
                    description,  # description
                    start_date,  # start_date
                    participant_ids,  # participant_ids
                    request.user.id,  # created_by_user_id
                    False  # is_auto_generated
                ])

                result = cursor.fetchone()

                if result:
                    event_id, message = result

                    if event_id > 0:
                        return redirect('calendarevent_app:event_details', event_id=event_id)
                    else:
                        projects = get_user_projects(request.user.id)
                        members = get_project_members(project_id) if project_id else []
                        return render(request, self.template, {
                            'projects': projects,
                            'members': members,
                            'error': message,
                            'form_data': request.POST
                        })
                else:
                    projects = get_user_projects(request.user.id)
                    members = get_project_members(project_id) if project_id else []
                    return render(request, self.template, {
                        'projects': projects,
                        'members': members,
                        'error': 'No result returned from database',
                        'form_data': request.POST
                    })

        except Exception as e:
            projects = get_user_projects(request.user.id)
            members = get_project_members(project_id) if project_id else []
            return render(request, self.template, {
                'projects': projects,
                'members': members,
                'error': f'Error: {str(e)}',
                'form_data': request.POST
            })


class CreateEvent(View):
    template = CREATE_EVENT_TEMPLATE

    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def get(self, request):
        return render(request, self.template)

    def post(self, request):
        try:
            # Get form data
            title = request.POST.get('title')
            description = request.POST.get('description', '')
            start_date_str = request.POST.get('start_date')
            end_date_str = request.POST.get('end_date')

            # Validate required fields
            if not all([title, end_date_str]):
                return render(request, self.template, {
                    'error': 'Title and end date are required',
                    'form_data': request.POST
                })

            # Parse dates
            try:
                if 'T' in start_date_str:
                    start_date = datetime.fromisoformat(start_date_str.replace('Z', '+00:00'))
                else:
                    start_date = datetime.strptime(start_date_str, '%Y-%m-%d %H:%M:%S')

                if 'T' in end_date_str:
                    end_date = datetime.fromisoformat(end_date_str.replace('Z', '+00:00'))
                else:
                    end_date = datetime.strptime(end_date_str, '%Y-%m-%d %H:%M:%S')
            except ValueError:
                # Try alternative format
                start_date = datetime.strptime(start_date_str, '%Y-%m-%dT%H:%M') if start_date_str else None
                end_date = datetime.strptime(end_date_str, '%Y-%m-%dT%H:%M')

            # Call the stored procedure
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT * FROM create_calendar_event(
                        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                    )
                """, [
                    'Event',  # event_type
                    title,  # title
                    end_date,  # end_date
                    None,  # project_id
                    None,  # task_id
                    request.user.id,  # user_id (creator)
                    description,  # description
                    start_date,  # start_date
                    None,  # participant_ids (none for events)
                    request.user.id,  # created_by_user_id
                    False  # is_auto_generated
                ])

                result = cursor.fetchone()

                if result:
                    event_id, message = result

                    if event_id > 0:
                        return redirect('calendarevent_app:event_details', event_id=event_id)
                    else:
                        return render(request, self.template, {
                            'error': message,
                            'form_data': request.POST
                        })
                else:
                    return render(request, self.template, {
                        'error': 'No result returned from database',
                        'form_data': request.POST
                    })

        except Exception as e:
            return render(request, self.template, {
                'error': f'Error: {str(e)}',
                'form_data': request.POST
            })


class EditEvent(View):
    template = EDIT_EVENT_TEMPLATE

    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def get(self, request, event_id):
        event = get_object_or_404(CalendarEvent, pk=event_id)

        # Check if event can be edited
        if event.type == 'Deadline':
            return HttpResponseForbidden("Deadline events cannot be edited")

        # Check permissions
        if event.type == 'Event' and event.user_id != request.user.id:
            return HttpResponseForbidden("Only the event creator can edit this event")

        if event.type == 'Meeting':
            if event.user_id != request.user.id and not event.participants.filter(id=request.user.id).exists():
                return HttpResponseForbidden("Only meeting creator or participants can edit this meeting")

        # Prepare data for template
        context = {
            'event': event,
            'event_types': CalendarEvent.TYPE_CHOICES
        }

        # Add project/member data for meetings
        if event.type == 'Meeting' and event.project:
            context['projects'] = get_user_projects(request.user.id)
            context['members'] = get_project_members(event.project.project_id)
            context['selected_participants'] = list(event.participants.values_list('id', flat=True))

        return render(request, self.template, context)

    def post(self, request, event_id):
        try:
            event = get_object_or_404(CalendarEvent, pk=event_id)

            # Check permissions (same as GET)
            if event.type == 'Deadline':
                return HttpResponseForbidden("Deadline events cannot be edited")

            if event.type == 'Event' and event.user_id != request.user.id:
                return HttpResponseForbidden("Only the event creator can edit this event")

            if event.type == 'Meeting':
                if event.user_id != request.user.id and not event.participants.filter(id=request.user.id).exists():
                    return HttpResponseForbidden("Only meeting creator or participants can edit this meeting")

            # Get form data
            title = request.POST.get('title')
            description = request.POST.get('description', '')
            start_date_str = request.POST.get('start_date')
            end_date_str = request.POST.get('end_date')

            # Parse dates
            start_date = None
            end_date = None

            if start_date_str:
                try:
                    if 'T' in start_date_str:
                        start_date = datetime.fromisoformat(start_date_str.replace('Z', '+00:00'))
                    else:
                        start_date = datetime.strptime(start_date_str, '%Y-%m-%d %H:%M:%S')
                except ValueError:
                    start_date = datetime.strptime(start_date_str, '%Y-%m-%dT%H:%M')

            if end_date_str:
                try:
                    if 'T' in end_date_str:
                        end_date = datetime.fromisoformat(end_date_str.replace('Z', '+00:00'))
                    else:
                        end_date = datetime.strptime(end_date_str, '%Y-%m-%d %H:%M:%S')
                except ValueError:
                    end_date = datetime.strptime(end_date_str, '%Y-%m-%dT%H:%M')

            # For meetings, get participant IDs
            participant_ids = None
            if event.type == 'Meeting':
                participant_ids = request.POST.getlist('participants[]')
                participant_ids = [int(pid) for pid in participant_ids if pid]

                # Add creator if not already included
                if event.user_id not in participant_ids:
                    participant_ids.append(event.user_id)

            # Call the update stored procedure
            with connection.cursor() as cursor:
                if event.type == 'Meeting':
                    cursor.execute("""
                        SELECT * FROM update_calendar_event(
                            %s, %s, %s, %s, %s, %s::integer[], %s
                        )
                    """, [
                        event_id,  # event_id
                        title,  # new_title
                        description,  # new_description
                        start_date,  # new_start_date
                        end_date,  # new_end_date
                        participant_ids,  # new_participant_ids
                        request.user.id  # updated_by_user_id
                    ])
                else:  # Event type
                    cursor.execute("""
                        SELECT * FROM update_calendar_event(
                            %s, %s, %s, %s, %s, %s, %s
                        )
                    """, [
                        event_id,  # event_id
                        title,  # new_title
                        description,  # new_description
                        start_date,  # new_start_date
                        end_date,  # new_end_date
                        None,  # new_participant_ids (none for events)
                        request.user.id  # updated_by_user_id
                    ])

                result = cursor.fetchone()

                if result:
                    success, message = result

                    if success:
                        return redirect('calendarevent_app:event_details', event_id=event_id)
                    else:
                        context = self._get_edit_context(event, request.user.id)
                        context['error'] = message
                        context['form_data'] = request.POST
                        return render(request, self.template, context)
                else:
                    context = self._get_edit_context(event, request.user.id)
                    context['error'] = 'No result returned from database'
                    context['form_data'] = request.POST
                    return render(request, self.template, context)

        except Exception as e:
            context = self._get_edit_context(event, request.user.id)
            context['error'] = f'Error: {str(e)}'
            context['form_data'] = request.POST
            return render(request, self.template, context)

    def _get_edit_context(self, event, user_id):
        """Prepare context data for edit template"""
        context = {
            'event': event,
            'event_types': CalendarEvent.TYPE_CHOICES
        }

        if event.type == 'Meeting' and event.project:
            context['projects'] = get_user_projects(user_id)
            context['members'] = get_project_members(event.project.project_id)
            context['selected_participants'] = list(event.participants.values_list('id', flat=True))

        return context


class RescheduleMeeting(View):
    template = RESCHEDULE_TEMPLATE

    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def get(self, request, event_id):
        event = get_object_or_404(CalendarEvent, pk=event_id)

        # Check if it's a meeting
        if event.type != 'Meeting':
            return HttpResponseForbidden("Only meetings can be rescheduled")

        # Check permissions
        if event.user_id != request.user.id and not event.participants.filter(id=request.user.id).exists():
            return HttpResponseForbidden("Only meeting creator or participants can reschedule this meeting")

        return render(request, self.template, {'event': event})

    def post(self, request, event_id):
        try:
            event = get_object_or_404(CalendarEvent, pk=event_id)

            # Check if it's a meeting
            if event.type != 'Meeting':
                return HttpResponseForbidden("Only meetings can be rescheduled")

            # Check permissions
            if event.user_id != request.user.id and not event.participants.filter(id=request.user.id).exists():
                return HttpResponseForbidden("Only meeting creator or participants can reschedule this meeting")

            # Get new dates
            start_date_str = request.POST.get('start_date')
            end_date_str = request.POST.get('end_date')

            if not start_date_str or not end_date_str:
                return render(request, self.template, {
                    'event': event,
                    'error': 'Both start and end dates are required'
                })

            # Parse dates
            try:
                if 'T' in start_date_str:
                    start_date = datetime.fromisoformat(start_date_str.replace('Z', '+00:00'))
                else:
                    start_date = datetime.strptime(start_date_str, '%Y-%m-%d %H:%M:%S')

                if 'T' in end_date_str:
                    end_date = datetime.fromisoformat(end_date_str.replace('Z', '+00:00'))
                else:
                    end_date = datetime.strptime(end_date_str, '%Y-%m-%d %H:%M:%S')
            except ValueError:
                start_date = datetime.strptime(start_date_str, '%Y-%m-%dT%H:%M')
                end_date = datetime.strptime(end_date_str, '%Y-%m-%dT%H:%M')

            # Validate dates
            if start_date >= end_date:
                return render(request, self.template, {
                    'event': event,
                    'error': 'Start date must be before end date'
                })

            # Call the update stored procedure (only update dates)
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT * FROM update_calendar_event(
                        %s, %s, %s, %s, %s, %s, %s
                    )
                """, [
                    event_id,  # event_id
                    None,  # new_title (keep existing)
                    None,  # new_description (keep existing)
                    start_date,  # new_start_date
                    end_date,  # new_end_date
                    None,  # new_participant_ids (keep existing)
                    request.user.id  # updated_by_user_id
                ])

                result = cursor.fetchone()

                if result:
                    success, message = result

                    if success:
                        return redirect('calendarevent_app:event_details', event_id=event_id)
                    else:
                        return render(request, self.template, {
                            'event': event,
                            'error': message
                        })
                else:
                    return render(request, self.template, {
                        'event': event,
                        'error': 'No result returned from database'
                    })

        except Exception as e:
            return render(request, self.template, {
                'event': event,
                'error': f'Error: {str(e)}'
            })


class DeleteEvent(View):
    template = DELETE_EVENT_TEMPLATE

    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def get(self, request, event_id):
        event = get_object_or_404(CalendarEvent, pk=event_id)

        # Check if event can be deleted
        if event.type == 'Deadline':
            return HttpResponseForbidden("Deadline events cannot be deleted")

        # Check permissions
        if event.type == 'Event' and event.user_id != request.user.id:
            return HttpResponseForbidden("Only the event creator can delete this event")

        if event.type == 'Meeting':
            if event.user_id != request.user.id and not event.participants.filter(id=request.user.id).exists():
                return HttpResponseForbidden("Only meeting creator or participants can delete this meeting")

        return render(request, self.template, {'event': event})

    def post(self, request, event_id):
        try:
            event = get_object_or_404(CalendarEvent, pk=event_id)

            # Check if event can be deleted
            if event.type == 'Deadline':
                return HttpResponseForbidden("Deadline events cannot be deleted")

            # Check permissions
            if event.type == 'Event' and event.user_id != request.user.id:
                return HttpResponseForbidden("Only the event creator can delete this event")

            if event.type == 'Meeting':
                if event.user_id != request.user.id and not event.participants.filter(id=request.user.id).exists():
                    return HttpResponseForbidden("Only meeting creator or participants can delete this meeting")

            # Call the delete stored procedure
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT * FROM delete_calendar_event(%s, %s)
                """, [event_id, request.user.id])

                result = cursor.fetchone()

                if result:
                    success, message = result

                    if success:
                        return redirect('calendarevent_app:calendar')
                    else:
                        return render(request, self.template, {
                            'event': event,
                            'error': message
                        })
                else:
                    return render(request, self.template, {
                        'event': event,
                        'error': 'No result returned from database'
                    })

        except Exception as e:
            return render(request, self.template, {
                'event': event,
                'error': f'Error: {str(e)}'
            })


# ========== API VIEWS ==========

class CalendarAPI(View):

    @method_decorator(login_required)
    @method_decorator(csrf_exempt)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def get(self, request):
        """Get calendar events as JSON (for AJAX calendar widgets)"""
        try:
            start_str = request.GET.get('start')
            end_str = request.GET.get('end')

            start_date = None
            end_date = None

            if start_str:
                start_date = datetime.fromisoformat(start_str.replace('Z', '+00:00'))
            if end_str:
                end_date = datetime.fromisoformat(end_str.replace('Z', '+00:00'))

            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT * FROM get_user_calendar_events(%s, %s, %s)
                """, [request.user.id, start_date, end_date])

                events = []
                columns = [col[0] for col in cursor.description]
                for row in cursor.fetchall():
                    event = dict(zip(columns, row))

                    # Format for FullCalendar
                    events.append({
                        'id': event['event_id'],
                        'title': event['title'],
                        'start': event['start_date'].isoformat() if event['start_date'] else event[
                            'end_date'].isoformat(),
                        'end': event['end_date'].isoformat(),
                        'allDay': event['start_date'] is None or event['start_date'].date() == event['end_date'].date(),
                        'color': self._get_event_color(event['event_type']),
                        'extendedProps': {
                            'type': event['event_type'],
                            'description': event['description'],
                            'project_id': event['project_id'],
                            'project_title': event['project_title'],
                            'task_id': event['task_id'],
                            'task_title': event['task_title'],
                            'is_participant': event['is_participant']
                        }
                    })

                return JsonResponse(events, safe=False)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    def _get_event_color(self, event_type):
        """Get color for event type"""
        colors = {
            'Deadline': '#dc3545',  # Red
            'Meeting': '#007bff',  # Blue
            'Event': '#28a745'  # Green
        }
        return colors.get(event_type, '#6c757d')  # Gray default


class GetProjectMembersAPI(View):

    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def get(self, request, project_id):
        """Get project members as JSON (for AJAX dropdown)"""
        try:
            members = get_project_members(project_id)

            members_data = []
            for member in members:
                members_data.append({
                    'user_id': member[0],
                    'username': member[1],
                    'email': member[2],
                    'role': member[3]
                })

            return JsonResponse({'members': members_data})

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)


# ========== FUNCTION-BASED VIEWS (for backward compatibility) ==========

@login_required
def get_calendar(request):
    """Legacy function-based view (redirects to class-based view)"""
    view = GetCalendar()
    return view.get(request)

