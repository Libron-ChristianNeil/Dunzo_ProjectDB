from django.urls import path
from . import views

app_name = "timeline_app"

# timeline/urls.py
urlpatterns = [
    path("", views.get_entries, name="timeline"),
]
