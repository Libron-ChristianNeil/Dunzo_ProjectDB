import json
from django.utils import timezone
from django.db import connection
from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views import View
from django.apps import apps

from .models import *
User = apps.get_model(app_label='user_app', model_name='User')
Project = apps.get_model(app_label='project_app', model_name='Project')
Tag = apps.get_model(app_label='project_app', model_name='Tag')


def decode_body(request):
    try:
        return json.loads(request.body.decode('utf-8'))
    except json.JSONDecodeError:
        return {}
def dictfetchall(cursor):
    columns = [col[0] for col in cursor.description]
    return [
        dict(zip(columns, row))
        for row in cursor.fetchall()
    ]

@method_decorator(csrf_exempt, name='dispatch')
class TaskView(View):
    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
        return super().dispatch(request, *args, **kwargs)
    # get tasks for a project with filters so use switch cases
    def get(self, request):
        try:
            # Extract parameters from Query String
            project_id = request.GET.get('project_id')
            status_filter = request.GET.get('status')  # Optional
            filter_type = request.GET.get('filter_type', 'All')  # Default to 'All'

            user_id = request.user.user_id

            if not project_id:
                return JsonResponse({'success': False, 'error': 'project_id is required'}, status=400)

            # Call the Stored Procedure
            with connection.cursor() as cursor:
                cursor.callproc('get_user_tasks', [
                    user_id,
                    project_id,
                    status_filter,
                    filter_type
                ])
                # Fetch results
                tasks = dictfetchall(cursor)

            return JsonResponse({'success': True, 'data': tasks}, safe=False)

        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)

    # create new task, upon creation it should be able to assign 0 or more members(users in the project) to the task
    # calendarevent will only have its end_date set to the task's due date and leave start_date null, it will also only have the task_id as reference
    def post(self, request):
        try:
            data = decode_body(request)
            user_id = request.user.user_id

            # Extract Fields
            project_id = data.get('project_id')
            title = data.get('title')
            description = data.get('description', '')
            due_date = data.get('due_date')  # ISO format 'YYYY-MM-DD HH:MM:SS'
            assignee_ids = data.get('assignee_ids', [])  # List of User IDs
            tag_ids = data.get('tag_ids', [])  # List of Tag IDs

            # Validation
            if not all([project_id, title, due_date]):
                return JsonResponse({
                    'success': False,
                    'error': 'Missing required fields: project_id, title, or due_date'
                }, status=400)

            # Call Stored Procedure
            with connection.cursor() as cursor:
                cursor.callproc('create_task', [
                    project_id,
                    user_id,
                    title,
                    description,
                    due_date,
                    assignee_ids,
                    tag_ids
                ])

                # Fetch the returned new_task_id
                result = cursor.fetchone()
                new_task_id = result[0] if result else None

            return JsonResponse({
                'success': True,
                'message': 'Task created successfully',
                'task_id': new_task_id
            }, status=201)

        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)

    # delete task
    def delete(self, request):
        try:
            data = decode_body(request)
            user_id = request.user.user_id

            task_id = data.get('task_id')

            if not task_id:
                return JsonResponse({'success': False, 'error': 'task_id is required'}, status=400)

            with connection.cursor() as cursor:
                cursor.callproc('delete_task', [
                    task_id,
                    user_id
                ])

            return JsonResponse({'success': True, 'message': 'Task deleted successfully'}, status=200)

        except Exception as e:
            # If user is not Leader/Manager, this returns { success: False, error: "Access Denied..." }
            return JsonResponse({'success': False, 'error': str(e)}, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class TaskDetailView(View):
    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
        return super().dispatch(request, *args, **kwargs)
    # get task details, comments, and the assigned users
    def get(self, request):
        try:
            # 1. Extract task_id from Query Parameters
            task_id = request.GET.get('task_id')
            user_id = request.user.user_id

            if not task_id:
                return JsonResponse({'success': False, 'error': 'task_id is required'}, status=400)

            # 2. Call Stored Procedure
            with connection.cursor() as cursor:
                cursor.callproc('get_task_details', [
                    task_id,
                    user_id
                ])

                # 3. Fetch Result (It returns 1 row with nested JSONs)
                result = dictfetchall(cursor)

            if not result:
                # Should have been caught by SP exception, but double check
                return JsonResponse({'success': False, 'error': 'Task not found'}, status=404)

            # Return the single object, not a list of 1 object
            return JsonResponse({'success': True, 'data': result[0]}, safe=False)

        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)
    # edit task details
    def put(self, request):
        try:
            data = decode_body(request)
            user_id = request.user.user_id

            # Extract Fields
            task_id = data.get('task_id')
            title = data.get('title')
            description = data.get('description', '')
            status = data.get('status')  # e.g., 'In Progress'
            due_date = data.get('due_date')  # ISO format
            tag_ids = data.get('tag_ids')  # List [1, 2] or None

            # Validation
            if not all([task_id, title, status, due_date]):
                return JsonResponse({
                    'success': False,
                    'error': 'Missing required fields: task_id, title, status, or due_date'
                }, status=400)

            # Call Stored Procedure
            with connection.cursor() as cursor:
                cursor.callproc('update_task', [
                    task_id,
                    user_id,
                    title,
                    description,
                    status,
                    due_date,
                    tag_ids  # Can be list or None
                ])
                # Returns VOID, so no fetchone needed

            return JsonResponse({'success': True, 'message': 'Task updated successfully'}, status=200)

        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class AssignmentView(View):
    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
        return super().dispatch(request, *args, **kwargs)
    # assign user to task
    def post(self, request):
        try:
            data = decode_body(request)
            requester_id = request.user.user_id

            # Extract Fields
            task_id = data.get('task_id')
            # If assigning self, user_id might not be sent, defaulting to requester
            target_user_id = data.get('user_id', requester_id)
            role = data.get('role', 'Contributor')

            if not task_id:
                return JsonResponse({'success': False, 'error': 'task_id is required'}, status=400)

            # Call Stored Procedure
            with connection.cursor() as cursor:
                cursor.callproc('assign_task', [
                    task_id,
                    requester_id,
                    target_user_id,
                    role
                ])
                # Returns VOID

            return JsonResponse({'success': True, 'message': 'User assigned successfully'}, status=201)

        except Exception as e:
            # Captures "Access Denied", "Already assigned", etc.
            return JsonResponse({'success': False, 'error': str(e)}, status=500)
    # unassign user from task
    def delete(self, request):
        try:
            data = decode_body(request)
            requester_id = request.user.user_id

            task_id = data.get('task_id')
            # If target_user_id not provided, assume self-unassign
            target_user_id = data.get('user_id', requester_id)

            if not task_id:
                return JsonResponse({'success': False, 'error': 'task_id is required'}, status=400)

            with connection.cursor() as cursor:
                cursor.callproc('unassign_task', [
                    task_id,
                    requester_id,
                    target_user_id
                ])
                # Returns VOID

            return JsonResponse({'success': True, 'message': 'User unassigned successfully'}, status=200)

        except Exception as e:
            error_message = str(e)
            # You can handle the specific "Owner" error in frontend by checking this string
            return JsonResponse({'success': False, 'error': error_message}, status=500)
    # change user role in task
    def put(self, request):
        try:
            data = decode_body(request)
            requester_id = request.user.user_id

            # 1. Extract Fields
            task_id = data.get('task_id')
            target_user_id = data.get('user_id')
            new_role = data.get('role')

            # 2. Validation
            if not all([task_id, target_user_id, new_role]):
                return JsonResponse({'success': False, 'error': 'Missing required fields'}, status=400)

            # 3. Call Stored Procedure
            with connection.cursor() as cursor:
                cursor.callproc('update_assignment_role', [
                    task_id,
                    requester_id,
                    target_user_id,
                    new_role
                ])
                # Returns VOID

            return JsonResponse({'success': True, 'message': 'Role updated successfully'}, status=200)

        except Exception as e:
            # Will catch "Access Denied", "Task not found", etc.
            return JsonResponse({'success': False, 'error': str(e)}, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class CommentView(View):
    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
        return super().dispatch(request, *args, **kwargs)
    # add comment to task or reply to comment
    def post(self, request):
        try:
            data = decode_body(request)
            user_id = request.user.user_id

            task_id = data.get('task_id')
            content = data.get('content')
            parent_id = data.get('parent_id')  # Optional (None if root comment)

            if not all([task_id, content]):
                return JsonResponse({'success': False, 'error': 'task_id and content are required'}, status=400)

            with connection.cursor() as cursor:
                cursor.callproc('post_comment', [
                    task_id,
                    user_id,
                    content,
                    parent_id
                ])
                result = cursor.fetchone()
                new_comment_id = result[0] if result else None

            return JsonResponse({'success': True, 'message': 'Comment posted', 'comment_id': new_comment_id},
                                status=201)

        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)
    # delete comment
    def delete(self, request):
        try:
            data = decode_body(request)
            comment_id = data.get('comment_id')
            user_id = request.user.user_id

            if not comment_id:
                return JsonResponse({'success': False, 'error': 'comment_id is required'}, status=400)

            try:
                comment = Comment.objects.get(comment_id=comment_id)
            except Comment.DoesNotExist:
                return JsonResponse({'success': False, 'error': 'Comment not found'}, status=404)

            # Security: Only the author can delete their comment
            # (Unless you want Managers to delete any comment, add that logic here)
            if comment.user_id != user_id:
                return JsonResponse({'success': False, 'error': 'Access Denied'}, status=403)

            comment.delete()

            return JsonResponse({'success': True, 'message': 'Comment deleted successfully'}, status=200)

        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)
    # edit comment
    def put(self, request):
        try:
            data = decode_body(request)
            comment_id = data.get('comment_id')
            new_content = data.get('content')
            user_id = request.user.user_id

            if not all([comment_id, new_content]):
                return JsonResponse({'success': False, 'error': 'comment_id and content are required'}, status=400)

            try:
                comment = Comment.objects.get(comment_id=comment_id)
            except Comment.DoesNotExist:
                return JsonResponse({'success': False, 'error': 'Comment not found'}, status=404)

            # Security: Only author can edit
            if comment.user_id != user_id:
                return JsonResponse({'success': False, 'error': 'Access Denied'}, status=403)

            # Update fields
            comment.content = new_content
            comment.updated_at = timezone.now() # Sets current time, making it non-null
            comment.save()

            return JsonResponse({'success': True, 'message': 'Comment updated successfully'}, status=200)

        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)