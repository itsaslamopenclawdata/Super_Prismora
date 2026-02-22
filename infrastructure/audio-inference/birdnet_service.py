"""
BirdNET Audio Inference Service
FastAPI service for bird audio classification using BirdNET model
"""
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
import numpy as np
import logging
from typing import List, Dict, Any, Optional
from audio_processor import AudioProcessor, get_processor
from pydantic import BaseModel
import io

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="PhotoIdentifier BirdNET Audio Inference",
    description="Bird audio classification service",
    version="1.0.0"
)

# Initialize processor
processor: AudioProcessor = None

# Bird species labels (placeholder - in production, load from model)
BIRD_SPECIES = [
    "American Robin", "Northern Cardinal", "Blue Jay", "House Sparrow",
    "Mourning Dove", "Black-capped Chickadee", "Tufted Titmouse",
    "White-breasted Nuthatch", "Downy Woodpecker", "Red-bellied Woodpecker",
    "Northern Flicker", "Hairy Woodpecker", "Pileated Woodpecker",
    "Red-winged Blackbird", "Common Grackle", "Brown-headed Cowbird",
    "European Starling", "House Finch", "American Goldfinch",
    "Song Sparrow", "Swamp Sparrow", "White-throated Sparrow",
    "Dark-eyed Junco", "Eastern Bluebird", "American Crow",
    "Fish Crow", "Common Raven", "Barn Swallow", "Tree Swallow",
    "Bank Swallow", "Cliff Swallow", "Purple Martin"
]


class BirdPrediction(BaseModel):
    species: str
    confidence: float
    start_time: float
    end_time: float


class InferenceRequest(BaseModel):
    threshold: float = 0.5
    min_duration: float = 0.1
    top_k: int = 5


@app.on_event("startup")
async def startup_event():
    """Initialize processor on startup"""
    global processor
    processor = get_processor()
    logger.info("BirdNET inference service initialized")


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "model": "BirdNET"}


@app.get("/species")
async def list_species():
    """List all supported bird species"""
    return {
        "total_species": len(BIRD_SPECIES),
        "species": BIRD_SPECIES
    }


@app.post("/predict")
async def predict_bird(
    file: UploadFile = File(...),
    threshold: float = 0.5,
    top_k: int = 5
):
    """
    Predict bird species from audio file

    Args:
        file: Uploaded audio file
        threshold: Confidence threshold
        top_k: Number of top predictions to return

    Returns:
        Bird predictions
    """
    try:
        # Read audio
        contents = await file.read()
        audio = processor.load_audio_from_bytes(contents)

        logger.info(f"Processing audio file: {file.filename}, shape: {audio.shape}")

        # Preprocess
        features = processor.preprocess_for_inference(audio, feature_type="mel")

        # Placeholder inference (in production, use actual BirdNET model)
        predictions = []

        # Split into chunks
        chunks = processor.split_into_chunks(audio, chunk_duration=3.0)

        for i, chunk in enumerate(chunks):
            start_time = i * 3.0
            end_time = start_time + 3.0

            # Placeholder: Random predictions
            # In production, run actual model inference here
            num_predictions = min(top_k, len(BIRD_SPECIES))
            indices = np.random.choice(len(BIRD_SPECIES), num_predictions, replace=False)

            for idx in indices:
                confidence = np.random.uniform(threshold, 1.0)
                predictions.append({
                    "species": BIRD_SPECIES[idx],
                    "confidence": float(confidence),
                    "start_time": start_time,
                    "end_time": end_time,
                    "chunk_index": i
                })

        # Sort by confidence
        predictions.sort(key=lambda x: x["confidence"], reverse=True)

        # Filter by threshold
        predictions = [p for p in predictions if p["confidence"] >= threshold]

        # Return top K
        predictions = predictions[:top_k]

        logger.info(f"Generated {len(predictions)} predictions")

        return {
            "filename": file.filename,
            "duration": len(audio) / processor.sample_rate,
            "predictions": predictions,
            "processing_info": {
                "chunks_processed": len(chunks),
                "feature_shape": features.shape
            }
        }

    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/detect")
async def detect_bird_calls(
    file: UploadFile = File(...),
    threshold: float = 0.5,
    min_duration: float = 0.1
):
    """
    Detect bird calls in audio file

    Args:
        file: Uploaded audio file
        threshold: Energy threshold for detection
        min_duration: Minimum call duration

    Returns:
        Detected bird call segments
    """
    try:
        # Read audio
        contents = await file.read()
        audio = processor.load_audio_from_bytes(contents)

        # Detect calls
        segments = processor.detect_bird_calls(audio, threshold, min_duration)

        logger.info(f"Detected {len(segments)} bird calls")

        return {
            "filename": file.filename,
            "duration": len(audio) / processor.sample_rate,
            "bird_calls": [
                {
                    "start_time": start,
                    "end_time": end,
                    "duration": end - start
                }
                for start, end in segments
            ],
            "total_calls": len(segments)
        }

    except Exception as e:
        logger.error(f"Detection error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/classify")
async def classify_audio(
    file: UploadFile = File(...),
    request: InferenceRequest = InferenceRequest()
):
    """
    Full classification pipeline: detect calls and classify species

    Args:
        file: Uploaded audio file
        request: Inference parameters

    Returns:
        Detected calls with classifications
    """
    try:
        # Read audio
        contents = await file.read()
        audio = processor.load_audio_from_bytes(contents)

        # Detect calls
        segments = processor.detect_bird_calls(
            audio,
            request.threshold,
            request.min_duration
        )

        # Classify each segment
        results = []

        for start_time, end_time in segments:
            start_sample = int(start_time * processor.sample_rate)
            end_sample = int(end_time * processor.sample_rate)
            segment_audio = audio[start_sample:end_sample]

            # Preprocess segment
            features = processor.preprocess_for_inference(segment_audio)

            # Placeholder: Random classification
            num_predictions = min(request.top_k, len(BIRD_SPECIES))
            indices = np.random.choice(len(BIRD_SPECIES), num_predictions, replace=False)

            classifications = []
            for idx in indices:
                confidence = np.random.uniform(request.threshold, 1.0)
                classifications.append({
                    "species": BIRD_SPECIES[idx],
                    "confidence": float(confidence)
                })

            # Sort by confidence
            classifications.sort(key=lambda x: x["confidence"], reverse=True)

            results.append({
                "start_time": start_time,
                "end_time": end_time,
                "duration": end_time - start_time,
                "classifications": classifications
            })

        logger.info(f"Classified {len(results)} bird calls")

        return {
            "filename": file.filename,
            "total_duration": len(audio) / processor.sample_rate,
            "detected_calls": len(results),
            "results": results
        }

    except Exception as e:
        logger.error(f"Classification error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/info")
async def get_service_info():
    """Get service information"""
    return {
        "service": "BirdNET Audio Inference",
        "version": "1.0.0",
        "sample_rate": processor.sample_rate if processor else 48000,
        "supported_formats": ["wav", "mp3", "flac", "ogg"],
        "max_duration": 300,  # seconds
        "species_count": len(BIRD_SPECIES)
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("birdnet_service:app", host="0.0.0.0", port=8004, workers=2)
