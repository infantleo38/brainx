from pydantic import BaseModel
from typing import Optional, List, Any, Dict
from datetime import datetime
from app.models.assessment import AssessmentType

class AssessmentBase(BaseModel):
    title: str
    course_id: int
    batch_id: int
    type: AssessmentType = AssessmentType.quiz
    total_marks: int = 100
    due_date: Optional[datetime] = None
    time_limit_minutes: Optional[int] = None
    passing_score: int = 70
    shuffle_questions: bool = False
    show_results_immediately: bool = True
    assigned_to: str = "entire_batch"

class AssessmentCreate(AssessmentBase):
    questions: Dict[str, Any] # JSON structure of questions

class AssessmentUpdate(BaseModel):
    title: Optional[str] = None
    type: Optional[AssessmentType] = None
    total_marks: Optional[int] = None
    due_date: Optional[datetime] = None
    questions: Optional[Dict[str, Any]] = None

class AssessmentInDBBase(AssessmentBase):
    id: int
    template_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class Assessment(AssessmentInDBBase):
    pass

class AssessmentResponse(AssessmentInDBBase):
    course_name: Optional[str] = None
    batch_name: Optional[str] = None

class AssessmentWithQuestions(AssessmentResponse):
    questions: Dict[str, Any]  # Full questions data from Bunny.net

class SubmissionCreate(BaseModel):
    assessment_id: int
    answers: Dict[str, Any]  # Map of question_id to user's answer

class SubmissionResponse(BaseModel):
    id: int
    assessment_id: int
    student_id: str
    marks_obtained: Optional[int] = None
    submitted_at: datetime
    show_results: bool = False
    
    class Config:
        from_attributes = True

# New schemas for submission tracking
class StudentSubmissionResponse(BaseModel):
    id: int
    assessment_id: int
    assessment_title: str
    course_name: str
    batch_name: str
    marks_obtained: int
    total_marks: int
    percentage: float
    submitted_at: datetime
    response_data: Dict[str, Any]  # Student's answers
    show_results: bool
    passed: bool
    questions: Optional[Dict[str, Any]] = None  # If show_results is true
    
    class Config:
        from_attributes = True

class SubmissionWithStudent(BaseModel):
    submission_id: Optional[int] = None
    student_id: str
    student_name: str
    student_email: str
    marks_obtained: Optional[int] = None
    percentage: Optional[float] = None
    submitted_at: Optional[datetime] = None
    status: str  # "submitted" or "pending"

class AssessmentWithSubmissions(AssessmentResponse):
    submissions: List[SubmissionWithStudent]
    total_students: int
    submitted_count: int
    pending_count: int
    average_score: Optional[float] = None
