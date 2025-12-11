from django.urls import path
from timeline_app.views import TimelineView

app_name = "timeline_app"

urlpatterns = [
    path("", TimelineView.as_view(), name="timeline"),
]
