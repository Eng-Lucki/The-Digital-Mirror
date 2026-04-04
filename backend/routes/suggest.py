from fastapi import APIRouter
from pydantic import BaseModel
from services.color_analysis import generate_suggestions

router = APIRouter()


class SuggestRequest(BaseModel):
    colors: list[str]


@router.post("/suggest")
def suggest_outfit(body: SuggestRequest):
    return generate_suggestions(body.colors)
