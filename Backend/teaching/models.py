from django.db import models
from django.core.exceptions import ValidationError


class FileType(models.TextChoices):
    PDF = 'pdf', 'PDF'
    VIDEO = 'video', 'Video'
    IMAGE = 'image', 'Image'


class Subject(models.Model):
    subject_id = models.BigAutoField(primary_key=True)
    course = models.ForeignKey(
        'academics.Course',
        on_delete=models.PROTECT,
        related_name='subjects',
        db_column='course_id'
    )
    coaching_center = models.ForeignKey(
        'centers.CoachingCenter',
        on_delete=models.PROTECT,
        related_name='subjects',
        db_column='coaching_center_id'
    )
    teacher = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_subjects',
        db_column='teacher_user_id'
    )
    subject_name = models.CharField(max_length=255)
    subject_code = models.CharField(max_length=50, unique=True)
    assigned_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'subjects'

    def __str__(self):
        return f'{self.subject_name} ({self.subject_code})'

    def assign_teacher(self, teacher, assigned_date=None):
        from django.utils import timezone
        self.teacher = teacher
        self.assigned_date = assigned_date or timezone.now().date()
        self.save(update_fields=['teacher', 'assigned_date', 'updated_at'])

    def remove_assignment(self):
        self.teacher = None
        self.is_active = False
        self.save(update_fields=['teacher', 'is_active', 'updated_at'])


class TeachingMaterial(models.Model):
    material_id = models.BigAutoField(primary_key=True)
    subject = models.ForeignKey(
        Subject,
        on_delete=models.CASCADE,
        related_name='materials',
        db_column='subject_id'
    )
    batch = models.ForeignKey(
        'academics.Batch',
        on_delete=models.CASCADE,
        related_name='materials',
        db_column='batch_id',
        null=True,
        blank=True,
        help_text='If set, material is scoped to this specific batch.'
    )
    material_title = models.CharField(max_length=255)
    file_type = models.CharField(max_length=50, choices=FileType.choices)
    file_path = models.TextField()
    uploaded_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='uploaded_materials',
        db_column='uploaded_by'
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'teaching_materials'

    def __str__(self):
        return self.material_title


class TeacherSubjectBatchAssignment(models.Model):
    assignment_id = models.BigAutoField(primary_key=True)
    coaching_center = models.ForeignKey(
        'centers.CoachingCenter',
        on_delete=models.PROTECT,
        related_name='teacher_assignments',
        db_column='coaching_center_id'
    )
    course = models.ForeignKey(
        'academics.Course',
        on_delete=models.PROTECT,
        related_name='teacher_assignments',
        db_column='course_id'
    )
    batch = models.ForeignKey(
        'academics.Batch',
        on_delete=models.PROTECT,
        related_name='teacher_assignments',
        db_column='batch_id'
    )
    subject = models.ForeignKey(
        Subject,
        on_delete=models.PROTECT,
        related_name='teacher_assignments',
        db_column='subject_id'
    )
    teacher = models.ForeignKey(
        'accounts.User',
        on_delete=models.PROTECT,
        related_name='teaching_assignments',
        db_column='teacher_user_id'
    )
    assigned_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_teacher_assignments',
        db_column='assigned_by_user_id'
    )
    assigned_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'teacher_subject_batch_assignments'
        unique_together = ('batch', 'subject')

    def __str__(self):
        return f'{self.teacher.name} -> {self.subject.subject_name} ({self.batch.batch_name})'

    def clean(self):
        if self.course_id and self.batch_id and self.batch.course_id != self.course_id:
            raise ValidationError('Batch must belong to the selected course.')
        if self.subject_id and self.course_id and self.subject.course_id != self.course_id:
            raise ValidationError('Subject must belong to the selected course.')
        if self.subject_id and self.coaching_center_id and self.subject.coaching_center_id != self.coaching_center_id:
            raise ValidationError('Subject must belong to the selected coaching center.')

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)