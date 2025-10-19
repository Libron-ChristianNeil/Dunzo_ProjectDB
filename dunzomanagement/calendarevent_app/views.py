from django.shortcuts import render
from django.views import View

# Create your views here.
class CalendarEventViews(View):
    template_name = 'calendarevent_app/calendarevent_app.html'
    def get(self, request):
        return render(request, self.template_name)


