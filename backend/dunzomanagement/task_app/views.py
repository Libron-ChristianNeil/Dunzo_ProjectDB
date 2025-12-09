
from django.shortcuts import render
from django.views import View

# from django.shortcuts import render, get_object_or_404, redirect
# from django.contrib.auth.decorators import login_required
# from django.http import HttpResponseForbidden
# from .models import Task, Assignment, Comment
# from project_app.models import Project
# from user_app.models import User
#
# task = 'task_app/task_app.html'
# details = 'task_app/task_details.html'
#
# create = 'task_app/create_task.html'
# edit_task = 'task_app/edit_task.html'
# delete_task = 'task_app/delete_task.html'
#
# manage_users = 'task_app/manage_users.html'
# add_self = 'task_app/assign_self.html'
#
# comment = 'task_app/add_comment.html'
# edit_comment = 'task_app/edit_comment.html'
# delete_comment = 'task_app/delete_comment.html'
#
# manage_tags = 'task_app/manage_tags.html'
#
# # @login_required
# def get_tasks(request):
#     tasks = Task.objects.filter(users=request.user.pk)
#
#     return render(request, task, {"tasks": tasks})
#
# # @login_required
# def get_tasks_by_project(request, project_id):
#     tasks = Task.objects.filter(project_id=project_id)
#
#     return render(request, task, {"tasks": tasks})
#
# # @login_required
# def get_tasks_by_status(request, status):
#     tasks = Task.objects.filter(status=status)
#
#     return render(request, task, {"tasks": tasks})
#
# # @login_required
# def get_details(request, task_id):
#     obj_task = get_object_or_404(Task, pk=task_id)
#     assignments = Assignment.objects.filter(task=obj_task)
#     comments = Comment.objects.filter(task=obj_task)
#
#     return render(request, details, {
#         "task": obj_task,
#         "assignments": assignments,
#         "comments": comments,
#     })
#
#

from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseForbidden, JsonResponse, HttpResponse
from django.db import connection
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.views import View
from django.utils.decorators import method_decorator
import json
from datetime import datetime

from .models import Task, Assignment, Comment
from project_app.models import Project, Tag
from user_app.models import User

# Template paths (kept as module-level variables for consistency)
TASK_TEMPLATE = 'task_app/task_app.html'
DETAILS_TEMPLATE = 'task_app/task_details.html'
CREATE_TEMPLATE = 'task_app/create_task.html'
EDIT_TASK_TEMPLATE = 'task_app/edit_task.html'
DELETE_TASK_TEMPLATE = 'task_app/delete_task.html'
MANAGE_USERS_TEMPLATE = 'task_app/manage_users.html'
ADD_SELF_TEMPLATE = 'task_app/assign_self.html'
COMMENT_TEMPLATE = 'task_app/add_comment.html'
EDIT_COMMENT_TEMPLATE = 'task_app/edit_comment.html'
DELETE_COMMENT_TEMPLATE = 'task_app/delete_comment.html'
MANAGE_TAGS_TEMPLATE = 'task_app/manage_tags.html'
STATISTICS_TEMPLATE = 'task_app/statistics.html'


# ========== HELPER DECORATOR ==========
def login_required_cbv(view_func):
    """Decorator for class-based views to require login"""
    return method_decorator(login_required, name='dispatch')(view_func)


# ========== CLASS-BASED VIEWS ==========

class GetTasks(View):
    template = TASK_TEMPLATE

    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def get(self, request):
        tasks = Task.objects.filter(users=request.user.pk)
        return render(request, self.template, {"tasks": tasks})


class GetTasksByProject(View):
    template = TASK_TEMPLATE

    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def get(self, request, project_id):
        tasks = Task.objects.filter(project_id=project_id)
        return render(request, self.template, {"tasks": tasks})


class GetTasksByStatus(View):
    template = TASK_TEMPLATE

    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def get(self, request, status):
        tasks = Task.objects.filter(status=status)
        return render(request, self.template, {"tasks": tasks})


