from django.urls import path
from . import views

app_name = 'calendarevent_app'

urlpatterns = [
    path('', views.CalendarEventViews.as_view(), name='calendar'),
]
