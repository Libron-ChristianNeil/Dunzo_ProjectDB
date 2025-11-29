from django.urls import path
from . import views

app_name = "user_app"

# /dashboard/
urlpatterns = [
    path('', views.get_dashboard, name='dashboard'),
    path('settings/', views.get_settings, name='settings'),
    path('edit/', views.get_settings, name='edit_user'),
]
