import io
from fastapi import APIRouter, File, Form, UploadFile
from fastapi.responses import StreamingResponse
from services.bg_removal import remove_background

router = APIRouter()


@router.post("/upload")
async def upload_clothing(
    file: UploadFile = File(...),
    type: str = Form(...),
):
    image_bytes = await file.read()
    processed = remove_background(image_bytes)
    return StreamingResponse(
        io.BytesIO(processed),
        media_type="image/png",
        headers={"X-Clothing-Type": type},
    )
