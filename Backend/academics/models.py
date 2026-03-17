from django.db import models
from django.core.exceptions import ValidationError


class Course(models.Model):
    course_id = models.BigAutoField(primary_key=True)
    coaching_center = models.ForeignKey(
        'centers.CoachingCenter',
        on_delete=models.PROTECT,
        related_name='courses',
        db_column='coaching_center_id'
    )
    course_title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    fee = models.DecimalField(max_digits=10, decimal_places=2)
    duration = models.PositiveIntegerField(help_text='Duration in weeks')
    is_archived = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'courses'

    def __str__(self):
        return self.course_title

    def archive(self):
        self.is_archived = True
        self.save(update_fields=['is_archived', 'updated_at'])


class BatchType(models.TextChoices):
    REGULAR = 'regular', 'Regular'
    CRASH = 'crash', 'Crash'
    ONLINE = 'online', 'Online'


class ClassShift(models.TextChoices):
    MORNING = 'morning', 'Morning'
    DAY = 'day', 'Day'
    EVENING = 'evening', 'Evening'
    NIGHT = 'night', 'Night'


class BatchStatus(models.TextChoices):
    UPCOMING = 'upcoming', 'Upcoming'
    RUNNING = 'running', 'Running'
    COMPLETED = 'completed', 'Completed'


class Batch(models.Model):
    batch_id = models.BigAutoField(primary_key=True)
    course = models.ForeignKey(
        Course,
        on_delete=models.PROTECT,
        related_name='batches',
        db_column='course_id'
    )
    coaching_center = models.ForeignKey(
        'centers.CoachingCenter',
        on_delete=models.PROTECT,
        related_name='batches',
        db_column='coaching_center_id'
    )
    batch_name = models.CharField(max_length=255)
    batch_code = models.CharField(max_length=50, unique=True)
    batch_type = models.CharField(max_length=20, choices=BatchType.choices)
    class_shift = models.CharField(max_length=20, choices=ClassShift.choices)
    start_date = models.DateField()
    end_date = models.DateField()
    max_students = models.PositiveIntegerField()
    status = models.CharField(
        max_length=20,
        choices=BatchStatus.choices,
        default=BatchStatus.UPCOMING
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'batches'

    def __str__(self):
        return f'{self.batch_name} ({self.batch_code})'

    @property
    def enrolled_count(self):
        return self.enrollments.filter(
            enrollment_status=EnrollmentStatus.ACTIVE
        ).count()

    @property
    def is_full(self):
        return self.enrolled_count >= self.max_students

    def update_status(self, new_status):
        self.status = new_status
        self.save(update_fields=['status', 'updated_at'])


class EnrollmentStatus(models.TextChoices):
    ACTIVE = 'active', 'Active'
    DROPPED = 'dropped', 'Dropped'
    COMPLETED = 'completed', 'Completed'


class Enrollment(models.Model):
    enrollment_id = models.BigAutoField(primary_key=True)
    batch = models.ForeignKey(
        Batch,
        on_delete=models.PROTECT,
        related_name='enrollments',
        db_column='batch_id'
    )
    student = models.ForeignKey(
        'accounts.User',
        on_delete=models.PROTECT,
        related_name='enrollments',
        db_column='student_user_id'
    )
    enrollment_status = models.CharField(
        max_length=20,
        choices=EnrollmentStatus.choices,
        default=EnrollmentStatus.ACTIVE
    )
    enrolled_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'enrollments'
        unique_together = ('batch', 'student')

    def __str__(self):
        return f'{self.student} → {self.batch}'

    def save(self, *args, **kwargs):
        # Enforce max_students cap on new enrollments
        if not self.pk and self.enrollment_status == EnrollmentStatus.ACTIVE:
            if self.batch.is_full:
                raise ValidationError(
                    f'Batch "{self.batch.batch_name}" has reached its maximum capacity '
                    f'of {self.batch.max_students} students.'
                )
        super().save(*args, **kwargs)