class GetTaskDetails(View):
    template = DETAILS_TEMPLATE

    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def get(self, request, task_id):
        obj_task = get_object_or_404(Task, pk=task_id)
        assignments = Assignment.objects.filter(task=obj_task)
        comments = Comment.objects.filter(task=obj_task)

        return render(request, self.template, {
            "task": obj_task,
            "assignments": assignments,
            "comments": comments,
        })


# ========== STORED PROCEDURE CLASS-BASED VIEWS ==========

class CreateTaskSP(View):
    template = CREATE_TEMPLATE

    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def get(self, request):
        # Get available projects for the current user
        user_projects = Project.objects.filter(users=request.user)
        tags = Tag.objects.all()
        return render(request, self.template, {
            'projects': user_projects,
            'tags': tags,
            'status_choices': Task.STATUS_CHOICES,
            'role_choices': Assignment.ROLE_CHOICES
        })

    def post(self, request):
        try:
            # Get form data
            project_id = request.POST.get('project_id')
            title = request.POST.get('title')
            description = request.POST.get('description')
            status = request.POST.get('status', 'To Do')
            due_date_str = request.POST.get('due_date')

            if not all([project_id, title, description, due_date_str]):
                user_projects = Project.objects.filter(users=request.user)
                tags = Tag.objects.all()
                return render(request, self.template, {
                    'projects': user_projects,
                    'tags': tags,
                    'error': 'All required fields must be filled',
                    'form_data': request.POST
                })

            # Parse due date
            try:
                if 'T' in due_date_str:
                    due_date = datetime.strptime(due_date_str, '%Y-%m-%dT%H:%M')
                else:
                    due_date = datetime.strptime(due_date_str, '%Y-%m-%d %H:%M:%S')
            except ValueError:
                due_date = datetime.strptime(due_date_str, '%Y-%m-%d')

            # Get user assignments from form
            user_assignments = []

            # Check if creator wants to assign themselves
            if request.POST.get('assign_self') == 'on':
                user_assignments.append({
                    "user_id": request.user.id,
                    "role": request.POST.get('self_role', 'Owner')
                })

            # Check for additional assigned users
            assigned_users = request.POST.getlist('assigned_users[]')
            assigned_roles = request.POST.getlist('assigned_roles[]')

            for i, user_id in enumerate(assigned_users):
                if user_id and i < len(assigned_roles):
                    try:
                        user_assignments.append({
                            "user_id": int(user_id),
                            "role": assigned_roles[i]
                        })
                    except ValueError:
                        continue

            # Get tag IDs
            tag_ids = request.POST.getlist('tags[]')
            tag_ids = [int(tag_id) for tag_id in tag_ids if tag_id]

            # Call the PostgreSQL function
            with connection.cursor() as cursor:
                user_assignments_json = json.dumps(user_assignments) if user_assignments else None
                tag_ids_json = json.dumps(tag_ids) if tag_ids else None

                cursor.execute("""
                    SELECT * FROM create_task_with_deadline(
                        %s, %s, %s, %s, %s, %s, %s::jsonb, %s::jsonb
                    )
                """, [
                    int(project_id),
                    title,
                    description,
                    status,
                    due_date,
                    request.user.id,
                    user_assignments_json,
                    tag_ids_json
                ])

                results = cursor.fetchall()

                if results:
                    task_id, message = results[0]

                    if task_id > 0:
                        return redirect('task_app:get_details', task_id=task_id)
                    else:
                        user_projects = Project.objects.filter(users=request.user)
                        tags = Tag.objects.all()
                        return render(request, self.template, {
                            'projects': user_projects,
                            'tags': tags,
                            'error': message,
                            'form_data': request.POST
                        })
                else:
                    user_projects = Project.objects.filter(users=request.user)
                    tags = Tag.objects.all()
                    return render(request, self.template, {
                        'projects': user_projects,
                        'tags': tags,
                        'error': 'No results returned from database',
                        'form_data': request.POST
                    })

        except Exception as e:
            user_projects = Project.objects.filter(users=request.user)
            tags = Tag.objects.all()
            return render(request, self.template, {
                'projects': user_projects,
                'tags': tags,
                'error': f"Error: {str(e)}",
                'form_data': request.POST
            })


