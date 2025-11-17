from django.urls import path
from . import views

app_name = 'timeline_app'

urlpatterns = [
    path('timeline/', views.TimelineAppView.as_view(), name='timeline_app'),
]
