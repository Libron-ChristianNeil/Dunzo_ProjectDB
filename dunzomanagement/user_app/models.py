from django.db import models

class User(models.Model):
    user_id = models.AutoField(primary_key=True)

    username = models.CharField(max_length=20)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=50)
    email = models.EmailField(unique=True)
    password_hash = models.CharField(max_length=255)

    date_joined = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.username

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
