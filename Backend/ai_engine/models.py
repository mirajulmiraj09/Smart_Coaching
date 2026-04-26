from django.db import models


class LLMEvaluationLog(models.Model):
    evaluation_log_id = models.BigAutoField(primary_key=True)
    question = models.ForeignKey(
        'exams.QuestionBank',
        on_delete=models.PROTECT,
        related_name='evaluation_logs',
        db_column='question_id'
    )
    answer = models.ForeignKey(
        'exams.StudentAnswer',
        on_delete=models.PROTECT,
        related_name='evaluation_logs',
        db_column='answer_id'
    )
    llm_user = models.ForeignKey(
        'accounts.User',
        on_delete=models.PROTECT,
        related_name='llm_logs',
        db_column='llm_user_id'
    )
    model_name = models.CharField(max_length=100)
    scoring_rubric = models.TextField()
    confidence_score = models.DecimalField(max_digits=4, decimal_places=2)
    feedback = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'llm_evaluation_logs'

    def __str__(self):
        return f'LLM eval: answer {self.answer_id} (confidence: {self.confidence_score})'