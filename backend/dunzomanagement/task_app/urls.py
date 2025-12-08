
# from django.urls import path
# from . import views
#
# urlpatterns = [
#     path('taskapp/', views.TaskAppView.as_view(), name='task_app'),

# from django.urls import path
# from . import views
#
# app_name = "task_app"
#
# urlpatterns = [
#     path('', views.get_tasks, name='task'),
# ]


from django.urls import path
from .views import (
    GetTasks, GetTasksByProject, GetTasksByStatus, GetTaskDetails,
    CreateTaskSP, UpdateTaskStatusSP, AddCommentSP, ManageTaskUsersSP,
    DeleteTaskSP
)

app_name = "task_app"

urlpatterns = [
    # Class-based view URLs
    path('', GetTasks.as_view(), name='get_tasks'),
    path('project/<int:project_id>/', GetTasksByProject.as_view(), name='tasks_by_project'),
    path('status/<str:status>/', GetTasksByStatus.as_view(), name='tasks_by_status'),
    path('<int:task_id>/', GetTaskDetails.as_view(), name='get_details'),

    # Stored Procedure Class-Based Views
    path('create/sp/', CreateTaskSP.as_view(), name='create_task_sp'),
    path('<int:task_id>/status/update/', UpdateTaskStatusSP.as_view(), name='update_status_sp'),
    path('<int:task_id>/comment/add/', AddCommentSP.as_view(), name='add_comment_sp'),
    path('<int:task_id>/users/manage/', ManageTaskUsersSP.as_view(), name='manage_users_sp'),
    path('<int:task_id>/delete/sp/', DeleteTaskSP.as_view(), name='delete_task_sp'),

    #To be considered(tan-awn lang kung makaya)
    # path('<int:task_id>/assign/self/', AssignSelfToTaskSP.as_view(), name='assign_self_sp'),
    # path('bulk/status/', BulkUpdateStatusSP.as_view(), name='bulk_update_status'),

    # API endpoints (class-based)
    # path('api/<str:action>/', TaskAPI.as_view(), name='task_api'),
    # path('api/<str:action>/<int:task_id>/', TaskAPI.as_view(), name='task_api_with_id'),

    # Statistics
    # path('statistics/', GetTaskStatistics.as_view(), name='task_statistics'),

]