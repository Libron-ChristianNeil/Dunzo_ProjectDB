from django.urls import path
from . import views

app_name = "task_app"

urlpatterns = [
    path('', views.get_tasks, name='task'),
]