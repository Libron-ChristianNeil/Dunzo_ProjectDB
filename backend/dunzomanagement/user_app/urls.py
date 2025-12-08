from django.urls import path
from . import views


urlpatterns = [
    path('dashboard/', views.user_dashboard, name='dashboard'),
    path('edit-profile/', views.edit_profile, name='edit_profile'),
    path('notifications/', views.view_notifications, name='notifications'),
]
