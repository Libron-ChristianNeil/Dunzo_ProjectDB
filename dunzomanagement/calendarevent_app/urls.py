from django.urls import path
from . import views

app_name = 'calendarevent_app'

urlpatterns = [
    path('calendarevent/', views.CalendarEventViews.as_view(), name='calendarevent_app'),
]
