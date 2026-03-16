from django.contrib import admin
from centers.models import CoachingCenter, CenterMembership


@admin.register(CoachingCenter)
class CoachingCenterAdmin(admin.ModelAdmin):
	list_display = ('coaching_center_id', 'center_name', 'status', 'access_type', 'created_by', 'reviewed_by', 'created_at')
	list_filter = ('status', 'access_type', 'created_at')
	search_fields = ('center_name', 'location', 'contact_number', 'email')


@admin.register(CenterMembership)
class CenterMembershipAdmin(admin.ModelAdmin):
	list_display = ('membership_id', 'user', 'coaching_center', 'role', 'joined_at')
	list_filter = ('role', 'joined_at')
	search_fields = ('user__email', 'user__name', 'coaching_center__center_name')