class UpdateTaskStatusSP(View):

    @method_decorator(login_required)
    @method_decorator(require_http_methods(["POST"]))
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def post(self, request, task_id):
        try:
            if request.content_type == 'application/json':
                data = json.loads(request.body)
                new_status = data.get('status')
            else:
                new_status = request.POST.get('status')

            if not new_status:
                return JsonResponse({'success': False, 'message': 'Status is required'})

            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT * FROM update_task_status(%s, %s, %s)
                """, [task_id, new_status, request.user.id])

                results = cursor.fetchall()

                if results:
                    success, message = results[0]

                    if success:
                        try:
                            task = Task.objects.get(task_id=task_id)
                            task.status = new_status
                            task.save()
                        except Task.DoesNotExist:
                            pass

                        return JsonResponse({
                            'success': True,
                            'message': message,
                            'new_status': new_status
                        })
                    else:
                        return JsonResponse({'success': False, 'message': message})
                else:
                    return JsonResponse({'success': False, 'message': 'No results returned from database'})

        except Task.DoesNotExist:
            return JsonResponse({'success': False, 'message': 'Task not found'})
        except Exception as e:
            return JsonResponse({'success': False, 'message': f'Error: {str(e)}'})


class AddCommentSP(View):
    template = COMMENT_TEMPLATE

    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def get(self, request, task_id):
        task = get_object_or_404(Task, pk=task_id)
        is_assigned = Assignment.objects.filter(
            task_id=task_id,
            user=request.user
        ).exists()

        if not is_assigned:
            return HttpResponseForbidden("You must be assigned to this task to comment")

        return render(request, self.template, {'task': task})

    def post(self, request, task_id):
        try:
            content = request.POST.get('content')
            parent_comment_id = request.POST.get('parent_comment_id')

            if not content:
                if request.content_type == 'application/json':
                    return JsonResponse({'success': False, 'message': 'Comment content is required'})
                else:
                    task = get_object_or_404(Task, pk=task_id)
                    return render(request, self.template, {
                        'task': task,
                        'error': 'Comment content is required'
                    })

            if parent_comment_id:
                try:
                    parent_comment_id = int(parent_comment_id)
                except ValueError:
                    parent_comment_id = None
            else:
                parent_comment_id = None

            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT * FROM add_comment_with_notification(%s, %s, %s, %s)
                """, [task_id, request.user.id, content, parent_comment_id])

                results = cursor.fetchall()

                if results:
                    new_comment_id, message = results[0]

                    if new_comment_id > 0:
                        if request.content_type == 'application/json':
                            comment = Comment.objects.get(comment_id=new_comment_id)
                            comment_data = {
                                'comment_id': comment.comment_id,
                                'content': comment.content,
                                'created_at': comment.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                                'user_id': comment.user_id,
                                'user_name': comment.user.username if comment.user else 'Unknown',
                                'parent_id': comment.parent_id
                            }

                            return JsonResponse({
                                'success': True,
                                'message': message,
                                'comment': comment_data
                            })
                        else:
                            return redirect('task_app:get_details', task_id=task_id)
                    else:
                        if request.content_type == 'application/json':
                            return JsonResponse({'success': False, 'message': message})
                        else:
                            task = get_object_or_404(Task, pk=task_id)
                            return render(request, self.template, {
                                'task': task,
                                'error': message
                            })
                else:
                    if request.content_type == 'application/json':
                        return JsonResponse({'success': False, 'message': 'No results returned from database'})
                    else:
                        task = get_object_or_404(Task, pk=task_id)
                        return render(request, self.template, {
                            'task': task,
                            'error': 'No results returned from database'
                        })

        except Exception as e:
            if request.content_type == 'application/json':
                return JsonResponse({'success': False, 'message': f'Error: {str(e)}'})
            else:
                task = get_object_or_404(Task, pk=task_id)
                return render(request, self.template, {
                    'task': task,
                    'error': f'Error: {str(e)}'
                })


