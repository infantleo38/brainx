from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Any
from datetime import datetime
import json

from app.api.deps import get_db, get_current_user
from app.models.assessment import Assessment, AssessmentSubmission
from app.schemas.assessment import (
    AssessmentCreate, AssessmentResponse, AssessmentWithQuestions,
    SubmissionCreate, SubmissionResponse, StudentSubmissionResponse,
    SubmissionWithStudent, AssessmentWithSubmissions
)
from app.services.bunny_service import bunny_service
from app.models.course import Course
from app.models.batch import Batch
from app.models.user import User

router = APIRouter()

@router.post("/", response_model=AssessmentResponse)
async def create_assessment(
    assessment_in: AssessmentCreate,
    db: AsyncSession = Depends(get_db)
):
    # Retrieve Course Name for filename
    result_course = await db.execute(select(Course).filter(Course.id == assessment_in.course_id))
    course = result_course.scalars().first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    result_batch = await db.execute(select(Batch).filter(Batch.id == assessment_in.batch_id))
    batch = result_batch.scalars().first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    # Generate Filename: batch_id_coursename_timestamp.json
    safe_course_title = "".join(c for c in course.title if c.isalnum() or c in (' ', '_', '-')).rstrip()
    safe_course_title = safe_course_title.replace(" ", "_")
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    filename = f"{assessment_in.batch_id}_{safe_course_title}_{timestamp}.json"

    # Upload Questions to Bunny.net
    template_url = await bunny_service.upload_json(assessment_in.questions, filename)

    # Create Assessment Record in DB with quiz settings
    assessment = Assessment(
        course_id=assessment_in.course_id,
        batch_id=assessment_in.batch_id,
        title=assessment_in.title,
        type=assessment_in.type,
        total_marks=assessment_in.total_marks,
        due_date=assessment_in.due_date,
        template_url=template_url,
        time_limit_minutes=assessment_in.time_limit_minutes,
        passing_score=assessment_in.passing_score,
        shuffle_questions=1 if assessment_in.shuffle_questions else 0,
        show_results_immediately=1 if assessment_in.show_results_immediately else 0,
        assigned_to=assessment_in.assigned_to
    )
    
    db.add(assessment)
    await db.commit()
    await db.refresh(assessment)
    
    # Populate names for response
    assessment.course_name = course.title
    assessment.batch_name = batch.batch_name
    
    return assessment

