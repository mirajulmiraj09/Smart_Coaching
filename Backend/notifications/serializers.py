from rest_framework import serializers

from notifications.models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.name', read_only=True, default=None)

    class Meta:
        model = Notification
        fields = [
            'notification_id', 'user', 'sender', 'sender_name',
            'title', 'message', 'type', 'status', 'created_at',
        ]
        read_only_fields = fields


class BroadcastSerializer(serializers.Serializer):
    batch_id = serializers.IntegerField()
    title = serializers.CharField(max_length=255)
    message = serializers.CharField()
    type = serializers.ChoiceField(choices=['system', 'quiz', 'exam', 'fee', 'result'])