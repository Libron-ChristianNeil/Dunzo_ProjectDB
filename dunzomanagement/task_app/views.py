from django.shortcuts import render
from django.views import View


# Create your views here.
class TaskAppView(View):
    template_name = 'task_app/task_app.html'
    def get(self, request):
        return render(request, self.template_name)