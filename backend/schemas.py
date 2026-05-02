from pydantic import BaseModel, ConfigDict
from typing import Optional, List
import datetime

class QuestionCreate(BaseModel):
    question_text: str
    rubric_text: str
    max_marks: float

class ExamCreate(BaseModel):
    title: str
    description: Optional[str] = None
    questions: List[QuestionCreate]

class QuestionResponse(BaseModel):
    id: int
    question_text: str
    rubric_text: str
    max_marks: float
    model_solution: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class ExamResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    created_at: datetime.datetime
    questions: List[QuestionResponse] = []
    model_config = ConfigDict(from_attributes=True)

class StudentAnswerSubmit(BaseModel):
    exam_id: int
    student_id: str
    question_id: int
    answer_text: str

class AnswerResponse(BaseModel):
    id: int
    exam_id: int
    student_id: str
    question_id: int
    score: Optional[float]
    feedback: Optional[str]
    model_config = ConfigDict(from_attributes=True)
