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


@method_decorator(csrf_exempt, name='dispatch')
class ProjectView(View):

    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
        return super().dispatch(request, *args, **kwargs)

    def get(self, request):
        user_id = request.user.pk
        filter_type = request.GET.get('filter', 'Active')

        # filters
        valid_filters = ['Active', 'Archived', 'Complete', 'All', 'Leader']
        if filter_type not in valid_filters:
            filter_type = 'Active'

        try:
            with connection.cursor() as cursor:
                # stored procedure
                cursor.callproc("get_user_projects", [user_id, filter_type])
                projects_data = cursor.fetchone()[0]
                return JsonResponse({'success': True, 'projects': projects_data})
        except Exception as e:
            return JsonResponse({'success': False, 'error': 'Internal Server Error'}, status=500)

    def post(self, request):
        data = decode_body(request)

        # kuha data from request
        user_id = request.user.pk
        title = data.get('title')
        description = data.get('description', '')
        start_date = data.get('start_date')
        end_date = data.get('end_date')

        # check if all fields are not empty
        if not title or not start_date or not end_date:
            return JsonResponse({
                'success': False,
                'error': 'Title, Start Date, and End Date are required.'
            }, status=400)

        try:
            with connection.cursor() as cursor:
                cursor.callproc("create_project", [user_id, title, description, start_date, end_date])
                # fetch project id
                new_project_id = cursor.fetchone()[0]
                return JsonResponse({
                    'success': True,
                    'message': 'Project created successfully',
                    'project_id': new_project_id
                }, status=201)
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)


