import json
from django.db import connection
from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views import View

from .models import TimelineEntry

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
class TimelineView(View):
    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
        return super().dispatch(request, *args, **kwargs)
    def get(self, request):
        try:
            # 1. Extract Project ID
            project_id = request.GET.get('project_id')
            user_id = request.user.user_id

            if not project_id:
                return JsonResponse({'success': False, 'error': 'project_id is required'}, status=400)

            # 2. Call Stored Procedure
            with connection.cursor() as cursor:
                cursor.callproc('get_project_timeline', [
                    project_id,
                    user_id
                ])
                # 3. Fetch Results
                timeline_entries = dictfetchall(cursor)

            return JsonResponse({'success': True, 'data': timeline_entries}, safe=False)

        except Exception as e:
            # Catches "Access Denied" or other DB errors
            return JsonResponse({'success': False, 'error': str(e)}, status=500)


