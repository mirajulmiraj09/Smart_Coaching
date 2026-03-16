from django.db import models
from accounts.models import User

class AccessType(models.TextChoices):
    FREE = "free", "Free"
    PAID = "paid", "Paid"


class CenterStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    APPROVED = "approved", "Approved"
    REJECTED = "rejected", "Rejected"


class CoachingCenter(models.Model):

    coaching_center_id = models.BigAutoField(primary_key=True)

    center_name = models.CharField(max_length=255)
    location = models.CharField(max_length=255)

    address = models.TextField(blank=True)

    contact_number = models.CharField(max_length=20)
    email = models.EmailField(blank=True)

    website = models.URLField(blank=True)
    logo = models.ImageField(upload_to="center_logos/", blank=True, null=True)

    established_date = models.DateField(null=True, blank=True)

    access_type = models.CharField(
        max_length=10,
        choices=AccessType.choices,
        default=AccessType.FREE
    )

    status = models.CharField(
        max_length=10,
        choices=CenterStatus.choices,
        default=CenterStatus.PENDING
    )

    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='submitted_centers'
    )

    reviewed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_centers'
    )

    reviewed_at = models.DateTimeField(null=True, blank=True)
    review_note = models.TextField(blank=True)

    description = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "coaching_centers"
        ordering = ["-created_at"]

    def __str__(self):
        return self.center_name

    def is_active(self):
        return self.status == CenterStatus.APPROVED
    

class CenterMembership(models.Model):

    class Role(models.TextChoices):
        OWNER = "owner", "Owner"
        TEACHER = "teacher", "Teacher"
        STUDENT = "student", "Student"
        STAFF = "staff", "Staff"

    membership_id = models.BigAutoField(primary_key=True)

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="center_memberships"
    )

    coaching_center = models.ForeignKey(
        CoachingCenter,
        on_delete=models.CASCADE,
        related_name="memberships"
    )

    role = models.CharField(
        max_length=20,
        choices=Role.choices
    )

    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "center_memberships"
        unique_together = ("user", "coaching_center")

    def __str__(self):
        return f"{self.user.name} - {self.coaching_center.center_name} ({self.role})"