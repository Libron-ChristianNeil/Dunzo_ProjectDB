from django.urls import path
from . import views


urlpatterns = [
    path('dashboard/', views.DashboardView.as_view(), name='dashboard'),
    path('edit-profile/', views.EditProfileView.as_view(), name='edit_profile'),
    path('notifications/', views.ViewNotificationsView.as_view(), name='notifications'),
    path('settings/', views.SettingsView.as_view(), name='settings'),
    path('login/', views.LoginView.as_view(), name='login'),

]
