import json
from django.contrib.auth import login, authenticate, get_user_model
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.views.decorators.csrf import csrf_exempt

User = get_user_model()

def decode_body(request):
    try:
        return json.loads(request.body.decode('utf-8'))
    except json.JSONDecodeError:
        return {}

@csrf_exempt
def login_user(request):
    if request.method == 'POST':
        data = decode_body(request)
        identifier = data.get('username')
        password = data.get('password')

        if not identifier or not password:
            return JsonResponse({'success': False, 'error': 'Missing credentials'}, status=400)

        if '@' in identifier:
            try:
                user_obj = User.objects.get(email=identifier)
                username = user_obj.username
            except User.DoesNotExist:
                username = None
        else:
            username = identifier

        # 3. Authenticate
        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            # 4. Return JSON success
            return JsonResponse({
                'success': True,
                'message': 'Login successful',
                'username': user.get_username()
            }, status=200)
        else:
            # 5. Return JSON error
            return JsonResponse({
                'success': False,
                'error': 'Invalid credentials'
            }, status=401)

    return JsonResponse({'error': 'Method not allowed'}, status=405)

def landing_page(request):
    return render(request)