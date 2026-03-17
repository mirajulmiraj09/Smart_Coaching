from django.contrib import admin

from academics.models import Batch, Course, Enrollment


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
	list_display = (
		'course_id',
		'course_title',
		'coaching_center',
		'fee',
		'duration',
		'is_archived',
		'created_at',
	)
	list_filter = ('is_archived', 'coaching_center')
	search_fields = ('course_title', 'coaching_center__center_name')
	ordering = ('-created_at',)
	readonly_fields = ('created_at', 'updated_at')


@admin.register(Batch)
class BatchAdmin(admin.ModelAdmin):
	list_display = (
		'batch_id',
		'batch_name',
		'batch_code',
		'course',
		'coaching_center',
		'batch_type',
		'class_shift',
		'status',
		'start_date',
		'end_date',
		'max_students',
	)
	list_filter = ('status', 'batch_type', 'class_shift', 'coaching_center')
	search_fields = ('batch_name', 'batch_code', 'course__course_title', 'coaching_center__center_name')
	ordering = ('-created_at',)
	readonly_fields = ('created_at', 'updated_at')


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
	list_display = (
		'enrollment_id',
		'batch',
		'student',
		'enrollment_status',
		'enrolled_at',
	)
	list_filter = ('enrollment_status', 'batch__coaching_center')
	search_fields = (
		'student__name',
		'student__email',
		'batch__batch_name',
		'batch__batch_code',
		'batch__course__course_title',
	)
	ordering = ('-enrolled_at',)
	readonly_fields = ('enrolled_at', 'updated_at')
