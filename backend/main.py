from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import database, models, schemas
from core import llm_engine, vector_store, document_parser
import os

app = FastAPI(title="SmartGradeAI API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables
models.Base.metadata.create_all(bind=database.engine)

@app.post("/exams/", response_model=schemas.ExamResponse)
def create_exam(exam: schemas.ExamCreate, db: Session = Depends(database.get_db)):
    db_exam = models.Exam(title=exam.title, description=exam.description)
    db.add(db_exam)
    db.commit()
    db.refresh(db_exam)
    
    for q in exam.questions:
        db_q = models.Question(
            exam_id=db_exam.id,
            question_text=q.question_text,
            rubric_text=q.rubric_text,
            max_marks=q.max_marks
        )
        db.add(db_q)
    db.commit()
    db.refresh(db_exam)
    return db_exam

@app.get("/exams/", response_model=List[schemas.ExamResponse])
def get_exams(db: Session = Depends(database.get_db)):
    return db.query(models.Exam).all()

@app.post("/questions/{question_id}/generate-solution")
def generate_solution(question_id: int, db: Session = Depends(database.get_db)):
    question = db.query(models.Question).filter(models.Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
        
    solution = llm_engine.generate_model_solution(question.question_text, question.rubric_text)
    question.model_solution = solution
    db.commit()
    
    # Vectorize the solution
    chunks = document_parser.chunk_text(solution)
    if chunks:
        ids = [f"q_{question_id}_sol_{i}" for i in range(len(chunks))]
        metadatas = [{"question_id": question_id} for _ in chunks]
        vector_store.add_documents_to_collection("solutions", chunks, ids, metadatas)
        
    return {"message": "Solution generated and vectorized successfully", "solution": solution}

@app.post("/answers/submit", response_model=schemas.AnswerResponse)
def submit_answer(answer: schemas.StudentAnswerSubmit, db: Session = Depends(database.get_db)):
    question = db.query(models.Question).filter(models.Question.id == answer.question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
        
    # Retrieve relevant context
    results = vector_store.query_collection(
        collection_name="solutions",
        query_texts=[answer.answer_text],
        n_results=3
    )
    
    contexts = []
    if results and results.get("documents") and len(results["documents"]) > 0:
        contexts = results["documents"][0]
        
    if not contexts and question.model_solution:
        contexts = [question.model_solution]
        
    evaluation = llm_engine.evaluate_student_answer(answer.answer_text, contexts, question.rubric_text)
    
    score = evaluation.get("score", 0)
    try:
        score = float(score)
        if score > question.max_marks:
            score = question.max_marks
    except ValueError:
        score = 0.0
         
    db_answer = models.StudentAnswer(
        exam_id=answer.exam_id,
        student_id=answer.student_id,
        question_id=answer.question_id,
        answer_text=answer.answer_text,
        score=score,
        feedback=evaluation.get("feedback", "No feedback provided")
    )
    db.add(db_answer)
    db.commit()
    db.refresh(db_answer)
    
    return db_answer

@app.get("/exams/{exam_id}/answers", response_model=List[schemas.AnswerResponse])
def get_exam_answers(exam_id: int, db: Session = Depends(database.get_db)):
    return db.query(models.StudentAnswer).filter(models.StudentAnswer.exam_id == exam_id).all()
