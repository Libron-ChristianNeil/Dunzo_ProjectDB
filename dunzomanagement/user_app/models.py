from django.db import models

# Create your models here.
class User(models.Model):
    ROLE_CHOICES = [
        ('Manager', 'Manager'),
        ('Member', 'Member'),
    ]

    user_id = models.AutoField(primary_key=True)

    name = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    password_hash = models.CharField(max_length=255)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)

    date_joined = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Notification(models.Model):
    notification_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User,on_delete=models.CASCADE)

    type = models.CharField(max_length=50)
    message = models.TextField()
    is_read = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.user.name}: {self.type}"
