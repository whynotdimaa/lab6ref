from sqlalchemy import Column, Integer, String, Boolean, DateTime, func
from .database import Base

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    description = Column(String, nullable=True)
    completed = Column(Boolean, default=False)
    priority = Column(String, default="medium")  # low, medium, high
    created_at = Column(DateTime(timezone=True), server_default=func.now())
