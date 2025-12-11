from django.urls import path
from .views import *

app_name = 'project_app'

urlpatterns = [
    path('', ProjectView.as_view(), name='project'),
    path('details/', ProjectDetailView.as_view(), name='project_details'),
    path('details/members/', ProjectMembershipView.as_view(), name='project_members'),
    path('details/tags/', TagView.as_view(), name='project_tags'),
]
