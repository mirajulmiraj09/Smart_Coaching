from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from academics.models import Batch
from notifications.serializers import BroadcastSerializer, NotificationSerializer
from notifications.services import NotificationService


class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        type_filter = request.query_params.get('type')
        notifications = NotificationService.get_history(request.user, type=type_filter)
        serializer = NotificationSerializer(notifications, many=True)
        return Response({
            'unread_count': NotificationService.get_unread_count(request.user),
            'results': serializer.data,
        })


class MarkReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, notification_id):
        notification = NotificationService.mark_as_read(notification_id, request.user)
        return Response(NotificationSerializer(notification).data)


class MarkAllReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        count = NotificationService.mark_all_as_read(request.user)
        return Response({'detail': f'{count} notification(s) marked as read.'})


class BroadcastView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = BroadcastSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        batch = Batch.objects.get(pk=serializer.validated_data['batch_id'])
        count = NotificationService.broadcast_to_batch(
            batch=batch,
            title=serializer.validated_data['title'],
            message=serializer.validated_data['message'],
            type=serializer.validated_data['type'],
            sender=request.user,
        )
        return Response({'detail': f'Broadcast sent to {count} student(s).'})