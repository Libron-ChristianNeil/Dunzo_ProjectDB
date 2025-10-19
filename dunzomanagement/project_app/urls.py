from django.urls import path
from . import views
# from project_app.views import ProjectPageView

app_name = 'project_app'

urlpatterns = [
    # path('project/', ProjectPageView.as_view(), name = 'project'),
    path('projectpage/', views.projectpage, name='projectpage'),
]
