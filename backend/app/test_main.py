from fastapi.testclient import TestClient
from .main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy", "service": "taskflow-backend"}

def test_create_task():
    task_data = {"title": "Learn Docker and CI/CD", "description": "Finish Laboratory 6 task", "priority": "high"}
    response = client.post("/api/tasks", json=task_data)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Learn Docker and CI/CD"
    assert data["completed"] is False
    assert data["priority"] == "high"
    assert "id" in data

def test_get_tasks():
    response = client.get("/api/tasks")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1

def test_get_stats():
    response = client.get("/api/stats")
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert "completed" in data
    assert "pending" in data
