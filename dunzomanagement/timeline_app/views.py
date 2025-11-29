from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from django.http import Http404
from django.views import View
from .forms import TimelineForm
from .models import TimelineEntry  # Import your model instead of supabase

entry = 'timeline_app/timeline_app.html'

# @login_required
def get_entries(request):
    return render(request, entry)
