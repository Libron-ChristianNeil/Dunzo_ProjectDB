from django.urls import path
from . import views

app_name = 'project_app'

urlpatterns = [
    path('project/', views.ProjectAppView.as_view(), name='project_app'),
]