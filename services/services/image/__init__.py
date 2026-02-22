from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import os
import uuid
from PIL import Image
from io import BytesIO
from app.database import get_db
from app.config import get_settings

settings = get_settings()
router = APIRouter(prefix="/api/v1/images", tags=["images"])


@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Upload an image file.

    Supported formats: JPG, JPEG, PNG, GIF, WebP
    Maximum size: 10MB
    """
    # Validate file extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed: {', '.join(settings.ALLOWED_EXTENSIONS)}",
        )

    # Generate unique filename
    filename = f"{uuid.uuid4()}{ext}"
    filepath = os.path.join(settings.UPLOAD_DIR, filename)

    # Create upload directory if it doesn't exist
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    # Read and validate file content
    try:
        contents = await file.read()

        # Validate it's actually an image
        image = Image.open(BytesIO(contents))
        image.verify()

        # Save file
        with open(filepath, "wb") as f:
            f.write(contents)

        return {
            "id": str(uuid.uuid4()),
            "filename": filename,
            "original_filename": file.filename,
            "size": len(contents),
            "width": image.width if hasattr(image, "width") else 0,
            "height": image.height if hasattr(image, "height") else 0,
            "format": image.format,
            "url": f"/api/v1/images/{filename}",
        }

    except Exception as e:
        # Clean up file if it was created
        if os.path.exists(filepath):
            os.remove(filepath)

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid image file: {str(e)}",
        )


@router.post("/upload/multiple", status_code=status.HTTP_201_CREATED)
async def upload_multiple_images(
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
):
    """
    Upload multiple image files at once.

    Maximum: 10 files per request
    """
    if len(files) > 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 10 files allowed per upload",
        )

    results = []
    errors = []

    for i, file in enumerate(files):
        try:
            # Validate file extension
            ext = os.path.splitext(file.filename)[1].lower()
            if ext not in settings.ALLOWED_EXTENSIONS:
                errors.append({
                    "filename": file.filename,
                    "error": f"Invalid file type: {ext}",
                })
                continue

            # Generate unique filename
            filename = f"{uuid.uuid4()}{ext}"
            filepath = os.path.join(settings.UPLOAD_DIR, filename)

            # Read and save file
            contents = await file.read()
            image = Image.open(BytesIO(contents))
            image.verify()

            with open(filepath, "wb") as f:
                f.write(contents)

            results.append({
                "id": str(uuid.uuid4()),
                "filename": filename,
                "original_filename": file.filename,
                "size": len(contents),
                "width": image.width if hasattr(image, "width") else 0,
                "height": image.height if hasattr(image, "height") else 0,
                "format": image.format,
                "url": f"/api/v1/images/{filename}",
            })

        except Exception as e:
            errors.append({
                "filename": file.filename,
                "error": str(e),
            })

    return {
        "uploaded": len(results),
        "failed": len(errors),
        "images": results,
        "errors": errors,
    }


@router.get("/{filename}")
async def get_image(filename: str):
    """
    Serve an uploaded image file.
    """
    filepath = os.path.join(settings.UPLOAD_DIR, filename)

    if not os.path.exists(filepath):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found",
        )

    # Return file
    from fastapi.responses import FileResponse

    return FileResponse(filepath)


@router.delete("/{filename}")
async def delete_image(filename: str, db: Session = Depends(get_db)):
    """
    Delete an uploaded image file.
    """
    filepath = os.path.join(settings.UPLOAD_DIR, filename)

    if not os.path.exists(filepath):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found",
        )

    os.remove(filepath)

    return {
        "message": "Image deleted successfully",
        "filename": filename,
    }


@router.get("/{filename}/info")
async def get_image_info(filename: str, db: Session = Depends(get_db)):
    """
    Get metadata about an uploaded image.
    """
    filepath = os.path.join(settings.UPLOAD_DIR, filename)

    if not os.path.exists(filepath):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found",
        )

    try:
        with Image.open(filepath) as image:
            file_stat = os.stat(filepath)

            return {
                "filename": filename,
                "format": image.format,
                "mode": image.mode,
                "size": file_stat.st_size,
                "width": image.width,
                "height": image.height,
                "created_at": file_stat.st_ctime,
                "modified_at": file_stat.st_mtime,
            }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error reading image: {str(e)}",
        )


@router.post("/process/resize")
async def resize_image(
    filename: str,
    width: int,
    height: int = None,
    db: Session = Depends(get_db),
):
    """
    Resize an image to specified dimensions.

    If height is not provided, maintains aspect ratio.
    """
    filepath = os.path.join(settings.UPLOAD_DIR, filename)

    if not os.path.exists(filepath):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found",
        )

    try:
        with Image.open(filepath) as image:
            # Calculate height if not provided
            if height is None:
                aspect_ratio = image.height / image.width
                height = int(width * aspect_ratio)

            # Resize image
            resized = image.resize((width, height), Image.Resampling.LANCZOS)

            # Save resized image
            resized_filename = f"{uuid.uuid4()}_resized{os.path.splitext(filename)[1]}"
            resized_path = os.path.join(settings.UPLOAD_DIR, resized_filename)
            resized.save(resized_path)

            return {
                "original": filename,
                "resized": resized_filename,
                "width": width,
                "height": height,
                "url": f"/api/v1/images/{resized_filename}",
            }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error resizing image: {str(e)}",
        )


@router.get("/stats")
async def get_upload_stats(db: Session = Depends(get_db)):
    """
    Get statistics about uploaded images.
    """
    upload_dir = settings.UPLOAD_DIR

    if not os.path.exists(upload_dir):
        return {
            "total_images": 0,
            "total_size": 0,
            "formats": {},
        }

    images = []
    total_size = 0
    formats = {}

    for filename in os.listdir(upload_dir):
        filepath = os.path.join(upload_dir, filename)

        if os.path.isfile(filepath):
            try:
                with Image.open(filepath) as image:
                    file_stat = os.stat(filepath)
                    total_size += file_stat.st_size

                    fmt = image.format or "unknown"
                    formats[fmt] = formats.get(fmt, 0) + 1

                    images.append({
                        "filename": filename,
                        "format": fmt,
                        "size": file_stat.st_size,
                        "width": image.width,
                        "height": image.height,
                    })

            except Exception:
                pass

    return {
        "total_images": len(images),
        "total_size": total_size,
        "total_size_mb": round(total_size / (1024 * 1024), 2),
        "formats": formats,
        "recent_uploads": sorted(images, key=lambda x: x["filename"], reverse=True)[:10],
    }
