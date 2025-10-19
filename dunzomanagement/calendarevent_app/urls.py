from django.urls import path
from . import views
urlpatterns = [
    path('calendarevent/', views.CalendarEventViews.as_view(), name='calendarevent_app'),
]
