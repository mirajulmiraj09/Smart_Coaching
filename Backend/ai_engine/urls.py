from django.urls import path

from ai_engine.views import (
    EvaluateDescriptiveView,
    EvaluationLogListView,
    GenerateQuestionsView,
)

urlpatterns = [
    path('llm/generate-questions/', GenerateQuestionsView.as_view(), name='llm-generate-questions'),
    path('llm/evaluate-descriptive/', EvaluateDescriptiveView.as_view(), name='llm-evaluate-descriptive'),
    path('llm/logs/<int:exam_id>/', EvaluationLogListView.as_view(), name='llm-evaluation-logs'),
]
