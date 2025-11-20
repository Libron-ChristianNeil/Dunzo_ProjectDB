from django.shortcuts import render
from django.views import View

class TimelineAppView(View):
    template_name = 'timeline_app/timeline_app.html'

    def get(self, request):
        return render(request, self.template_name)