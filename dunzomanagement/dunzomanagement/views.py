from django.shortcuts import render
from django.views import View

# def index_view(request):
#     return render(request, 'index.html')
#
# def login_view(request):
#     return render(request, 'login.html')

class LoginView(View):
    template_name = 'main/login.html'
    def get(self, request):
        return render(request, self.template_name)

class LandingPageView(View):
    template_name = 'main/landingpage.html'
    def get(self, request):
        return render(request, self.template_name)