import json
from django.contrib.auth import login, authenticate, get_user_model, logout
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
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

@csrf_exempt
def create_user(request):
    if request.method == 'POST':
        data = decode_body(request)

        username = data.get('username')
        password = data.get('password')

        # 1. Basic Validation
        if not username or not password:
            return JsonResponse({'success': False, 'error': 'All fields are required.'}, status=400)

        # 2. Check if User already exists
        if User.objects.filter(username=username).exists():
            return JsonResponse({'success': False, 'error': 'Username already taken.'}, status=400)

        # 3. Create User
        try:
            # create_user automatically hashes the password
            user = User.objects.create_user(username=username, password=password)
            user.save()

            # 4. Log them in immediately
            login(request, user)

            return JsonResponse({'success': True, 'message': 'Registration successful'})

        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)

    return JsonResponse({'error': 'Method not allowed'}, status=405)

@login_required
def logout_user(request):
    logout(request)
    return JsonResponse({'success': True, 'message': 'Logged out successfully'})
