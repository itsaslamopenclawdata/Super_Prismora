"""
Preprocessing Service API
FastAPI service for image preprocessing
"""
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import JSONResponse
import numpy as np
import io
import logging
from typing import Dict, Any, Optional
from preprocessor import ImagePreprocessor, PreprocessingMode, get_preprocessor
import base64

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="PhotoIdentifier Preprocessing Service",
    description="Image preprocessing pipeline for AI models",
    version="1.0.0"
)

# Initialize preprocessor
preprocessor: ImagePreprocessor = None


@app.on_event("startup")
async def startup_event():
    """Initialize preprocessor on startup"""
    global preprocessor
    preprocessor = get_preprocessor()
    logger.info("Preprocessing service initialized")


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


@app.post("/preprocess")
async def preprocess_image(
    file: UploadFile = File(...),
    mode: str = Form("classification"),
    size: Optional[str] = Form(None),
    enhance: bool = Form(False)
):
    """
    Preprocess an image for AI model inference

    Args:
        file: Uploaded image file
        mode: Preprocessing mode (classification, object_detection, face_recognition, segmentation)
        size: Target size as "width,height" (e.g., "224,224")
        enhance: Whether to auto-enhance image

    Returns:
        Preprocessed image data
    """
    try:
        # Read image
        contents = await file.read()
        image = preprocessor.load_image(contents)

        # Auto-enhance if requested
        if enhance:
            image = preprocessor.auto_enhance(image)

        # Parse mode
        try:
            preprocessing_mode = PreprocessingMode(mode)
        except ValueError:
            raise ValueError(f"Invalid mode: {mode}. Valid modes: {[m.value for m in PreprocessingMode]}")

        # Parse size
        target_size = None
        if size:
            try:
                width, height = map(int, size.split(','))
                target_size = (width, height)
            except ValueError:
                raise ValueError(f"Invalid size format: {size}. Expected: 'width,height'")

        # Preprocess
        processed = preprocessor.preprocess_for_mode(image, preprocessing_mode, target_size)

        # Convert to base64 for JSON response
        processed_bytes = processed.astype(np.float32).tobytes()
        processed_b64 = base64.b64encode(processed_bytes).decode('utf-8')

        return {
            "status": "success",
            "mode": mode,
            "shape": processed.shape,
            "dtype": str(processed.dtype),
            "data": processed_b64
        }

    except Exception as e:
        logger.error(f"Preprocessing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/resize")
async def resize_image(
    file: UploadFile = File(...),
    width: int = Form(...),
    height: int = Form(...),
    maintain_aspect_ratio: bool = Form(True),
    method: str = Form("bilinear")
):
    """Resize image to specified dimensions"""
    try:
        contents = await file.read()
        image = preprocessor.load_image(contents)
        resized = preprocessor.resize_image(image, (width, height), maintain_aspect_ratio, method)

        # Convert back to image bytes
        if resized.dtype != np.uint8:
            resized = (resized * 255).astype(np.uint8)

        pil_image = Image.fromarray(resized)
        img_byte_arr = io.BytesIO()
        pil_image.save(img_byte_arr, format='PNG')
        img_byte_arr = img_byte_arr.getvalue()

        return {
            "status": "success",
            "original_shape": image.shape,
            "resized_shape": resized.shape,
            "data": base64.b64encode(img_byte_arr).decode('utf-8')
        }

    except Exception as e:
        logger.error(f"Resize error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/normalize")
async def normalize_image(
    file: UploadFile = File(...),
    mean: Optional[str] = Form(None),
    std: Optional[str] = Form(None),
    scale: float = Form(255.0)
):
    """Normalize image"""
    try:
        contents = await file.read()
        image = preprocessor.load_image(contents)

        # Parse mean and std
        mean_list = None
        std_list = None
        if mean:
            mean_list = [float(x) for x in mean.split(',')]
        if std:
            std_list = [float(x) for x in std.split(',')]

        normalized = preprocessor.normalize_image(image, mean_list, std_list, scale)

        return {
            "status": "success",
            "shape": normalized.shape,
            "dtype": str(normalized.dtype),
            "data": normalized.tolist()
        }

    except Exception as e:
        logger.error(f"Normalization error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/enhance")
async def enhance_image(
    file: UploadFile = File(...),
    brightness: float = Form(1.0),
    contrast: float = Form(1.0),
    saturation: float = Form(1.0),
    sharpness: float = Form(1.0)
):
    """Enhance image quality"""
    try:
        contents = await file.read()
        image = preprocessor.load_image(contents)
        enhanced = preprocessor.enhance_image(image, brightness, contrast, saturation, sharpness)

        # Convert back to image bytes
        pil_image = Image.fromarray(enhanced)
        img_byte_arr = io.BytesIO()
        pil_image.save(img_byte_arr, format='PNG')
        img_byte_arr = img_byte_arr.getvalue()

        return {
            "status": "success",
            "data": base64.b64encode(img_byte_arr).decode('utf-8')
        }

    except Exception as e:
        logger.error(f"Enhance error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("preprocessing_service:app", host="0.0.0.0", port=8002, workers=2)
