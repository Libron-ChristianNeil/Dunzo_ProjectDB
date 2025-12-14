import json
from django.contrib.auth.decorators import login_required
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

@method_decorator(csrf_exempt, name='dispatch')
class ProjectView(View):
    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
        return super().dispatch(request, *args, **kwargs)
    def get(self, request):
        user_id = request.user.pk

        filter_type = request.GET.get('filter', 'Active')

        # Validate filter to prevent SQL issues (optional but good practice)
        valid_filters = ['Active', 'Archived', 'Complete', 'All', 'Leader']
        if filter_type not in valid_filters:
            filter_type = 'Active'

        try:
            with connection.cursor() as cursor:
                # Call the Stored Procedure
                cursor.callproc("get_user_projects", [user_id, filter_type])

                # Fetch the JSON result
                projects_data = cursor.fetchone()[0]

                return JsonResponse({'success': True, 'projects': projects_data})

        except Exception as e:
            print(f"Get Projects Error: {e}")
            return JsonResponse({'success': False, 'error': 'Internal Server Error'}, status=500)
    def post(self, request):
        data = decode_body(request)

        # Extract data from the request body
        user_id = request.user.pk
        title = data.get('title')
        description = data.get('description', '')  # Default to empty string if missing
        start_date = data.get('start_date')
        end_date = data.get('end_date')

        # Basic Validation
        if not title or not start_date or not end_date:
            return JsonResponse({
                'success': False,
                'error': 'Title, Start Date, and End Date are required.'
            }, status=400)

        try:
            with connection.cursor() as cursor:
                # Signature: (p_user_id, p_title, p_description, p_start_date, p_end_date)
                cursor.callproc(
                    "create_project",
                    [user_id, title, description, start_date, end_date]
                )

                # Fetch the returned Project ID
                new_project_id = cursor.fetchone()[0]

                return JsonResponse({
                    'success': True,
                    'message': 'Project created successfully',
                    'project_id': new_project_id
                }, status=201)

        except Exception as e:
            # Log error for debugging (optional)
            print(f"Create Project Error: {e}")
            return JsonResponse({'success': False, 'error': str(e)}, status=500)
    def delete(self, request):
        user_id = request.user.pk

        data = decode_body(request)
        project_id = data.get('project_id')

        if not project_id:
            return JsonResponse({'success': False, 'error': 'Project ID is required'}, status=400)

        try:
            # 1. Security Check: Only the 'Leader' can delete
            # We check if a membership exists that matches: User + Project + Role='Leader'
            is_leader = ProjectMembership.objects.filter(
                project_id=project_id,
                user_id=user_id,
                role='Leader'
            ).exists()

            if not is_leader:
                return JsonResponse({
                    'success': False,
                    'error': 'Permission denied. Only the Leader can delete this project.'
                }, status=403)

            # 2. Perform Delete
            Project.objects.get(pk=project_id).delete()

            return JsonResponse({'success': True, 'message': 'Project deleted successfully'})

        except Project.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Project not found'}, status=404)
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class ProjectDetailView(View):
    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
        return super().dispatch(request, *args, **kwargs)
    # get project details
    def get(self, request):
        project_id = request.GET.get('project_id')
        user_id = request.user.pk

        if not project_id:
            return JsonResponse({'success': False, 'error': 'Project ID is required.'}, status=400)

        try:
            with connection.cursor() as cursor:
                # Call Stored Procedure
                # Signature: (p_project_id, p_user_id)
                cursor.callproc(
                    "get_project_details",
                    [project_id, user_id]
                )

                # Fetch the single JSON blob result
                result = cursor.fetchone()[0]

                # Check status code based on result success
                if result.get('success'):
                    return JsonResponse(result)
                else:
                    # Determine error code (403 for Unauthorized, 404 for Not Found)
                    error_msg = result.get('error', '')
                    status_code = 403 if 'Unauthorized' in error_msg else 404
                    return JsonResponse(result, status=status_code)

        except Exception as e:
            print(f"Get Project Details Error: {e}")
            return JsonResponse({'success': False, 'error': 'Internal Server Error'}, status=500)
    # update project details
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
                # Signature: (p_project_id, p_user_id, p_title, p_description, p_start_date, p_end_date,status)
                cursor.callproc(
                    "update_project",
                    [project_id, user_id, title, description, start_date, end_date, status]
                )

                # The procedure returns True (Success) or False (Not Leader/Failed)
                success = cursor.fetchone()[0]

                if success:
                    return JsonResponse({'success': True, 'message': 'Project updated successfully'})
                else:
                    return JsonResponse({
                        'success': False,
                        'error': 'Permission denied. Only the Leader can edit this project.'
                    }, status=403)

        except Exception as e:
            print(f"Update Project Error: {e}")
            return JsonResponse({'success': False, 'error': str(e)}, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class ProjectMembershipView(View):
    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
        return super().dispatch(request, *args, **kwargs)
    # add a user to project
    def post(self, request):
        data = decode_body(request)
        requester_id = request.user.pk

        # Parse inputs
        project_id = data.get('project_id')
        identifier = data.get('identifier')
        role = data.get('role', 'Member')  # Default to 'Member' if not provided

        # Basic Validation
        if not project_id or not identifier:
            return JsonResponse({'success': False, 'error': 'Project ID and Username/Email are required.'}, status=400)

        try:
            with connection.cursor() as cursor:
                # Signature: (p_project_id, p_requester_id, p_identifier, p_role)
                cursor.callproc(
                    "add_project_member",
                    [project_id, requester_id, identifier, role]
                )

                result = cursor.fetchone()[0]

                if result.get('success'):
                    return JsonResponse(result, status=201)
                else:
                    # Return 400 or 403 depending on the error, but 400 is generally fine here
                    return JsonResponse(result, status=400)

        except Exception as e:
            print(f"Add Member Error: {e}")
            return JsonResponse({'success': False, 'error': 'Internal Server Error'}, status=500)
    # remove a user fron project
    def delete(self, request):
        data = decode_body(request)
        requester_id = request.user.pk

        project_id = data.get('project_id')
        target_user_id = data.get('user_id')

        # Basic Validation
        if not project_id or not target_user_id:
            return JsonResponse({'success': False, 'error': 'Project ID and Target User ID are required.'}, status=400)

        try:
            with connection.cursor() as cursor:
                # Signature: (p_project_id, p_requester_id, p_target_user_id)
                cursor.callproc(
                    "remove_project_member",
                    [project_id, requester_id, target_user_id]
                )

                # Fetch result
                result = cursor.fetchone()[0]

                if result.get('success'):
                    return JsonResponse(result)
                else:
                    # Return 403 Forbidden if permission/safety check failed
                    return JsonResponse(result, status=403)

        except Exception as e:
            print(f"Remove Member Error: {e}")
            return JsonResponse({'success': False, 'error': 'Internal Server Error'}, status=500)
    # change user role in project
    def put(self, request):
        data = decode_body(request)
        requester_id = request.user.pk  # The logged-in user (must be Leader)

        # Parse inputs
        project_id = data.get('project_id')
        target_user_id = data.get('user_id')  # The user receiving the role change
        new_role = data.get('role')

        # Basic Validation
        if not all([project_id, target_user_id, new_role]):
            return JsonResponse({'success': False, 'error': 'Project ID, Target User ID, and Role are required.'},
                                status=400)

        valid_roles = ['Leader', 'Manager', 'Member']
        if new_role not in valid_roles:
            return JsonResponse({'success': False, 'error': 'Invalid role choice.'}, status=400)

        try:
            with connection.cursor() as cursor:
                # Call Stored Procedure
                # Signature: (p_project_id, p_requester_id, p_target_user_id, p_new_role)
                cursor.callproc(
                    "update_project_member_role",
                    [project_id, requester_id, target_user_id, new_role]
                )

                # The SP returns a JSON object directly
                result = cursor.fetchone()[0]

                # Check the 'success' key from the returned JSON
                if result.get('success'):
                    return JsonResponse(result)
                else:
                    # Return 403 Forbidden if permission/safety check failed
                    return JsonResponse(result, status=403)

        except Exception as e:
            print(f"Update Role Error: {e}")
            return JsonResponse({'success': False, 'error': 'Internal Server Error'}, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class TagView(View):
    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
        return super().dispatch(request, *args, **kwargs)
    # get tags for a project
    def get(self, request):
        project_id = request.GET.get('project_id')
        if not project_id:
            return JsonResponse({'success': False, 'error': 'Project ID is required.'}, status=400)
        
        try:
            tags = Tag.objects.filter(project_id=project_id).values('tag_id', 'name', 'hex_color')
            return JsonResponse({'success': True, 'tags': list(tags)})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)

    # create tag
    def post(self, request):
        data = decode_body(request)
        project_id = data.get('project_id')
        name = data.get('name')
        hex_color = data.get('hex_color', '#000000')

        if not project_id or not name:
            return JsonResponse({'success': False, 'error': 'Project ID and Name are required.'}, status=400)

        try:
            # PERMISSION CHECK: Must be Leader or Manager
            has_permission = ProjectMembership.objects.filter(
                project_id=project_id,
                user_id=request.user.pk,
                role__in=['Leader', 'Manager']  # <--- Strict Check
            ).exists()

            if not has_permission:
                return JsonResponse({'success': False, 'error': 'Only Leaders or Managers can create tags.'},
                                    status=403)

            # Create
            tag = Tag.objects.create(
                project_id=project_id,
                name=name,
                hex_color=hex_color
            )

            return JsonResponse({
                'success': True,
                'tag': {'tag_id': tag.tag_id, 'name': tag.name, 'hex_color': tag.hex_color}
            }, status=201)

        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)
    # edit tag
    def put(self, request):
        data = decode_body(request)
        tag_id = data.get('tag_id')
        name = data.get('name')
        hex_color = data.get('hex_color')

        if not tag_id:
            return JsonResponse({'success': False, 'error': 'Tag ID is required.'}, status=400)

        try:
            tag = Tag.objects.get(pk=tag_id)

            # PERMISSION CHECK
            has_permission = ProjectMembership.objects.filter(
                project_id=tag.project_id,
                user_id=request.user.pk,
                role__in=['Leader', 'Manager']
            ).exists()

            if not has_permission:
                return JsonResponse({'success': False, 'error': 'Only Leaders or Managers can edit tags.'}, status=403)

            if name:
                tag.name = name
            if hex_color:
                tag.hex_color = hex_color

            tag.save()

            return JsonResponse({'success': True, 'message': 'Tag updated successfully.'})

        except Tag.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Tag not found.'}, status=404)
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)
    # delete tag
    def delete(self, request):
        data = decode_body(request)
        tag_id = data.get('tag_id')

        if not tag_id:
            return JsonResponse({'success': False, 'error': 'Tag ID is required.'}, status=400)

        try:
            tag = Tag.objects.get(pk=tag_id)

            # PERMISSION CHECK
            has_permission = ProjectMembership.objects.filter(
                project_id=tag.project_id,
                user_id=request.user.pk,
                role__in=['Leader', 'Manager']
            ).exists()

            if not has_permission:
                return JsonResponse({'success': False, 'error': 'Only Leaders or Managers can delete tags.'}, status=403)

            tag.delete()

            return JsonResponse({'success': True, 'message': 'Tag deleted successfully.'})

        except Tag.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Tag not found.'}, status=404)
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)
