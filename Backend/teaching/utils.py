from django.conf import settings
from django.core.mail import send_mail


def send_teacher_assignment_email(assignment):
    """Notify a teacher about a new subject-batch assignment."""
    subject = "New teaching assignment - Smart Coaching Center"
    message = (
        f"Hi {assignment.teacher.name},\n\n"
        "You have been assigned to teach a new class.\n"
        f"Coaching Center: {assignment.coaching_center.center_name}\n"
        f"Course: {assignment.course.course_title}\n"
        f"Batch: {assignment.batch.batch_name} ({assignment.batch.batch_code})\n"
        f"Subject: {assignment.subject.subject_name} ({assignment.subject.subject_code})\n\n"
        "Please log in to your dashboard for details."
    )

    send_mail(
        subject=subject,
        message=message,
        from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@example.com"),
        recipient_list=[assignment.teacher.email],
        fail_silently=False,
    )
