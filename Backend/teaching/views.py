# # from rest_framework import status
# # from rest_framework.exceptions import PermissionDenied
# # from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
# # from rest_framework.permissions import IsAuthenticated
# # from rest_framework.views import APIView, Response

# # from accounts.models import RoleName
# # from academics.models import Course, Batch
# # from teaching.models import Subject, TeachingMaterial, TeacherSubjectBatchAssignment
# # from teaching.serializers import (
# #     BatchSerializer,
# #     CourseSerializer,
# #     SubjectSerializer,
# #     TeacherSubjectBatchAssignmentSerializer,
# #     TeachingMaterialSerializer,
# # )
# # from teaching.utils import send_teacher_assignment_email


# # CREATOR_ROLES = {
# #     RoleName.COACHING_ADMIN,
# #     RoleName.COACHING_STAFF,
# #     RoleName.COACHING_MANAGER,
# # }


# # def success_response(data=None, message='Success', status_code=status.HTTP_200_OK):
# #     return Response(
# #         {
# #             'success': True,
# #             'message': message,
# #             'data': data or {},
# #         },
# #         status=status_code,
# #     )


# # def ensure_creator_role(user):
# #     if user.role_name not in CREATOR_ROLES:
# #         raise PermissionDenied('Only coaching admin, staff, or manager can perform this action.')


# # class CourseListCreateView(ListCreateAPIView):
# #     serializer_class = CourseSerializer
# #     permission_classes = [IsAuthenticated]

# #     def get_queryset(self):
# #         return Course.objects.filter(
# #             coaching_center_id=self.kwargs['center_id'],
# #             is_archived=False,
# #         )

# #     def list(self, request, *args, **kwargs):
# #         queryset = self.get_queryset()
# #         serializer = self.get_serializer(queryset, many=True)
# #         return success_response(data={'results': serializer.data}, message='Courses fetched successfully.')

# #     def create(self, request, *args, **kwargs):
# #         ensure_creator_role(request.user)
# #         serializer = self.get_serializer(data=request.data)
# #         serializer.is_valid(raise_exception=True)
# #         course = serializer.save(coaching_center_id=self.kwargs['center_id'])
# #         return success_response(
# #             data=CourseSerializer(course).data,
# #             message='Course created successfully.',
# #             status_code=status.HTTP_201_CREATED,
# #         )


# # class BatchListCreateView(ListCreateAPIView):
# #     serializer_class = BatchSerializer
# #     permission_classes = [IsAuthenticated]

# #     def get_queryset(self):
# #         return Batch.objects.filter(course_id=self.kwargs['course_id'])

# #     def list(self, request, *args, **kwargs):
# #         queryset = self.get_queryset()
# #         serializer = self.get_serializer(queryset, many=True)
# #         return success_response(data={'results': serializer.data}, message='Batches fetched successfully.')

# #     def create(self, request, *args, **kwargs):
# #         ensure_creator_role(request.user)
# #         course = Course.objects.get(course_id=self.kwargs['course_id'])
# #         serializer = self.get_serializer(data=request.data)
# #         serializer.is_valid(raise_exception=True)
# #         batch = serializer.save(course=course, coaching_center=course.coaching_center)
# #         return success_response(
# #             data=BatchSerializer(batch).data,
# #             message='Batch created successfully.',
# #             status_code=status.HTTP_201_CREATED,
# #         )

# # class SubjectListCreateView(ListCreateAPIView):
# #     serializer_class = SubjectSerializer
# #     permission_classes = [IsAuthenticated]

# #     def get_queryset(self):
# #         return Subject.objects.filter(
# #             course_id=self.kwargs['course_id'],
# #             is_active=True,
# #         ).select_related('teacher')

# #     def list(self, request, *args, **kwargs):
# #         queryset = self.get_queryset()
# #         serializer = self.get_serializer(queryset, many=True)
# #         return success_response(data={'results': serializer.data}, message='Subjects fetched successfully.')

# #     def create(self, request, *args, **kwargs):
# #         ensure_creator_role(request.user)
        
# #         # Course থেকে coaching_center automatically নিয়ে নেওয়া
# #         course = Course.objects.get(course_id=self.kwargs['course_id'])
        
