from django.shortcuts import render
from django.views import View


# Create your views here.
class ProjectAppView(View):
    template_name = 'project_app/project_app.html'
    def get(self, request):
        return render(request, self.template_name)
