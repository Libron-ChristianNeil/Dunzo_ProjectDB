import json
from django.utils import timezone
from django.db import connection
from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views import View

from .models import *

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

    # get tasks for a project with filters
    def get(self, request):
        try:
            # 1. Extract parameters from Query String
            # Frontend sends project ID as the first argument
            project_id = request.GET.get('project_id')
            
            # Frontend sends 'all' or specific status. 
            # If frontend sends 'null' string or empty, we treat as None.
            status_filter = request.GET.get('status')
            if status_filter == 'null' or status_filter == '':
                status_filter = None
            
            # Frontend sends 'All', 'Assigned', or 'Unassigned'
            filter_type = request.GET.get('filter_type', 'All') 
            
            user_id = request.user.user_id

            # Validation: Task.jsx ensures selectedProject !== 'all' before calling, 
            # so project_id should always be present.
            if not project_id:
                return JsonResponse({'success': False, 'error': 'project_id is required'}, status=400)

            # 2. Call Stored Procedure
            with connection.cursor() as cursor:
                cursor.callproc('get_user_tasks', [
                    user_id, 
                    project_id, 
                    status_filter, 
                    filter_type
                ])
                # 3. Fetch results
                tasks = dictfetchall(cursor)

            return JsonResponse({'success': True, 'data': tasks}, safe=False)

        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)

    def post(self, request):
        try:
            data = decode_body(request)
            user_id = request.user.user_id

            project_id = data.get('project_id')
            title = data.get('title')
            description = data.get('description', '')
            due_date = data.get('due_date')
            assignee_ids = data.get('assignee_ids', [])
            tag_ids = data.get('tag_ids', [])

            if not all([project_id, title, due_date]):
                return JsonResponse({'success': False, 'error': 'Missing required fields: project_id, title, or due_date'}, status=400)

            with connection.cursor() as cursor:
                cursor.callproc('create_task', [project_id, user_id, title, description, due_date, assignee_ids, tag_ids])
                result = cursor.fetchone()
                new_task_id = result[0] if result else None

            return JsonResponse({'success': True, 'message': 'Task created successfully', 'task_id': new_task_id}, status=201)

        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)

    def delete(self, request):
        try:
            data = decode_body(request)
            user_id = request.user.user_id
            task_id = data.get('task_id')

            if not task_id:
                return JsonResponse({'success': False, 'error': 'task_id is required'}, status=400)

            with connection.cursor() as cursor:
                cursor.callproc('delete_task', [task_id, user_id])

            return JsonResponse({'success': True, 'message': 'Task deleted successfully'}, status=200)

        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)


@method_decorator(csrf_exempt, name='dispatch')
class TaskDetailView(View):
    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
        return super().dispatch(request, *args, **kwargs)

    def get(self, request):
        try:
            task_id = request.GET.get('task_id')
            user_id = request.user.user_id

            if not task_id:
                return JsonResponse({'success': False, 'error': 'task_id is required'}, status=400)

            with connection.cursor() as cursor:
                cursor.callproc('get_task_details', [task_id, user_id])
                result = dictfetchall(cursor)

            if not result:
                return JsonResponse({'success': False, 'error': 'Task not found'}, status=404)

            return JsonResponse({'success': True, 'data': result[0]}, safe=False)

        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)

    def put(self, request):
        try:
            data = decode_body(request)
            user_id = request.user.user_id

            task_id = data.get('task_id')
            title = data.get('title')
            description = data.get('description', '')
            status = data.get('status')
            due_date = data.get('due_date')
            tag_ids = data.get('tag_ids')

            if not all([task_id, title, status, due_date]):
                return JsonResponse({'success': False, 'error': 'Missing required fields: task_id, title, status, or due_date'}, status=400)

            with connection.cursor() as cursor:
                cursor.callproc('update_task', [task_id, user_id, title, description, status, due_date, tag_ids])

            return JsonResponse({'success': True, 'message': 'Task updated successfully'}, status=200)

        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)


@method_decorator(csrf_exempt, name='dispatch')
class AssignmentView(View):
    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
        return super().dispatch(request, *args, **kwargs)

    def post(self, request):
        try:
            data = decode_body(request)
            requester_id = request.user.user_id

            task_id = data.get('task_id')
            target_user_id = data.get('user_id', requester_id)
            role = data.get('role', 'Contributor')

            if not task_id:
                return JsonResponse({'success': False, 'error': 'task_id is required'}, status=400)

            with connection.cursor() as cursor:
                cursor.callproc('assign_task', [task_id, requester_id, target_user_id, role])

            return JsonResponse({'success': True, 'message': 'User assigned successfully'}, status=201)

        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)

    def delete(self, request):
        try:
            data = decode_body(request)
            requester_id = request.user.user_id

            task_id = data.get('task_id')
            target_user_id = data.get('user_id', requester_id)

            if not task_id:
                return JsonResponse({'success': False, 'error': 'task_id is required'}, status=400)

            with connection.cursor() as cursor:
                cursor.callproc('unassign_task', [task_id, requester_id, target_user_id])

            return JsonResponse({'success': True, 'message': 'User unassigned successfully'}, status=200)

        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)

    def put(self, request):
        try:
            data = decode_body(request)
            requester_id = request.user.user_id

            task_id = data.get('task_id')
            target_user_id = data.get('user_id')
            new_role = data.get('role')

            if not all([task_id, target_user_id, new_role]):
                return JsonResponse({'success': False, 'error': 'Missing required fields'}, status=400)

            with connection.cursor() as cursor:
                cursor.callproc('update_assignment_role', [task_id, requester_id, target_user_id, new_role])

            return JsonResponse({'success': True, 'message': 'Role updated successfully'}, status=200)

        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)


@method_decorator(csrf_exempt, name='dispatch')
class CommentView(View):
    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
        return super().dispatch(request, *args, **kwargs)

    def post(self, request):
        try:
            data = decode_body(request)
            user_id = request.user.user_id

            task_id = data.get('task_id')
            content = data.get('content')
            parent_id = data.get('parent_id')

            if not all([task_id, content]):
                return JsonResponse({'success': False, 'error': 'task_id and content are required'}, status=400)

            with connection.cursor() as cursor:
                cursor.callproc('post_comment', [task_id, user_id, content, parent_id])
                result = cursor.fetchone()
                new_comment_id = result[0] if result else None

            return JsonResponse({'success': True, 'message': 'Comment posted', 'comment_id': new_comment_id}, status=201)

        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)

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

            if comment.user_id != user_id:
                return JsonResponse({'success': False, 'error': 'Access Denied'}, status=403)

            comment.delete()
            return JsonResponse({'success': True, 'message': 'Comment deleted successfully'}, status=200)

        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)

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

            if comment.user_id != user_id:
                return JsonResponse({'success': False, 'error': 'Access Denied'}, status=403)

            comment.content = new_content
            comment.updated_at = timezone.now()
            comment.save()

            return JsonResponse({'success': True, 'message': 'Comment updated successfully'}, status=200)

        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)