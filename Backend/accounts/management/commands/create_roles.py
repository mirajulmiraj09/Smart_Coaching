from django.core.management.base import BaseCommand
from accounts.models import Role, RoleName


class Command(BaseCommand):
    help = "Create default system roles"

    def handle(self, *args, **kwargs):
        created_count = 0

        for role in RoleName:
            obj, created = Role.objects.get_or_create(
                role_name=role.value,
                defaults={
                    "description": role.label
                }
            )

            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f"Created role: {role.label}")
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f"Role already exists: {role.label}")
                )

        self.stdout.write(
            self.style.SUCCESS(f"\nTotal new roles created: {created_count}")
        )