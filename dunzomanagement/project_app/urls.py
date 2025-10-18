from django.urls import path
from .views import ProjectPageView

urlpatterns = [
    path('view-project/', ProjectPageView.as_view(), name='project'),
]
