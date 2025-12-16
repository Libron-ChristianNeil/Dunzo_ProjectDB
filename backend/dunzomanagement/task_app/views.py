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
                # 3. Fetch results
                tasks = dictfetchall(cursor)
                print(f"DEBUG TaskView.get: fetched {len(tasks)} tasks via stored proc")

            # Patch: Explicitly fetch tags for these tasks via ORM
            # This fixes the issue where stored procedure might not return the tags correctly
            debug_info = {'tasks_fetched': len(tasks) if tasks else 0, 'task_ids': [], 'tags_injected_count': 0}
            if tasks:
                try:
                    task_ids = [t.get('task_id') for t in tasks if t.get('task_id')]
                    debug_info['task_ids'] = task_ids
                    if task_ids:
                        # Fetch all tasks with tags in one query
                        tasks_with_tags = Task.objects.filter(pk__in=task_ids).prefetch_related('tags')
                        task_map = {t.pk: t for t in tasks_with_tags}
                        
                        # Inject tags into the dictionary results
                        for task_dict in tasks:
                            tid = task_dict.get('task_id')
                            if tid and tid in task_map:
                                task_obj = task_map[tid]
                                tags_list = [
                                    {
                                        'id': t.tag_id,
                                        'tag_id': t.tag_id,
                                        'name': t.name,
                                        'color': t.hex_color,
                                        'hex_color': t.hex_color
                                    }
                                    for t in task_obj.tags.all()
                                ]
                                task_dict['tags'] = tags_list
                                if tags_list:
                                    debug_info['tags_injected_count'] += 1
                except Exception as tag_error:
                    debug_info['error'] = str(tag_error)

            return JsonResponse({'success': True, 'data': tasks, 'debug': debug_info}, safe=False)

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

            # Patch: Explicitly fetch tags via ORM to ensure they are returned correctly
            # This fixes the issue where stored procedure might not return the latest assigned tags
            try:
                task_obj = Task.objects.prefetch_related('tags').get(task_id=task_id)
                tags_list = [
                    {
                        'id': t.tag_id,
                        'tag_id': t.tag_id,
                        'name': t.name,
                        'color': t.hex_color,
                        'hex_color': t.hex_color
                    }
                    for t in task_obj.tags.all()
                ]
                result[0]['tags'] = tags_list
            except Exception as tag_error:
                print(f"Error fetching tags via ORM: {tag_error}")

            return JsonResponse({'success': True, 'data': result[0]}, safe=False)

        except Exception as e:
            print(f"Get Task Details Error: {e}")
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
            
            print(f"DEBUG update_task: tag_ids={tag_ids} (type={type(tag_ids)})")

            if not all([task_id, title, status, due_date]):
                return JsonResponse({'success': False, 'error': 'Missing required fields: task_id, title, status, or due_date'}, status=400)

            with connection.cursor() as cursor:
                cursor.callproc('update_task', [task_id, user_id, title, description, status, due_date, tag_ids])

            # Explicitly update tags using Django ORM to ensure persistence
            # This covers cases where the stored procedure might not handle the list/array correctly
            tag_debug = {'tag_ids_received': tag_ids, 'orm_result': None}
            if tag_ids is not None:
                try:
                    task = Task.objects.get(pk=task_id)
                    task.tags.set(tag_ids)
                    tag_debug['orm_result'] = 'SUCCESS'
                except Exception as tag_error:
                    tag_debug['orm_result'] = f'FAILED: {str(tag_error)}'

            return JsonResponse({'success': True, 'message': 'Task updated successfully', 'debug': tag_debug}, status=200)

        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)


@method_decorator(csrf_exempt, name='dispatch')
class AssignmentView(View):
    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
        return super().dispatch(request, *args, **kwargs)

    def get(self, request):
        """Fetch all assignees for a task"""
        try:
            task_id = request.GET.get('task_id')
            
            if not task_id:
                return JsonResponse({'success': False, 'error': 'task_id is required'}, status=400)
            
            # Query assignments for this task
            assignments = Assignment.objects.filter(task_id=task_id).select_related('user')
            
            assignees = [
                {
                    'user_id': a.user.pk,
                    'username': a.user.username,
                    'name': f"{a.user.first_name or ''} {a.user.last_name or ''}".strip() or a.user.username,
                    'role': a.role,
                    'assigned_at': a.assigned_at.isoformat() if a.assigned_at else None
                }
                for a in assignments
            ]
            
            return JsonResponse({'success': True, 'assignees': assignees})
            
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)

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

    def get(self, request):
        """Fetch all comments for a task"""
        try:
            task_id = request.GET.get('task_id')
            
            if not task_id:
                return JsonResponse({'success': False, 'error': 'task_id is required'}, status=400)
            
            # Query comments for this task
            comments = Comment.objects.filter(task_id=task_id).select_related('user').order_by('created_at')
            
            comment_list = [
                {
                    'comment_id': c.comment_id,
                    'content': c.content,
                    'parent_id': c.parent_id,
                    'user_id': c.user.pk,
                    'username': c.user.username,
                    'created_at': c.created_at.isoformat() if c.created_at else None
                }
                for c in comments
            ]
            
            return JsonResponse({'success': True, 'comments': comment_list})
            
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)

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