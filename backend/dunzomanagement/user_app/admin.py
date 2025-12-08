from django.contrib import admin
from .models import User, Notification

# Basic registration
admin.site.register(User)
admin.site.register(Notification)
