from django.contrib.auth import login, authenticate
from django.shortcuts import render, redirect

log_in = 'main/login.html'
landing = 'main/landingpage.html'

def login_user(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')

        user = authenticate(request, email=email, password=password)

        if user is not None:
            login(request, user)
            return redirect('user_app:dashboard')
        else:
            return render(request, log_in, {
                'error': 'Invalid email or password'
            })

    return render(request, log_in)

def landing_page(request):
    return render(request, landing)