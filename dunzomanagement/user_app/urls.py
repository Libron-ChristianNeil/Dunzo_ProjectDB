from django.urls import path
from . import views

app_name = "user_app"

urlpatterns = [
    path('', views.get_dashboard, name='dashboard'),
    path('settings/', views.get_settings, name='settings'),
]
