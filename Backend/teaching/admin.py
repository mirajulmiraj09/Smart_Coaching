from django.contrib import admin

from teaching.models import Subject, TeachingMaterial, TeacherSubjectBatchAssignment


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
	list_display = (
		'subject_id',
		'subject_name',
		'subject_code',
		'course',
		'coaching_center',
		'teacher',
		'is_active',
		'assigned_date',
	)
	list_filter = ('is_active', 'coaching_center', 'course')
	search_fields = (
		'subject_name',
		'subject_code',
		'course__course_title',
		'teacher__name',
		'teacher__email',
	)
	ordering = ('-created_at',)
	readonly_fields = ('created_at', 'updated_at')


@admin.register(TeachingMaterial)
class TeachingMaterialAdmin(admin.ModelAdmin):
	list_display = (
		'material_id',
		'material_title',
		'subject',
		'batch',
		'file_type',
		'uploaded_by',
		'uploaded_at',
	)
	list_filter = ('file_type', 'subject__coaching_center')
	search_fields = (
		'material_title',
		'subject__subject_name',
		'subject__subject_code',
		'batch__batch_name',
		'uploaded_by__name',
		'uploaded_by__email',
	)
	ordering = ('-uploaded_at',)
	readonly_fields = ('uploaded_at', 'created_at')


@admin.register(TeacherSubjectBatchAssignment)
class TeacherSubjectBatchAssignmentAdmin(admin.ModelAdmin):
	list_display = (
		'assignment_id',
		'coaching_center',
		'course',
		'batch',
		'subject',
		'teacher',
		'assigned_by',
		'assigned_at',
		'is_active',
	)
	list_filter = ('is_active', 'coaching_center', 'course')
	search_fields = (
		'teacher__name',
		'teacher__email',
		'subject__subject_name',
		'batch__batch_name',
		'course__course_title',
	)
	ordering = ('-assigned_at',)
	readonly_fields = ('assigned_at',)
