from django.urls import path
from . import views

urlpatterns = [
    path('taskapp/', views.TaskAppView.as_view(), name='task_app'),
]