class ManageTaskUsersSP(View):
    template = MANAGE_USERS_TEMPLATE

    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def get(self, request, task_id):
        task = get_object_or_404(Task, pk=task_id)
        current_assignments = Assignment.objects.filter(task=task)
        project_users = User.objects.filter(project__project_id=task.project_id).distinct()
        is_owner = Assignment.objects.filter(
            task_id=task_id,
            user=request.user,
            role='Owner'
        ).exists()

        if not is_owner:
            return HttpResponseForbidden("Only the task owner can manage user assignments")

        return render(request, self.template, {
            'task': task,
            'current_assignments': current_assignments,
            'project_users': project_users,
            'role_choices': Assignment.ROLE_CHOICES,
            'is_owner': is_owner
        })

    def post(self, request, task_id):
        try:
            if request.content_type == 'application/json':
                data = json.loads(request.body)
                new_assignments = data.get('assignments', [])
            else:
                user_ids = request.POST.getlist('user_ids[]')
                roles = request.POST.getlist('roles[]')

                new_assignments = []
                for i, user_id in enumerate(user_ids):
                    if user_id and i < len(roles):
                        try:
                            new_assignments.append({
                                "user_id": int(user_id),
                                "role": roles[i]
                            })
                        except ValueError:
                            continue

            if not new_assignments:
                if request.content_type == 'application/json':
                    return JsonResponse({'success': False, 'message': 'No assignments provided'})
                else:
                    task = get_object_or_404(Task, pk=task_id)
                    return render(request, self.template, {
                        'task': task,
                        'error': 'No assignments provided'
                    })

            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT * FROM reassign_users_to_task(%s, %s::jsonb, %s)
                """, [
                    task_id,
                    json.dumps(new_assignments),
                    request.user.id
                ])

                results = cursor.fetchall()

                if results:
                    success, message = results[0]

                    if success:
                        if request.content_type == 'application/json':
                            updated_assignments = Assignment.objects.filter(task_id=task_id)
                            assignments_data = []
                            for assignment in updated_assignments:
                                assignments_data.append({
                                    'user_id': assignment.user_id,
                                    'username': assignment.user.username,
                                    'role': assignment.role
                                })

                            return JsonResponse({
                                'success': True,
                                'message': message,
                                'assignments': assignments_data
                            })
                        else:
                            return redirect('task_app:get_details', task_id=task_id)
                    else:
                        if request.content_type == 'application/json':
                            return JsonResponse({'success': False, 'message': message})
                        else:
                            task = get_object_or_404(Task, pk=task_id)
                            project_users = User.objects.filter(project__project_id=task.project_id).distinct()
                            return render(request, self.template, {
                                'task': task,
                                'project_users': project_users,
                                'error': message
                            })
                else:
                    if request.content_type == 'application/json':
                        return JsonResponse({'success': False, 'message': 'No results returned from database'})
                    else:
                        task = get_object_or_404(Task, pk=task_id)
                        project_users = User.objects.filter(project__project_id=task.project_id).distinct()
                        return render(request, self.template, {
                            'task': task,
                            'project_users': project_users,
                            'error': 'No results returned from database'
                        })

        except Exception as e:
            if request.content_type == 'application/json':
                return JsonResponse({'success': False, 'message': f'Error: {str(e)}'})
            else:
                task = get_object_or_404(Task, pk=task_id)
                project_users = User.objects.filter(project__project_id=task.project_id).distinct()
                return render(request, self.template, {
                    'task': task,
                    'project_users': project_users,
                    'error': f'Error: {str(e)}'
                })


class DeleteTaskSP(View):
    template = DELETE_TASK_TEMPLATE

    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def get(self, request, task_id):
        task = get_object_or_404(Task, pk=task_id)
        is_owner = Assignment.objects.filter(
            task_id=task_id,
            user=request.user,
            role='Owner'
        ).exists()

        if not is_owner:
            return HttpResponseForbidden("Only the task owner can delete this task")

        return render(request, self.template, {'task': task})

    def post(self, request, task_id):
        try:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT * FROM delete_task_with_cleanup(%s, %s)
                """, [task_id, request.user.id])

                results = cursor.fetchall()

                if results:
                    success, message = results[0]

                    if success:
                        return redirect('task_app:get_tasks')
                    else:
                        task = get_object_or_404(Task, pk=task_id)
                        return render(request, self.template, {
                            'task': task,
                            'error': message
                        })
                else:
                    task = get_object_or_404(Task, pk=task_id)
                    return render(request, self.template, {
                        'task': task,
                        'error': 'No results returned from database'
                    })

        except Exception as e:
            task = get_object_or_404(Task, pk=task_id)
            return render(request, self.template, {
                'task': task,
                'error': f'Error: {str(e)}'
            })