# #         serializer = self.get_serializer(data=request.data)
# #         serializer.is_valid(raise_exception=True)
        
# #         # coaching_center auto-set from course, course_id from URL
# #         subject = serializer.save(
# #             course_id=self.kwargs['course_id'],
# #             coaching_center=course.coaching_center,  # ← এটাই fix
# #         )
# #         return success_response(
# #             data=SubjectSerializer(subject).data,
# #             message='Subject created successfully.',
# #             status_code=status.HTTP_201_CREATED,
# #         )

# # class SubjectDetailView(RetrieveUpdateDestroyAPIView):
# #     serializer_class = SubjectSerializer
# #     permission_classes = [IsAuthenticated]
# #     queryset = Subject.objects.all()
# #     lookup_field = 'subject_id'


# # class TeacherAssignmentCreateView(APIView):
# #     permission_classes = [IsAuthenticated]

# #     def post(self, request):
# #         ensure_creator_role(request.user)
# #         serializer = TeacherSubjectBatchAssignmentSerializer(
# #             data=request.data,
# #             context={'request': request},
# #         )
# #         serializer.is_valid(raise_exception=True)
# #         assignment = serializer.save()
# #         send_teacher_assignment_email(assignment)
# #         return success_response(
# #             data=TeacherSubjectBatchAssignmentSerializer(assignment).data,
# #             message='Teacher assigned successfully and email sent.',
# #             status_code=status.HTTP_201_CREATED,
# #         )


# # class MaterialListCreateView(ListCreateAPIView):
# #     serializer_class = TeachingMaterialSerializer
# #     permission_classes = [IsAuthenticated]

# #     def get_queryset(self):
# #         qs = TeachingMaterial.objects.filter(subject_id=self.kwargs['subject_id'])
# #         batch_id = self.request.query_params.get('batch_id')
# #         if batch_id:
# #             qs = qs.filter(batch_id=batch_id)
# #         return qs


# # class MaterialDetailView(RetrieveUpdateDestroyAPIView):
# #     serializer_class = TeachingMaterialSerializer
# #     permission_classes = [IsAuthenticated]
# #     queryset = TeachingMaterial.objects.all()
# #     lookup_field = 'material_id'

# #     def get_queryset(self):
# #         return TeachingMaterial.objects.filter(subject__teacher=self.request.user)

# from rest_framework import status
# from rest_framework.exceptions import PermissionDenied
# from rest_framework.generics import ListAPIView, ListCreateAPIView, RetrieveUpdateDestroyAPIView
# from rest_framework.permissions import IsAuthenticated
# from rest_framework.views import APIView, Response

# from accounts.models import RoleName
# from academics.models import Course, Batch
# from teaching.models import Subject, TeachingMaterial, TeacherSubjectBatchAssignment
# from teaching.serializers import (
#     BatchSerializer,
#     CourseSerializer,
#     SubjectSerializer,
#     TeacherSubjectBatchAssignmentSerializer,
#     TeachingMaterialSerializer,
# )
# from teaching.utils import send_teacher_assignment_email


# CREATOR_ROLES = {
#     RoleName.COACHING_ADMIN,
#     RoleName.COACHING_STAFF,
#     RoleName.COACHING_MANAGER,
# }


# def success_response(data=None, message='Success', status_code=status.HTTP_200_OK):
#     return Response(
#         {
#             'success': True,
#             'message': message,
#             'data': data or {},
#         },
#         status=status_code,
#     )


# def ensure_creator_role(user):
#     if user.role_name not in CREATOR_ROLES:
#         raise PermissionDenied('Only coaching admin, staff, or manager can perform this action.')


# class CourseListCreateView(ListCreateAPIView):
#     serializer_class = CourseSerializer
#     permission_classes = [IsAuthenticated]

#     def get_queryset(self):
#         return Course.objects.filter(
#             coaching_center_id=self.kwargs['center_id'],
#             is_archived=False,
#         )

#     def list(self, request, *args, **kwargs):
#         queryset = self.get_queryset()
#         serializer = self.get_serializer(queryset, many=True)
#         return success_response(data={'results': serializer.data}, message='Courses fetched successfully.')

