from django.db import transaction

from academics.models import Enrollment, EnrollmentStatus
from notifications.models import Notification, NotificationStatus


class NotificationService:

    @staticmethod
    def send(user, title: str, message: str, type: str, sender=None) -> Notification:
        """Send a single notification to one user."""
        return Notification.objects.create(
            user=user,
            sender=sender,
            title=title,
            message=message,
            type=type,
        )

    @staticmethod
    @transaction.atomic
    def broadcast_to_batch(batch, title: str, message: str, type: str, sender=None) -> int:
        """
        Insert one notification row per active enrolled student in a batch.
        Returns count of notifications created.
        """
        students = (
            Enrollment.objects
            .filter(batch=batch, enrollment_status=EnrollmentStatus.ACTIVE)
            .select_related('student')
            .values_list('student', flat=True)
        )
        notifications = [
            Notification(
                user_id=student_id,
                sender=sender,
                title=title,
                message=message,
                type=type,
            )
            for student_id in students
        ]
        Notification.objects.bulk_create(notifications)
        return len(notifications)

    @staticmethod
    def mark_as_read(notification_id: int, user) -> Notification:
        notification = Notification.objects.get(
            pk=notification_id,
            user=user
        )
        notification.status = NotificationStatus.READ
        notification.save(update_fields=['status'])
        return notification

    @staticmethod
    def mark_all_as_read(user) -> int:
        return Notification.objects.filter(
            user=user,
            status=NotificationStatus.UNREAD
        ).update(status=NotificationStatus.READ)

    @staticmethod
    def get_unread_count(user) -> int:
        return Notification.objects.filter(
            user=user,
            status=NotificationStatus.UNREAD
        ).count()

    @staticmethod
    def get_history(user, type=None):
        qs = Notification.objects.filter(user=user)
        if type:
            qs = qs.filter(type=type)
        return qs