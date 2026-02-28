from fastapi import FastAPI, Request, Form
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from database import Base, engine, SessionLocal
import models

app = FastAPI(title="Career Guidance App")

templates = Jinja2Templates(directory="templates")

Base.metadata.create_all(bind=engine)


@app.get("/", response_class=HTMLResponse)
def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.post("/recommend", response_class=HTMLResponse)
def recommend(request: Request, skills: str = Form(...)):
    skills_lower = skills.lower()

    if "python" in skills_lower:
        career = "AI/ML Engineer"
    elif "design" in skills_lower:
        career = "UI/UX Designer"
    elif "data" in skills_lower:
        career = "Data Analyst"
    else:
        career = "Software Developer"

    return templates.TemplateResponse(
        "dashboard.html",
        {"request": request, "career": career}
    )
