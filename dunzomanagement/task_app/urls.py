from django.urls import path
from . import views

app_name = "task_app"

urlpatterns = [
    path('', views.TaskAppView.as_view(), name='task_app'),
]