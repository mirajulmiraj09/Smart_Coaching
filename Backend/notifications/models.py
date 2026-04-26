from django.db import models


class NotificationType(models.TextChoices):
    SYSTEM = 'system', 'System'
    QUIZ = 'quiz', 'Quiz'
    EXAM = 'exam', 'Exam'
    FEE = 'fee', 'Fee'
    RESULT = 'result', 'Result'


class NotificationStatus(models.TextChoices):
    READ = 'read', 'Read'
    UNREAD = 'unread', 'Unread'


class Notification(models.Model):
    notification_id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='notifications',
        db_column='user_id'
    )
    sender = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='sent_notifications',
        db_column='sender_id'
    )
    title = models.CharField(max_length=255)
    message = models.TextField()
    type = models.CharField(max_length=20, choices=NotificationType.choices)
    status = models.CharField(
        max_length=10,
        choices=NotificationStatus.choices,
        default=NotificationStatus.UNREAD
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']

    def __str__(self):
        return f'[{self.type}] {self.title} → {self.user}'