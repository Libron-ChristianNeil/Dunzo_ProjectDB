from django.urls import path
from .views import *

app_name = "task_app"

urlpatterns = [
    path('', TaskView.as_view(), name='task'),
    path('details/', TaskDetailView.as_view(), name='task_details'),
    path('details/assignees/', AssignmentView.as_view(), name='task_assignments'),
    path('details/comments/', CommentView.as_view(), name='task_comments'),
]