@router.get("/", response_model=List[AssessmentResponse])
async def read_assessments(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    # Join with Course and Batch to get names
    stmt = select(Assessment, Course.title, Batch.batch_name)\
        .join(Course, Assessment.course_id == Course.id)\
        .join(Batch, Assessment.batch_id == Batch.id)\
        .offset(skip).limit(limit)
        
    result = await db.execute(stmt)
    rows = result.all()
    
    # Map results to AssessmentResponse
    response = []
    for assessment, course_title, batch_name in rows:
        assessment.course_name = course_title
        assessment.batch_name = batch_name
        response.append(assessment)
        
    return response

@router.get("/{assessment_id}", response_model=AssessmentResponse)
async def read_assessment(
    assessment_id: int,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Assessment, Course.title, Batch.batch_name)\
        .join(Course, Assessment.course_id == Course.id)\
        .join(Batch, Assessment.batch_id == Batch.id)\
        .filter(Assessment.id == assessment_id)
        
    result = await db.execute(stmt)
    row = result.first()
    
    if not row:
        raise HTTPException(status_code=404, detail="Assessment not found")
        
    assessment, course_title, batch_name = row
    assessment.course_name = course_title
    assessment.batch_name = batch_name
    
    return assessment

@router.get("/{assessment_id}/full", response_model=AssessmentWithQuestions)
async def get_assessment_with_questions(
    assessment_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get assessment with full questions data from Bunny.net"""
    stmt = select(Assessment, Course.title, Batch.batch_name)\
        .join(Course, Assessment.course_id == Course.id)\
        .join(Batch, Assessment.batch_id == Batch.id)\
        .filter(Assessment.id == assessment_id)
        
    result = await db.execute(stmt)
    row = result.first()
    
    if not row:
        raise HTTPException(status_code=404, detail="Assessment not found")
        
    assessment, course_title, batch_name = row
    assessment.course_name = course_title
    assessment.batch_name = batch_name
    
    # Fetch questions from Bunny.net
    if assessment.template_url:
        try:
            questions_data = await bunny_service.download_json(assessment.template_url)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to fetch questions: {str(e)}")
    else:
        questions_data = {}
    
    # Convert boolean fields for response
    response_dict = {
        "id": assessment.id,
        "course_id": assessment.course_id,
        "batch_id": assessment.batch_id,
        "title": assessment.title,
        "type": assessment.type,
        "total_marks": assessment.total_marks,
        "due_date": assessment.due_date,
        "template_url": assessment.template_url,
        "created_at": assessment.created_at,
        "time_limit_minutes": assessment.time_limit_minutes,
        "passing_score": assessment.passing_score,
        "shuffle_questions": bool(assessment.shuffle_questions),
        "show_results_immediately": bool(assessment.show_results_immediately),
        "assigned_to": assessment.assigned_to,
        "course_name": course_title,
        "batch_name": batch_name,
        "questions": questions_data
    }
    
    return response_dict

@router.get("/student/assigned", response_model=List[dict])
async def get_student_assessments(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get assessments assigned to the current student with submission status"""
    # Get student's batch
    # Note: Assuming user has a batch_id field or relationship
    # Adjust based on your actual User model
    
    stmt = select(Assessment, Course.title, Batch.batch_name)\
        .join(Course, Assessment.course_id == Course.id)\
        .join(Batch, Assessment.batch_id == Batch.id)
        
    result = await db.execute(stmt)
    rows = result.all()
    
    # Get all submissions for current student
    submissions_stmt = select(AssessmentSubmission).filter(
        AssessmentSubmission.student_id == current_user.id
    )
    submissions_result = await db.execute(submissions_stmt)
    submissions = submissions_result.scalars().all()
    
    # Create submission map: assessment_id -> submission
    submission_map = {sub.assessment_id: sub for sub in submissions}
    
    # Filter assessments assigned to this student
    response = []
    for assessment, course_title, batch_name in rows:
        # Check if assigned to entire batch or specific student
        if assessment.assigned_to == "entire_batch":
            # Include if student is in this batch
            # You may need to add batch filtering based on user's batch
            submission = submission_map.get(assessment.id)
            
            assessment_data = {
                "id": assessment.id,
                "course_id": assessment.course_id,
                "batch_id": assessment.batch_id,
                "title": assessment.title,
                "type": assessment.type,
                "total_marks": assessment.total_marks,
                "due_date": assessment.due_date,
                "template_url": assessment.template_url,
                "created_at": assessment.created_at,
                "time_limit_minutes": assessment.time_limit_minutes,
                "passing_score": assessment.passing_score,
                "shuffle_questions": bool(assessment.shuffle_questions),
                "show_results_immediately": bool(assessment.show_results_immediately),
                "assigned_to": assessment.assigned_to,
                "course_name": course_title,
                "batch_name": batch_name,
                "has_submitted": submission is not None,
                "submission_id": submission.id if submission else None,
                "marks_obtained": submission.marks_obtained if submission else None
            }
            response.append(assessment_data)
        else:
            # Check if student ID is in assigned_to JSON
            try:
                assigned_ids = json.loads(assessment.assigned_to)
                if str(current_user.id) in assigned_ids:
                    submission = submission_map.get(assessment.id)
                    
                    assessment_data = {
                        "id": assessment.id,
                        "course_id": assessment.course_id,
                        "batch_id": assessment.batch_id,
                        "title": assessment.title,
                        "type": assessment.type,
                        "total_marks": assessment.total_marks,
                        "due_date": assessment.due_date,
                        "template_url": assessment.template_url,
                        "created_at": assessment.created_at,
                        "time_limit_minutes": assessment.time_limit_minutes,
                        "passing_score": assessment.passing_score,
                        "shuffle_questions": bool(assessment.shuffle_questions),
                        "show_results_immediately": bool(assessment.show_results_immediately),
                        "assigned_to": assessment.assigned_to,
                        "course_name": course_title,
                        "batch_name": batch_name,
                        "has_submitted": submission is not None,
                        "submission_id": submission.id if submission else None,
                        "marks_obtained": submission.marks_obtained if submission else None
                    }
                    response.append(assessment_data)
            except:
                pass
                
    return response

@router.post("/{assessment_id}/submit", response_model=SubmissionResponse)
async def submit_assessment(
    assessment_id: int,
    submission_in: SubmissionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Submit assessment answers and calculate score"""
    # Fetch assessment
    result = await db.execute(select(Assessment).filter(Assessment.id == assessment_id))
    assessment = result.scalars().first()
    
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    
    # Fetch questions from Bunny.net
    if not assessment.template_url:
        raise HTTPException(status_code=400, detail="Assessment has no questions")
    
    try:
        questions_data = await bunny_service.download_json(assessment.template_url)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch questions: {str(e)}")
    
    # Calculate score
    total_points = 0
    earned_points = 0
    
    questions = questions_data.get("questions", [])
    for question in questions:
        q_id = str(question.get("id"))
        correct_answer = question.get("correctOption") or question.get("correctAnswer")
        points = question.get("points", 0)
        total_points += points
        
        user_answer = submission_in.answers.get(q_id)
        if user_answer is not None and user_answer == correct_answer:
            earned_points += points
    
    # Save submission
    submission = AssessmentSubmission(
        assessment_id=assessment_id,
        student_id=current_user.id,
        marks_obtained=earned_points,
        response_data=json.dumps(submission_in.answers)
    )
    
    db.add(submission)
    await db.commit()
    await db.refresh(submission)
    
    # Return response
    return SubmissionResponse(
        id=submission.id,
        assessment_id=submission.assessment_id,
        student_id=str(submission.student_id),
        marks_obtained=submission.marks_obtained,
        submitted_at=submission.submitted_at,
        show_results=bool(assessment.show_results_immediately)
    )

@router.get("/{assessment_id}/my-submission", response_model=StudentSubmissionResponse)
async def get_my_submission(
    assessment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get the current student's submission for an assessment"""
    # Fetch assessment
    stmt = select(Assessment, Course.title, Batch.batch_name)\
        .join(Course, Assessment.course_id == Course.id)\
        .join(Batch, Assessment.batch_id == Batch.id)\
        .filter(Assessment.id == assessment_id)
        
    result = await db.execute(stmt)
    row = result.first()
    
    if not row:
        raise HTTPException(status_code=404, detail="Assessment not found")
        
    assessment, course_title, batch_name = row
    
    # Fetch submission
    submission_stmt = select(AssessmentSubmission).filter(
        AssessmentSubmission.assessment_id == assessment_id,
        AssessmentSubmission.student_id == current_user.id
    )
    submission_result = await db.execute(submission_stmt)
    submission = submission_result.scalars().first()
    
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    # Calculate percentage
    percentage = (submission.marks_obtained / assessment.total_marks) * 100 if assessment.total_marks > 0 else 0
    passed = percentage >= assessment.passing_score
    
    # Parse response data
    response_data = json.loads(submission.response_data) if submission.response_data else {}
    
    # Build response
    response = {
        "id": submission.id,
        "assessment_id": assessment.id,
        "assessment_title": assessment.title,
        "course_name": course_title,
        "batch_name": batch_name,
        "marks_obtained": submission.marks_obtained,
        "total_marks": assessment.total_marks,
        "percentage": round(percentage, 2),
        "submitted_at": submission.submitted_at,
        "response_data": response_data,
        "show_results": bool(assessment.show_results_immediately),
        "passed": passed,
        "questions": None
    }
    
    # If show_results is enabled, fetch questions data
    if assessment.show_results_immediately and assessment.template_url:
        try:
            questions_data = await bunny_service.download_json(assessment.template_url)
            response["questions"] = questions_data
        except Exception as e:
            print(f"Failed to fetch questions: {str(e)}")
    
    return response

@router.get("/{assessment_id}/submissions", response_model=AssessmentWithSubmissions)
async def get_assessment_submissions(
    assessment_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get all submissions for an assessment (for teachers)"""
    # Fetch assessment
    stmt = select(Assessment, Course.title, Batch.batch_name)\
        .join(Course, Assessment.course_id == Course.id)\
        .join(Batch, Assessment.batch_id == Batch.id)\
        .filter(Assessment.id == assessment_id)
        
    result = await db.execute(stmt)
    row = result.first()
    
    if not row:
        raise HTTPException(status_code=404, detail="Assessment not found")
        
    assessment, course_title, batch_name = row
    
    # Get all students in the batch
    from app.models.batch import BatchMember, BatchMemberRole
    students_stmt = select(User).join(BatchMember, User.id == BatchMember.user_id).filter(
        BatchMember.batch_id == assessment.batch_id,
        BatchMember.role == BatchMemberRole.student
    )
    students_result = await db.execute(students_stmt)
    students = students_result.scalars().all()
    
    # Get all submissions for this assessment
    submissions_stmt = select(AssessmentSubmission).filter(
        AssessmentSubmission.assessment_id == assessment_id
    )
    submissions_result = await db.execute(submissions_stmt)
    submissions = submissions_result.scalars().all()
    
    # Create submission map
    submission_map = {str(sub.student_id): sub for sub in submissions}
    
    # Build response with student info
    submissions_with_students = []
    total_percentage = 0
    submitted_count = 0
    
    for student in students:
        student_id_str = str(student.id)
        submission = submission_map.get(student_id_str)
        
        if submission:
            percentage = (submission.marks_obtained / assessment.total_marks) * 100 if assessment.total_marks > 0 else 0
            submissions_with_students.append({
                "submission_id": submission.id,
                "student_id": student_id_str,
                "student_name": student.full_name,
                "student_email": student.email,
                "marks_obtained": submission.marks_obtained,
                "total_marks": assessment.total_marks,
                "percentage": round(percentage, 2),
                "submitted_at": submission.submitted_at,
                "status": "submitted"
            })
            total_percentage += percentage
            submitted_count += 1
        else:
            submissions_with_students.append({
                "student_id": student_id_str,
                "student_name": student.full_name,
                "student_email": student.email,
                "marks_obtained": None,
                "total_marks": assessment.total_marks,
                "submitted_at": None,
                "status": "pending"
            })
    
    average_score = round(total_percentage / submitted_count, 2) if submitted_count > 0 else None
    
    return {
        **assessment.__dict__,
        "course_name": course_title,
        "batch_name": batch_name,
        "submissions": submissions_with_students,
        "total_students": len(students),
        "submitted_count": submitted_count,
        "pending_count": len(students) - submitted_count,
        "average_score": average_score
    }

