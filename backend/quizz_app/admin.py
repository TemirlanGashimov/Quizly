"""Django admin configuration for quiz and question editing."""

from django.contrib import admin
from .models import Question, Quiz


class QuestionInline(admin.TabularInline):
    """Allow questions to be edited from their parent quiz."""

    model = Question
    extra = 0


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    """Configure searchable quiz administration with inline questions."""

    list_display = ("title", "user", "created_at", "updated_at")
    list_filter = ("created_at", "updated_at")
    search_fields = ("title", "description", "user__username")
    inlines = (QuestionInline,)


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    """Expose questions for standalone administration and searching."""

    list_display = ("question_title", "quiz", "updated_at")
    search_fields = ("question_title", "quiz__title")
