from django.urls import path
from . import views

app_name = 'project_app'

urlpatterns = [
    path('', views.get_projects, name='project'),
]