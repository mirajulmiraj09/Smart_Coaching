from django.db import models


class QuestionType(models.TextChoices):
	TRUE_FALSE = 'true_false', 'True/False'
	MCQ = 'mcq', 'MCQ'
	DESCRIPTIVE = 'descriptive', 'Descriptive'


class DifficultyLevel(models.TextChoices):
	EASY = 'easy', 'Easy'
	MEDIUM = 'medium', 'Medium'
	HARD = 'hard', 'Hard'


class QuestionSource(models.TextChoices):
	MANUAL = 'manual', 'Manual'
	LLM = 'llm', 'LLM'


class ExamType(models.TextChoices):
	REGULAR = 'regular', 'Regular'
	LIVE_QUIZ = 'live_quiz', 'Live Quiz'


class ExamStatus(models.TextChoices):
	SCHEDULED = 'scheduled', 'Scheduled'
	ONGOING = 'ongoing', 'Ongoing'
	COMPLETED = 'completed', 'Completed'


class AnswerStatus(models.TextChoices):
	RUNNING = 'running', 'Running'
	SUBMITTED = 'submitted', 'Submitted'
	CHECKED = 'checked', 'Checked'


class ResultStatus(models.TextChoices):
	PASS = 'pass', 'Pass'
	FAIL = 'fail', 'Fail'


class QuestionBank(models.Model):
	question_id = models.BigAutoField(primary_key=True)
	subject = models.ForeignKey(
		'teaching.Subject',
		on_delete=models.PROTECT,
		related_name='questions',
		db_column='subject_id',
	)
	question_text = models.TextField()
	question_type = models.CharField(max_length=20, choices=QuestionType.choices)
	difficulty = models.CharField(max_length=20, choices=DifficultyLevel.choices, default=DifficultyLevel.MEDIUM)
	max_marks = models.PositiveIntegerField(default=1)
	source = models.CharField(max_length=20, choices=QuestionSource.choices, default=QuestionSource.MANUAL)
	created_by = models.ForeignKey(
		'accounts.User',
		on_delete=models.SET_NULL,
		null=True,
		related_name='created_questions',
		db_column='created_by_user_id',
	)

	option_a = models.TextField(blank=True)
	option_b = models.TextField(blank=True)
	option_c = models.TextField(blank=True)
	option_d = models.TextField(blank=True)
	correct_option = models.CharField(max_length=1, blank=True)

	expected_answer = models.TextField(blank=True)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		db_table = 'question_bank'

	def __str__(self):
		return f'Q{self.question_id}: {self.question_text[:60]}'


class Exam(models.Model):
	exam_id = models.BigAutoField(primary_key=True)
	subject = models.ForeignKey(
		'teaching.Subject',
		on_delete=models.PROTECT,
		related_name='exams',
		db_column='subject_id',
	)
	batch = models.ForeignKey(
		'academics.Batch',
		on_delete=models.PROTECT,
		related_name='exams',
		db_column='batch_id',
	)
	exam_type = models.CharField(max_length=20, choices=ExamType.choices)
	host_teacher = models.ForeignKey(
		'accounts.User',
		on_delete=models.SET_NULL,
		null=True,
		related_name='hosted_exams',
		db_column='host_teacher_id',
	)
	title = models.CharField(max_length=255)
	total_marks = models.DecimalField(max_digits=6, decimal_places=2, default=0)
	pass_marks = models.DecimalField(max_digits=6, decimal_places=2, default=0)
	duration_minutes = models.PositiveIntegerField()
	start_time = models.DateTimeField(null=True, blank=True)
	end_time = models.DateTimeField(null=True, blank=True)
	status = models.CharField(max_length=20, choices=ExamStatus.choices, default=ExamStatus.SCHEDULED)
	access_code = models.CharField(max_length=20, blank=True)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		db_table = 'exams'

	def __str__(self):
		return f'{self.title} ({self.exam_type})'


class ExamQuestion(models.Model):
	exam_question_id = models.BigAutoField(primary_key=True)
	exam = models.ForeignKey(
		Exam,
		on_delete=models.CASCADE,
		related_name='exam_slots',
		db_column='exam_id',
	)
	question = models.ForeignKey(
		QuestionBank,
		on_delete=models.PROTECT,
		related_name='exam_mappings',
		db_column='question_id',
	)
	question_order = models.PositiveIntegerField(default=1)
	question_marks = models.DecimalField(max_digits=5, decimal_places=2, default=1)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		db_table = 'exam_questions'
		unique_together = ('exam', 'question')
		ordering = ('question_order',)


class StudentAnswer(models.Model):
	answer_id = models.BigAutoField(primary_key=True)
	exam = models.ForeignKey(
		Exam,
		on_delete=models.CASCADE,
		related_name='student_answers',
		db_column='exam_id',
	)
	student = models.ForeignKey(
		'accounts.User',
		on_delete=models.PROTECT,
		related_name='exam_answers',
		db_column='student_user_id',
	)
	question = models.ForeignKey(
		QuestionBank,
		on_delete=models.PROTECT,
		related_name='student_answers',
		db_column='question_id',
	)
	selected_option = models.CharField(max_length=1, blank=True)
	descriptive_answer = models.TextField(blank=True)
	marks_obtained = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
	evaluated_by = models.ForeignKey(
		'accounts.User',
		on_delete=models.SET_NULL,
		null=True,
		blank=True,
		related_name='evaluated_answers',
		db_column='evaluated_by_user_id',
	)
	confidence_score = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
	feedback = models.TextField(blank=True)
	answer_status = models.CharField(max_length=20, choices=AnswerStatus.choices, default=AnswerStatus.SUBMITTED)
	answered_at = models.DateTimeField(auto_now_add=True)
	evaluated_at = models.DateTimeField(null=True, blank=True)

	class Meta:
		db_table = 'student_answers'
		unique_together = ('exam', 'student', 'question')


class ExamResult(models.Model):
	result_id = models.BigAutoField(primary_key=True)
	exam = models.ForeignKey(
		Exam,
		on_delete=models.CASCADE,
		related_name='results',
		db_column='exam_id',
	)
	student = models.ForeignKey(
		'accounts.User',
		on_delete=models.PROTECT,
		related_name='exam_results',
		db_column='student_user_id',
	)
	total_marks_obtained = models.DecimalField(max_digits=6, decimal_places=2, default=0)
	total_marks = models.DecimalField(max_digits=6, decimal_places=2, default=0)
	percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
	grade = models.CharField(max_length=10, blank=True)
	result_status = models.CharField(max_length=10, choices=ResultStatus.choices)
	published_at = models.DateTimeField(null=True, blank=True)

	class Meta:
		db_table = 'exam_results'
		unique_together = ('exam', 'student')
