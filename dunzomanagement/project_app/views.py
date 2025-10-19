from django.shortcuts import render

def projectpage(request):
    return render(request, 'project_app/projectpage.html')

# Create your views here.
# class ProjectPageView(View):
#     template_name = 'task_app.html'
#
#     def get(self,request):
#         return render(request, self.template_name)
