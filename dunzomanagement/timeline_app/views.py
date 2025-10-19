from django.shortcuts import render

# Create your views here.
from django.http import HttpRequest, HttpResponse

def timeline_index(request: HttpRequest) -> HttpResponse:
    return render(request, 'timeline_app/timeline_app.html', {})
