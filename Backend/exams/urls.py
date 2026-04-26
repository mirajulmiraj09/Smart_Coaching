from django.urls import path

from exams.views import (
    AnswerReviewListView,
    BatchResultListView,
    FinalizeResultsView,
    ManualReviewView,
    PublishResultsView,
)

urlpatterns = [
    path('<int:exam_id>/review/', ManualReviewView.as_view(), name='exam-manual-review'),
    path('<int:exam_id>/finalize/', FinalizeResultsView.as_view(), name='exam-finalize-results'),
    path('<int:exam_id>/publish/', PublishResultsView.as_view(), name='exam-publish-results'),
    path('<int:exam_id>/results/', BatchResultListView.as_view(), name='exam-batch-results'),
    path('<int:exam_id>/answers/', AnswerReviewListView.as_view(), name='exam-answer-review-list'),
]
