from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    user_id = models.AutoField(primary_key=True)

    # username(unique), first_name, last_name are inherited from AbstractUser
    # AbstractUser already has password, last_login, date_joined(created_at)

    email = models.EmailField(blank=True, null=True, unique=True) # it is optional

    def __str__(self):
        return self.username

    # Override save method to handle empty email field
    def save(self, *args, **kwargs):
        if self.email == "":
            self.email = None
        super().save(*args, **kwargs)

class Notification(models.Model):
    # TYPE_CHOICES = [
    #     ('Assigned', 'Assigned to a Task'),
    #     ('Unassigned', 'Unassigned from a Task'),
    #     ('Comment', 'New Comment on your Task'),
    #     ('Invited', 'Invited to Project'),
    #     ('Removed', 'Removed from the Project'),
    # ]
    notification_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User,on_delete=models.CASCADE)

    # type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    title = models.CharField(max_length=100, blank=True)
    message = models.TextField(blank=True)
    is_read = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.user.username}: {self.message}"
