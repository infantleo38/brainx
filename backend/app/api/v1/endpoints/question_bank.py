from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
import json

from app.api.deps import get_db
from app.models.assessment import Assessment
from app.models.course import Course
from app.services.bunny_service import bunny_service

router = APIRouter()

@router.get("/")
async def get_question_bank(
    category: Optional[str] = Query(None, description="Filter by category"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty (Easy, Medium, Hard)"),
    question_type: Optional[str] = Query(None, description="Filter by question type (Multiple Choice, True/False, etc)"),
    course_id: Optional[int] = Query(None, description="Filter by course ID"),
    search: Optional[str] = Query(None, description="Search in question text"),
    db: AsyncSession = Depends(get_db)
):
    """
    Fetch all questions from all assessments with optional filtering.
    Aggregates questions from all assessment JSON files stored in Bunny storage.
    """
    print("=== Question Bank API Called ===")
    print(f"Filters: category={category}, difficulty={difficulty}, question_type={question_type}, course_id={course_id}, search={search}")
    
    # Fetch all assessments with their template URLs
    stmt = select(Assessment, Course.title).join(Course, Assessment.course_id == Course.id)
    
    if course_id:
        stmt = stmt.filter(Assessment.course_id == course_id)
    
    result = await db.execute(stmt)
    rows = result.all()
    
    print(f"Found {len(rows)} assessments in database")
    
    if not rows:
        print("No assessments found in database")
        return {"questions": [], "total": 0, "error": "No assessments found in database"}
    
    # Aggregate questions from all assessments
    all_questions = []
    errors = []
    
    for assessment, course_title in rows:
        print(f"\nProcessing Assessment ID: {assessment.id}, Title: {assessment.title}")
        print(f"  Template URL: {assessment.template_url}")
        
        if not assessment.template_url:
            print(f"  ⚠️ Assessment {assessment.id} has no template_url - skipping")
            errors.append(f"Assessment '{assessment.title}' has no template URL")
            continue
            
        try:
            # Fetch questions from Bunny storage
            print(f"  Fetching questions from Bunny storage...")
            questions_data = await bunny_service.download_json(assessment.template_url)
            print(f"  Downloaded data structure: {list(questions_data.keys())}")
            
            questions = questions_data.get("questions", [])
            print(f"  Found {len(questions)} questions in this assessment")
            
            if len(questions) == 0:
                print(f"  ⚠️ No questions array in downloaded data")
                errors.append(f"Assessment '{assessment.title}' has no questions in stored data")
            
            # Add metadata to each question
            for idx, question in enumerate(questions):
                print(f"    Question {idx + 1}: {question.get('text', 'No text')[:50]}...")
                question_with_meta = {
                    **question,
                    "assessment_id": assessment.id,
                    "assessment_title": assessment.title,
                    "course_id": assessment.course_id,
                    "course_name": course_title,
                    "created_at": assessment.created_at.isoformat() if assessment.created_at else None
                }
                all_questions.append(question_with_meta)
                
        except Exception as e:
            error_msg = f"Failed to fetch questions from assessment {assessment.id} ({assessment.title}): {str(e)}"
            print(f"  ❌ {error_msg}")
            errors.append(error_msg)
            continue
    
    print(f"\n=== Total questions aggregated: {len(all_questions)} ===")
    
    # Apply filters
    filtered_questions = all_questions
    
    if difficulty:
        filtered_questions = [q for q in filtered_questions if q.get("difficulty", "").lower() == difficulty.lower()]
        print(f"After difficulty filter: {len(filtered_questions)} questions")
    
    if question_type:
        filtered_questions = [q for q in filtered_questions if q.get("type", "") == question_type]
        print(f"After question_type filter: {len(filtered_questions)} questions")
    
    if category:
        filtered_questions = [q for q in filtered_questions if q.get("category", "").lower() == category.lower()]
        print(f"After category filter: {len(filtered_questions)} questions")
    
    if search:
        search_lower = search.lower()
        filtered_questions = [
            q for q in filtered_questions 
            if search_lower in q.get("text", "").lower()
        ]
        print(f"After search filter: {len(filtered_questions)} questions")
    
    print(f"Final filtered count: {len(filtered_questions)}")
    print("=== End Question Bank API ===\n")
    
    return {
        "questions": filtered_questions,
        "total": len(filtered_questions),
        "debug_info": {
            "total_assessments": len(rows),
            "errors": errors if errors else None
        }
    }

@router.get("/{question_id}")
async def get_question_by_id(
    question_id: str,
    assessment_id: int = Query(..., description="Assessment ID where question belongs"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get a specific question by its ID from an assessment.
    """
    # Fetch assessment
    result = await db.execute(select(Assessment).filter(Assessment.id == assessment_id))
    assessment = result.scalars().first()
    
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    
    if not assessment.template_url:
        raise HTTPException(status_code=404, detail="Assessment has no questions")
    
    try:
        questions_data = await bunny_service.download_json(assessment.template_url)
        questions = questions_data.get("questions", [])
        
        # Find question by ID
        question = next((q for q in questions if str(q.get("id")) == str(question_id)), None)
        
        if not question:
            raise HTTPException(status_code=404, detail="Question not found")
        
        return question
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch question: {str(e)}")
