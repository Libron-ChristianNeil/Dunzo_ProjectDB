from django.shortcuts import render

# Create your views here.
def projectpage(request):
    return render(request, 'project_app/projectpage.html')