#     def create(self, request, *args, **kwargs):
#         ensure_creator_role(request.user)
#         serializer = self.get_serializer(data=request.data)
#         serializer.is_valid(raise_exception=True)
#         course = serializer.save(coaching_center_id=self.kwargs['center_id'])
#         return success_response(
#             data=CourseSerializer(course).data,
#             message='Course created successfully.',
#             status_code=status.HTTP_201_CREATED,
#         )


# class BatchListCreateView(ListCreateAPIView):
#     serializer_class = BatchSerializer
#     permission_classes = [IsAuthenticated]

#     def get_queryset(self):
#         return Batch.objects.filter(course_id=self.kwargs['course_id'])

#     def list(self, request, *args, **kwargs):
#         queryset = self.get_queryset()
#         serializer = self.get_serializer(queryset, many=True)
#         return success_response(data={'results': serializer.data}, message='Batches fetched successfully.')

#     def create(self, request, *args, **kwargs):
#         ensure_creator_role(request.user)
#         course = Course.objects.get(course_id=self.kwargs['course_id'])
#         serializer = self.get_serializer(data=request.data)
#         serializer.is_valid(raise_exception=True)
#         batch = serializer.save(course=course, coaching_center=course.coaching_center)
#         return success_response(
#             data=BatchSerializer(batch).data,
#             message='Batch created successfully.',
#             status_code=status.HTTP_201_CREATED,
#         )

# class SubjectListCreateView(ListCreateAPIView):
#     serializer_class = SubjectSerializer
#     permission_classes = [IsAuthenticated]

#     def get_queryset(self):
#         return Subject.objects.filter(
#             course_id=self.kwargs['course_id'],
#             is_active=True,
#         ).select_related('teacher')

#     def list(self, request, *args, **kwargs):
#         queryset = self.get_queryset()
#         serializer = self.get_serializer(queryset, many=True)
#         return success_response(data={'results': serializer.data}, message='Subjects fetched successfully.')

#     def create(self, request, *args, **kwargs):
#         ensure_creator_role(request.user)
        
#         # Course থেকে coaching_center automatically নিয়ে নেওয়া
#         course = Course.objects.get(course_id=self.kwargs['course_id'])
        
#         serializer = self.get_serializer(data=request.data)
#         serializer.is_valid(raise_exception=True)
        
#         # coaching_center auto-set from course, course_id from URL
#         subject = serializer.save(
#             course_id=self.kwargs['course_id'],
#             coaching_center=course.coaching_center,  # ← এটাই fix
#         )
#         return success_response(
#             data=SubjectSerializer(subject).data,
#             message='Subject created successfully.',
#             status_code=status.HTTP_201_CREATED,
#         )

# class SubjectDetailView(RetrieveUpdateDestroyAPIView):
#     serializer_class = SubjectSerializer
#     permission_classes = [IsAuthenticated]
#     queryset = Subject.objects.all()
#     lookup_field = 'subject_id'


# class TeacherAssignmentCreateView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         ensure_creator_role(request.user)
#         serializer = TeacherSubjectBatchAssignmentSerializer(
#             data=request.data,
#             context={'request': request},
#         )
#         serializer.is_valid(raise_exception=True)
#         assignment = serializer.save()
#         send_teacher_assignment_email(assignment)
#         return success_response(
#             data=TeacherSubjectBatchAssignmentSerializer(assignment).data,
#             message='Teacher assigned successfully and email sent.',
#             status_code=status.HTTP_201_CREATED,
#         )


# class MaterialListCreateView(ListCreateAPIView):
#     serializer_class = TeachingMaterialSerializer
#     permission_classes = [IsAuthenticated]

#     def get_queryset(self):
#         qs = TeachingMaterial.objects.filter(subject_id=self.kwargs['subject_id'])
#         batch_id = self.request.query_params.get('batch_id')
#         if batch_id:
#             qs = qs.filter(batch_id=batch_id)
#         return qs


# class MaterialDetailView(RetrieveUpdateDestroyAPIView):
#     serializer_class = TeachingMaterialSerializer
#     permission_classes = [IsAuthenticated]
#     queryset = TeachingMaterial.objects.all()
#     lookup_field = 'material_id'

#     def get_queryset(self):
#         return TeachingMaterial.objects.filter(subject__teacher=self.request.user)

