from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import engine, Base, get_db
from app.models import Task
from app.schemas import TaskCreate, TaskUpdate, TaskResponse

# Створення таблиць в БД при старті
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TaskFlow Hub API",
    description="Modern and high-performance task management API built with FastAPI",
    version="1.0.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json"
)

# Налаштування CORS для підключення фронтенду
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "taskflow-backend"}

@app.get("/api/tasks", response_model=List[TaskResponse])
def get_tasks(completed: Optional[bool] = None, db: Session = Depends(get_db)):
    query = db.query(Task)
    if completed is not None:
        query = query.filter(Task.completed == completed)
    return query.order_by(Task.created_at.desc()).all()

@app.post("/api/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(task_in: TaskCreate, db: Session = Depends(get_db)):
    db_task = Task(
        title=task_in.title,
        description=task_in.description,
        priority=task_in.priority
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@app.get("/api/tasks/{task_id}", response_model=TaskResponse)
def get_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@app.patch("/api/tasks/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, task_in: TaskUpdate, db: Session = Depends(get_db)):
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    update_data = task_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_task, field, value)
        
    db.commit()
    db.refresh(db_task)
    return db_task

@app.delete("/api/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(db_task)
    db.commit()
    return None

@app.get("/api/stats")
def get_stats(db: Session = Depends(get_db)):
    total = db.query(Task).count()
    completed = db.query(Task).filter(Task.completed == True).count()
    pending = total - completed
    percentage = (completed / total * 100) if total > 0 else 0
    
    # Пріоритети
    high_count = db.query(Task).filter(Task.priority == "high").count()
    medium_count = db.query(Task).filter(Task.priority == "medium").count()
    low_count = db.query(Task).filter(Task.priority == "low").count()
    
    return {
        "total": total,
        "completed": completed,
        "pending": pending,
        "percentage": round(percentage, 1),
        "priority_stats": {
            "high": high_count,
            "medium": medium_count,
            "low": low_count
        }
    }
