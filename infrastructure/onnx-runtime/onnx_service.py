"""
ONNX Runtime REST API Service
FastAPI service for serving ONNX models
"""
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
import numpy as np
from PIL import Image
import io
import logging
from typing import Dict, Any
from model_loader import get_model_loader, ONNXModelLoader
import uvicorn

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="PhotoIdentifier ONNX Runtime Service",
    description="FastAPI service for running ONNX models",
    version="1.0.0"
)

# Initialize model loader
model_loader: ONNXModelLoader = None


@app.on_event("startup")
async def startup_event():
    """Initialize model loader on startup"""
    global model_loader
    model_loader = get_model_loader()
    logger.info(f"Loaded {len(model_loader.list_models())} models")


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "models_loaded": len(model_loader.list_models()) if model_loader else 0
    }


@app.get("/models")
async def list_models():
    """List all available models"""
    if not model_loader:
        return {"models": []}

    models_info = {}
    for model_name in model_loader.list_models():
        metadata = model_loader.get_model_metadata(model_name)
        models_info[model_name] = {
            "inputs": [inp.shape for inp in metadata['inputs'].values()],
            "outputs": [out.shape for out in metadata['outputs'].values()],
            "provider": metadata['provider']
        }

    return {"models": models_info}


@app.get("/models/{model_name}")
async def get_model_info(model_name: str):
    """Get information about a specific model"""
    if not model_loader:
        raise HTTPException(status_code=503, detail="Model loader not initialized")

    metadata = model_loader.get_model_metadata(model_name)
    if not metadata:
        raise HTTPException(status_code=404, detail=f"Model {model_name} not found")

    return {
        "name": model_name,
        "path": metadata['path'],
        "inputs": {
            name: {
                "shape": inp.shape,
                "type": str(inp.type)
            }
            for name, inp in metadata['inputs'].items()
        },
        "outputs": {
            name: {
                "shape": out.shape,
                "type": str(out.type)
            }
            for name, out in metadata['outputs'].items()
        },
        "provider": metadata['provider']
    }


@app.post("/predict/{model_name}")
async def predict_model(model_name: str, file: UploadFile = File(...)):
    """
    Run inference on an uploaded image

    Args:
        model_name: Name of the model to use
        file: Uploaded image file

    Returns:
        Model prediction results
    """
    if not model_loader:
        raise HTTPException(status_code=503, detail="Model loader not initialized")

    # Check if model exists
    if model_name not in model_loader.list_models():
        raise HTTPException(status_code=404, detail=f"Model {model_name} not found")

    try:
        # Read image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))

        # Convert to RGB if needed
        if image.mode != 'RGB':
            image = image.convert('RGB')

        # Convert to numpy array
        image_array = np.array(image)

        # Preprocess image
        processed_image = model_loader.preprocess_image(image_array)

        # Get model inputs
        metadata = model_loader.get_model_metadata(model_name)
        input_names = list(metadata['inputs'].keys())

        # Prepare inputs
        inputs = {input_names[0]: processed_image}

        # Run inference
        outputs = model_loader.predict(model_name, inputs)

        # Convert outputs to JSON-serializable format
        results = {}
        for name, output in outputs.items():
            if output.ndim == 1:
                results[name] = output.tolist()
            elif output.ndim == 2:
                results[name] = [row.tolist() for row in output]
            else:
                results[name] = output.flatten().tolist()

        return {
            "model": model_name,
            "prediction": results,
            "input_shape": processed_image.shape
        }

    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/reload/{model_name}")
async def reload_model(model_name: str):
    """Reload a model from disk"""
    if not model_loader:
        raise HTTPException(status_code=503, detail="Model loader not initialized")

    try:
        model_loader.reload_model(model_name)
        return {"status": "success", "message": f"Model {model_name} reloaded"}
    except Exception as e:
        logger.error(f"Reload error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run("onnx_service:app", host="0.0.0.0", port=8000, workers=4)
