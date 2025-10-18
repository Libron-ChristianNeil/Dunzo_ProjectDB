
from django.contrib import admin
from django.urls import path

from dunzomanagement.project_app.views import ProjectPageView

urlpatterns = [
    path('project/', ProjectPageView().as_view(), name = 'project'),
]
