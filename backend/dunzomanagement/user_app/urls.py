from django.urls import path
from . import views
from .views import UserView, NotificationView

app_name = "user_app"

# /dashboard/
urlpatterns = [
    # Dashboard: /user/dashboard/
    path('dashboard/', views.get_dashboard, name='dashboard'),

    # Settings: /user/settings/ (GET, PUT, DELETE for User Profile)
    path('settings/', UserView.as_view(), name='settings'),

    # Notifications List: /user/notifications/
    path('notifications/', NotificationView.as_view(), name='notifications_list'),

    # Notification Delete: /user/notifications/<id>/
    # We need a separate path with an ID for the delete method to work
    path('notifications/<int:notification_id>/', NotificationView.as_view(), name='notification_delete'),
]
