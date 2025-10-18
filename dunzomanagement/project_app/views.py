from django.http import HttpResponse
from django.shortcuts import render
from django.views import View

# Create your views here.
class ProjectPageView(View):
    template_name = 'projectpage.html'

    def get(self,request):
        return render(request, self.template_name)
