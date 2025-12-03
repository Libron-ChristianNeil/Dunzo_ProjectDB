from django.urls import path
from . import views

app_name = 'project_app'

urlpatterns = [
    path('projectpage/', views.projectpage, name='projectpage'),
]