@method_decorator(csrf_exempt, name='dispatch')
class ProjectDetailView(View):

    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
        return super().dispatch(request, *args, **kwargs)

    def get(self, request):
        project_id = request.GET.get('project_id')
        user_id = request.user.pk

        if not project_id:
            return JsonResponse({'success': False, 'error': 'Project ID is required.'}, status=400)

        try:
            with connection.cursor() as cursor:
                # Call Stored Procedure
                cursor.callproc("get_project_details", [project_id, user_id])
                result = cursor.fetchone()[0]

                if result.get('success'):
                    if 'data' in result and isinstance(result['data'], dict):
                        result['data']['current_user_id'] = user_id
                    return JsonResponse(result)
                else:
                    error_msg = result.get('error', '')
                    status_code = 403 if 'Unauthorized' in error_msg else 404
                    return JsonResponse(result, status=status_code)
        except Exception as e:
            return JsonResponse({'success': False, 'error': 'Internal Server Error'}, status=500)

    def put(self, request):
        data = decode_body(request)
        user_id = request.user.pk

        project_id = data.get('project_id')
        title = data.get('title')
        description = data.get('description', '')
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        status = data.get('status')

        # Basic Validation
        if not project_id or not title or not start_date or not end_date:
            return JsonResponse({
                'success': False,
                'error': 'Project ID, Title, and Dates are required.'
            }, status=400)

        try:
            with connection.cursor() as cursor:
                cursor.callproc("update_project", [project_id, user_id, title, description, start_date, end_date, status])
                # return true if leader
                success = cursor.fetchone()[0]

                if success:
                    return JsonResponse({'success': True, 'message': 'Project updated successfully'})
                else:
                    return JsonResponse({
                        'success': False,
                        'error': 'Permission denied. Only the Leader can edit this project.'
                    }, status=403)
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class ProjectMembershipView(View):

    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
        return super().dispatch(request, *args, **kwargs)

    def post(self, request):
        data = decode_body(request)
        requester_id = request.user.pk

        # kuha data from request
        project_id = data.get('project_id')
        identifier = data.get('identifier')
        role = data.get('role', 'Member')

        # check if all fields are not empty
        if not project_id or not identifier:
            return JsonResponse({'success': False, 'error': 'Project ID and Username/Email are required.'}, status=400)

        try:
            with connection.cursor() as cursor:
                cursor.callproc("add_project_member", [project_id, requester_id, identifier, role])
                result = cursor.fetchone()[0]

                if result.get('success'):
                    return JsonResponse(result, status=201)
                else:
                    return JsonResponse(result, status=400)
        except Exception as e:
            return JsonResponse({'success': False, 'error': 'Internal Server Error'}, status=500)

    def delete(self, request):
        data = decode_body(request)
        requester_id = request.user.pk

        project_id = data.get('project_id')
        target_user_id = data.get('user_id')

        # if user wants to leave the project
        if target_user_id == 'self':
            target_user_id = requester_id

        if not project_id or not target_user_id:
            return JsonResponse({'success': False, 'error': 'Project ID and Target User ID are required.'}, status=400)

        try:
            with connection.cursor() as cursor:
                cursor.callproc("remove_project_member", [project_id, requester_id, target_user_id])
                result = cursor.fetchone()[0]

                if result.get('success'):
                    return JsonResponse(result)
                else:
                    return JsonResponse(result, status=403)
        except Exception as e:
            return JsonResponse({'success': False, 'error': 'Internal Server Error'}, status=500)

    def put(self, request):
        data = decode_body(request)
        # get logged in user id must be a leader
        requester_id = request.user.pk

        project_id = data.get('project_id')
        target_user_id = data.get('user_id')
        new_role = data.get('role')

        if not all([project_id, target_user_id, new_role]):
            return JsonResponse({
                'success': False,
                'error': 'Project ID, Target User ID, and Role are required.'
            }, status=400)

        valid_roles = ['Leader', 'Manager', 'Member']
        if new_role not in valid_roles:
            return JsonResponse({'success': False, 'error': 'Invalid role choice.'}, status=400)

        try:
            with connection.cursor() as cursor:
                # Call Stored Procedure
                cursor.callproc("update_project_member_role", [project_id, requester_id, target_user_id, new_role])
                result = cursor.fetchone()[0]

                if result.get('success'):
                    return JsonResponse(result)
                else:
                    return JsonResponse(result, status=403)
        except Exception as e:
            return JsonResponse({'success': False, 'error': 'Internal Server Error'}, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class TagView(View):
    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
        return super().dispatch(request, *args, **kwargs)

    def get(self, request):  
        project_id = request.GET.get('project_id')

        if not project_id:
            return JsonResponse({'success': False, 'error': 'Project ID is required.'}, status=400)

        try:
            with connection.cursor() as cursor:
                cursor.callproc('get_project_tags', [project_id])
                result = cursor.fetchone()[0]
                return JsonResponse(result)
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)

    def post(self, request):
        data = decode_body(request)
        project_id = data.get('project_id')
        user_id = request.user.pk
        name = data.get('name')
        hex_color = data.get('hex_color', '#000000')

        if not project_id or not name:
            return JsonResponse({'success': False, 'error': 'Project ID and Name are required.'}, status=400)

        try:
            with connection.cursor() as cursor:
                cursor.callproc('create_tag', [project_id, user_id, name, hex_color])
                result = cursor.fetchone()[0]

                if result.get('success'):
                    return JsonResponse(result, status=201)
                else:
                    return JsonResponse(result, status=403)
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)

    def put(self, request):
        data = decode_body(request)
        tag_id = data.get('tag_id')
        user_id = request.user.pk
        name = data.get('name')
        hex_color = data.get('hex_color')

        if not tag_id:
            return JsonResponse({'success': False, 'error': 'Tag ID is required.'}, status=400)

        try:
            with connection.cursor() as cursor:
                cursor.callproc('update_tag', [tag_id, user_id, name, hex_color])
                result = cursor.fetchone()[0]

                if result.get('success'):
                    return JsonResponse(result)
                else:
                    status_code = 404 if 'not found' in result.get('error', '').lower() else 403
                    return JsonResponse(result, status=status_code)
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)

    def delete(self, request):
        data = decode_body(request)
        tag_id = data.get('tag_id')
        user_id = request.user.pk

        if not tag_id:
            return JsonResponse({'success': False, 'error': 'Tag ID is required.'}, status=400)

        try:
            with connection.cursor() as cursor:
                cursor.callproc('delete_tag', [tag_id, user_id])
                result = cursor.fetchone()[0]

                if result.get('success'):
                    return JsonResponse(result)
                else:
                    status_code = 404 if 'not found' in result.get('error', '').lower() else 403
                    return JsonResponse(result, status=status_code)
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)
