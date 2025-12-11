from django.urls import path
from .views import *

app_name = "calendarevent_app"

urlpatterns = [
    path('', CalendarView.as_view(), name='calendar'),
    path('event/', EventView.as_view(), name='calendar_event'),
]