from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
import enum
from app.db.base import Base

class AssessmentType(str, enum.Enum):
    exam = "exam"
    quiz = "quiz"
    homework = "homework"

class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    batch_id = Column(Integer, ForeignKey("batches.id"), nullable=False)
    title = Column(String, index=True, nullable=False)
    type = Column(Enum(AssessmentType), default=AssessmentType.quiz)
    total_marks = Column(Integer, default=100)
    due_date = Column(DateTime(timezone=True), nullable=True)
    template_url = Column(String, nullable=True) # URL to Bunny.net JSON storage
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Quiz Settings
    time_limit_minutes = Column(Integer, nullable=True)  # Time limit in minutes
    passing_score = Column(Integer, default=70)  # Passing score percentage
    shuffle_questions = Column(Integer, default=0)  # 0 = False, 1 = True (SQLite compatibility)
    show_results_immediately = Column(Integer, default=1)  # 0 = False, 1 = True
    assigned_to = Column(Text, default="entire_batch")  # "entire_batch" or JSON array of student IDs

    # Relationships
    course = relationship("Course", backref="assessments")
    batch = relationship("Batch", backref="assessments")
    submissions = relationship("AssessmentSubmission", back_populates="assessment")

class AssessmentSubmission(Base):
    __tablename__ = "assessment_submissions"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=False)
    student_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    marks_obtained = Column(Integer, nullable=True)
    response_data = Column(Text, nullable=True)  # JSON string of student answers
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())

    assessment = relationship("Assessment", back_populates="submissions")
    student = relationship("User", backref="assessment_submissions")
