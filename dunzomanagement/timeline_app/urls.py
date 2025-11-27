from django.urls import path
from . import views

app_name = "timeline_app"

# timeline/urls.py
urlpatterns = [
    path("", views.timeline_list, name="timeline"),
    path("create/", views.timeline_create, name="timeline_create"),
    path("<int:id>/edit/", views.timeline_edit, name="timeline_edit"),
    path("<int:id>/delete/", views.timeline_delete, name="timeline_delete"),
]