#OPTIONAL KUNG MAKAYA RA

# class AssignSelfToTaskSP(View):
#     template = ADD_SELF_TEMPLATE
#
#     @method_decorator(login_required)
#     def dispatch(self, *args, **kwargs):
#         return super().dispatch(*args, **kwargs)
#
#     def get(self, request, task_id):
#         task = get_object_or_404(Task, pk=task_id)
#         already_assigned = Assignment.objects.filter(
#             task_id=task_id,
#             user=request.user
#         ).exists()
#
#         if already_assigned:
#             return render(request, self.template, {
#                 'task': task,
#                 'error': 'You are already assigned to this task'
#             })
#
#         is_in_project = User.objects.filter(
#             id=request.user.id,
#             project__project_id=task.project_id
#         ).exists()
#
#         if not is_in_project:
#             return HttpResponseForbidden("You must be a member of the project to assign yourself to tasks")
#
#         return render(request, self.template, {
#             'task': task,
#             'role_choices': [('Contributor', 'Contributor'), ('Reviewer', 'Reviewer')]
#         })
#
#     def post(self, request, task_id):
#         try:
#             role = request.POST.get('role', 'Contributor')
#             owner_exists = Assignment.objects.filter(
#                 task_id=task_id,
#                 role='Owner'
#             ).exists()
#
#             if role == 'Owner' and owner_exists:
#                 return render(request, self.template, {
#                     'task': get_object_or_404(Task, pk=task_id),
#                     'error': 'Task already has an Owner'
#                 })
#
#             current_assignments = Assignment.objects.filter(task_id=task_id)
#             current_assignments_data = []
#
#             for assignment in current_assignments:
#                 current_assignments_data.append({
#                     "user_id": assignment.user_id,
#                     "role": assignment.role
#                 })
#
#             all_assignments = current_assignments_data + [{
#                 "user_id": request.user.id,
#                 "role": role
#             }]
#
#             is_owner = Assignment.objects.filter(
#                 task_id=task_id,
#                 user=request.user,
#                 role='Owner'
#             ).exists()
#
#             if is_owner:
#                 with connection.cursor() as cursor:
#                     cursor.execute("""
#                         SELECT * FROM reassign_users_to_task(%s, %s::jsonb, %s)
#                     """, [
#                         task_id,
#                         json.dumps(all_assignments),
#                         request.user.id
#                     ])
#
#                     results = cursor.fetchall()
#
#                     if results:
#                         success, message = results[0]
#
#                         if success:
#                             return redirect('task_app:get_details', task_id=task_id)
#                         else:
#                             return render(request, self.template, {
#                                 'task': get_object_or_404(Task, pk=task_id),
#                                 'error': message
#                             })
#                     else:
#                         return render(request, self.template, {
#                             'task': get_object_or_404(Task, pk=task_id),
#                             'error': 'No results returned from database'
#                         })
#             else:
#                 if role == 'Owner' and owner_exists:
#                     return render(request, self.template, {
#                         'task': get_object_or_404(Task, pk=task_id),
#                         'error': 'Task already has an Owner'
#                     })
#
#                 Assignment.objects.create(
#                     task_id=task_id,
#                     user=request.user,
#                     role=role
#                 )
#
#                 from django.utils import timezone
#                 from user_app.models import Notification
#                 Notification.objects.create(
#                     user=request.user,
#                     title='Task Assignment',
#                     message=f'You assigned yourself as {role} to task:',
#                     is_read=False,
#                     created_at=timezone.now()
#                 )
#
#                 return redirect('task_app:get_details', task_id=task_id)
#
#         except Exception as e:
#             return render(request, self.template, {
#                 'task': get_object_or_404(Task, pk=task_id),
#                 'error': f'Error: {str(e)}'
#             })

