from rest_framework import status
from rest_framework.exceptions import PermissionDenied
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView, Response

from accounts.models import RoleName
from academics.models import Course, Batch
from teaching.models import Subject, TeachingMaterial, TeacherSubjectBatchAssignment
from teaching.serializers import (
    BatchSerializer,
    CourseSerializer,
    SubjectSerializer,
    TeacherSubjectBatchAssignmentSerializer,
    TeachingMaterialSerializer,
)
from teaching.utils import send_teacher_assignment_email


CREATOR_ROLES = {
    RoleName.COACHING_ADMIN,
    RoleName.COACHING_STAFF,
    RoleName.COACHING_MANAGER,
}


def success_response(data=None, message='Success', status_code=status.HTTP_200_OK):
    return Response(
        {
            'success': True,
            'message': message,
            'data': data or {},
        },
        status=status_code,
    )


def ensure_creator_role(user):
    if user.role_name not in CREATOR_ROLES:
        raise PermissionDenied('Only coaching admin, staff, or manager can perform this action.')


class CourseListCreateView(ListCreateAPIView):
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Course.objects.filter(
            coaching_center_id=self.kwargs['center_id'],
            is_archived=False,
        )

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return success_response(data={'results': serializer.data}, message='Courses fetched successfully.')

    def create(self, request, *args, **kwargs):
        ensure_creator_role(request.user)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        course = serializer.save(coaching_center_id=self.kwargs['center_id'])
        return success_response(
            data=CourseSerializer(course).data,
            message='Course created successfully.',
            status_code=status.HTTP_201_CREATED,
        )


class BatchListCreateView(ListCreateAPIView):
    serializer_class = BatchSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Batch.objects.filter(course_id=self.kwargs['course_id'])

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return success_response(data={'results': serializer.data}, message='Batches fetched successfully.')

    def create(self, request, *args, **kwargs):
        ensure_creator_role(request.user)
        course = Course.objects.get(course_id=self.kwargs['course_id'])
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        batch = serializer.save(course=course, coaching_center=course.coaching_center)
        return success_response(
            data=BatchSerializer(batch).data,
            message='Batch created successfully.',
            status_code=status.HTTP_201_CREATED,
        )


class SubjectListCreateView(ListCreateAPIView):
    serializer_class = SubjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Subject.objects.filter(
            course_id=self.kwargs['course_id'],
            is_active=True,
        ).select_related('teacher')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return success_response(data={'results': serializer.data}, message='Subjects fetched successfully.')

    def create(self, request, *args, **kwargs):
        ensure_creator_role(request.user)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        subject = serializer.save(course_id=self.kwargs['course_id'])
        return success_response(
            data=SubjectSerializer(subject).data,
            message='Subject created successfully.',
            status_code=status.HTTP_201_CREATED,
        )


class SubjectDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = SubjectSerializer
    permission_classes = [IsAuthenticated]
    queryset = Subject.objects.all()
    lookup_field = 'subject_id'


class TeacherAssignmentCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        ensure_creator_role(request.user)
        serializer = TeacherSubjectBatchAssignmentSerializer(
            data=request.data,
            context={'request': request},
        )
        serializer.is_valid(raise_exception=True)
        assignment = serializer.save()
        send_teacher_assignment_email(assignment)
        return success_response(
            data=TeacherSubjectBatchAssignmentSerializer(assignment).data,
            message='Teacher assigned successfully and email sent.',
            status_code=status.HTTP_201_CREATED,
        )


class MaterialListCreateView(ListCreateAPIView):
    serializer_class = TeachingMaterialSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = TeachingMaterial.objects.filter(subject_id=self.kwargs['subject_id'])
        batch_id = self.request.query_params.get('batch_id')
        if batch_id:
            qs = qs.filter(batch_id=batch_id)
        return qs


class MaterialDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = TeachingMaterialSerializer
    permission_classes = [IsAuthenticated]
    queryset = TeachingMaterial.objects.all()
    lookup_field = 'material_id'

    def get_queryset(self):
        return TeachingMaterial.objects.filter(subject__teacher=self.request.user)