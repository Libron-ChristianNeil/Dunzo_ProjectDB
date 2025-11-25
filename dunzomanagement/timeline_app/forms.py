# timeline_app/forms.py
from django import forms
from project_app.models import Project
from user_app.models import User

class TimelineForm(forms.Form):
    project_id = forms.ModelChoiceField(queryset=Project.objects.all())
    user_id = forms.ModelChoiceField(queryset=User.objects.all())
    action = forms.CharField(max_length=255)
    details = forms.CharField(widget=forms.Textarea, required=False)