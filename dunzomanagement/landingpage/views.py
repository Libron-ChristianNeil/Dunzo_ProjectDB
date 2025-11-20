from django.shortcuts import render
from django.views import View

# Create your views here.
class LandingPageView(View):
    template_name = 'landingpage/landingpage.html'
    def get(self, request):
        return render(request, self.template_name)