# class TeacherAssignmentListView(ListAPIView):
#     """GET /api/v1/teaching/centers/<center_id>/assignments/ - list all teacher assignments for a center"""
#     serializer_class = TeacherSubjectBatchAssignmentSerializer
#     permission_classes = [IsAuthenticated]

#     def get_queryset(self):
#         return TeacherSubjectBatchAssignment.objects.filter(
#             coaching_center_id=self.kwargs['center_id'],
#             is_active=True,
#         ).select_related('teacher', 'subject', 'batch', 'course')

#     def list(self, request, *args, **kwargs):
#         queryset = self.get_queryset()
#         serializer = self.get_serializer(queryset, many=True)
#         return success_response(data={'results': serializer.data}, message='Assignments fetched.')


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

        batch_id = request.data.get('batch')
        subject_id = request.data.get('subject')
        teacher_id = request.data.get('teacher')

        # Upsert: if batch+subject already assigned, update teacher instead of error
        existing = TeacherSubjectBatchAssignment.objects.filter(
            batch_id=batch_id,
            subject_id=subject_id,
        ).first()

        if existing:
            existing.teacher_id = teacher_id
            existing.assigned_by = request.user
            existing.is_active = True
            existing.save(update_fields=['teacher_id', 'assigned_by', 'is_active'])
            try:
                send_teacher_assignment_email(existing)
            except Exception:
                pass
            return success_response(
                data=TeacherSubjectBatchAssignmentSerializer(existing).data,
                message='Teacher re-assigned successfully.',
                status_code=status.HTTP_200_OK,
            )

        # No existing — create new
        serializer = TeacherSubjectBatchAssignmentSerializer(
            data=request.data,
            context={'request': request},
        )
        serializer.is_valid(raise_exception=True)
        assignment = serializer.save()
        try:
            send_teacher_assignment_email(assignment)
        except Exception:
            pass
        return success_response(
            data=TeacherSubjectBatchAssignmentSerializer(assignment).data,
            message='Teacher assigned successfully.',
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


# teaching/views.py এর শেষে এই দুটো class যোগ করুন

class SubjectWithTeachersView(APIView):
    """GET /api/v1/teaching/courses/<course_id>/subjects/with-teachers/
    Course এর সব subjects + কোন teacher কোন batch এ assigned।
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id):
        subjects = Subject.objects.filter(
            course_id=course_id,
            is_active=True,
        ).select_related('teacher')

        assignments = TeacherSubjectBatchAssignment.objects.filter(
            course_id=course_id,
            is_active=True,
        ).select_related('teacher', 'subject', 'batch')

        # group assignments by subject_id
        assign_map = {}
        for a in assignments:
            assign_map.setdefault(a.subject_id, []).append({
                'assignment_id': a.assignment_id,
                'batch_id':      a.batch_id,
                'batch_name':    a.batch.batch_name,
                'teacher_id':    a.teacher.user_id,
                'teacher_name':  a.teacher.name,
                'teacher_email': a.teacher.email,
            })

        data = [
            {
                'subject_id':   s.subject_id,
                'subject_name': s.subject_name,
                'subject_code': s.subject_code,
                'assignments':  assign_map.get(s.subject_id, []),
            }
            for s in subjects
        ]
        return success_response(data={'results': data}, message='Subjects with teachers fetched.')


class CenterAssignmentsListView(APIView):
    """GET /api/v1/teaching/centers/<center_id>/assignments/
    Center এর সব teacher assignments।
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, center_id):
        assignments = TeacherSubjectBatchAssignment.objects.filter(
            coaching_center_id=center_id,
            is_active=True,
        ).select_related('teacher', 'subject', 'batch', 'course')

        data = [
            {
                'assignment_id': a.assignment_id,
                'course':   {'id': a.course_id,   'title': a.course.course_title},
                'batch':    {'id': a.batch_id,    'name':  a.batch.batch_name},
                'subject':  {'id': a.subject_id,  'name':  a.subject.subject_name, 'code': a.subject.subject_code},
                'teacher':  {'id': a.teacher.user_id, 'name': a.teacher.name, 'email': a.teacher.email},
                'assigned_at': a.assigned_at,
            }
            for a in assignments
        ]
        return success_response(data={'results': data}, message='Assignments fetched.')