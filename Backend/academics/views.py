from rest_framework import status
from rest_framework.generics import (
    ListCreateAPIView, RetrieveUpdateAPIView, get_object_or_404
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView, Response

from academics.models import Batch, Course, Enrollment, EnrollmentStatus
from academics.serializers import (
    BatchSerializer, CourseSerializer,
    EnrollmentSerializer, EnrolledStudentSerializer,
)


class CourseListCreateView(ListCreateAPIView):
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Course.objects.filter(
            coaching_center_id=self.kwargs['center_id'],
            is_archived=False,
        )

    def perform_create(self, serializer):
        serializer.save(coaching_center_id=self.kwargs['center_id'])


class CourseDetailView(RetrieveUpdateAPIView):
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]
    queryset = Course.objects.all()
    lookup_field = 'course_id'


class CourseArchiveView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, course_id):
        course = get_object_or_404(Course, pk=course_id)
        course.archive()
        return Response({'detail': 'Course archived.'}, status=status.HTTP_200_OK)


class BatchListCreateView(ListCreateAPIView):
    serializer_class = BatchSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Batch.objects.filter(course_id=self.kwargs['course_id'])

    def perform_create(self, serializer):
        serializer.save(course_id=self.kwargs['course_id'])


class ActiveBatchListView(ListCreateAPIView):
    serializer_class = BatchSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Batch.objects.filter(
            coaching_center_id=self.kwargs['center_id'],
            status='running',
        )


class EnrollStudentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, batch_id):
        batch = get_object_or_404(Batch, pk=batch_id)
        serializer = EnrollmentSerializer(data={**request.data, 'batch': batch.pk})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class RemoveStudentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, enrollment_id):
        enrollment = get_object_or_404(Enrollment, pk=enrollment_id)
        enrollment.enrollment_status = EnrollmentStatus.DROPPED
        enrollment.save(update_fields=['enrollment_status', 'updated_at'])
        return Response({'detail': 'Student removed from batch.'}, status=status.HTTP_200_OK)


class EnrolledStudentListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, batch_id):
        enrollments = Enrollment.objects.filter(
            batch_id=batch_id,
            enrollment_status=EnrollmentStatus.ACTIVE,
        ).select_related('student')
        serializer = EnrolledStudentSerializer(enrollments, many=True)
        return Response(serializer.data)