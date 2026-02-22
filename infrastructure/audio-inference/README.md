# BirdNET Audio Inference Service

## Overview
FastAPI service for bird audio classification using BirdNET model.

## Features

- **Bird Species Classification**: Identify bird species from audio
- **Call Detection**: Detect bird calls in audio files
- **Audio Preprocessing**: Mel spectrogram and MFCC feature extraction
- **Chunk-based Processing**: Process long audio files in chunks
- **Multiple Formats**: Support for WAV, MP3, FLAC, OGG
- **Batch Processing**: Process multiple audio segments

## Supported Audio Formats

- WAV
- MP3
- FLAC
- OGG

## Running

### Start Service
```bash
cd infrastructure/audio-inference
docker-compose up -d
```

### Check Status
```bash
docker-compose ps
curl http://localhost:8004/health
```

### Stop Service
```bash
docker-compose down
```

## API Endpoints

### Health Check
```bash
curl http://localhost:8004/health
```

Response:
```json
{
  "status": "healthy",
  "model": "BirdNET"
}
```

### List Supported Species
```bash
curl http://localhost:8004/species
```

Response:
```json
{
  "total_species": 30,
  "species": [
    "American Robin",
    "Northern Cardinal",
    "Blue Jay",
    ...
  ]
}
```

### Predict Bird Species
```bash
curl -X POST http://localhost:8004/predict \
  -F "file=@bird_audio.wav" \
  -F "threshold=0.5" \
  -F "top_k=5"
```

Parameters:
- `file`: Audio file to classify
- `threshold`: Minimum confidence threshold (default: 0.5)
- `top_k`: Number of top predictions (default: 5)

Response:
```json
{
  "filename": "bird_audio.wav",
  "duration": 12.5,
  "predictions": [
    {
      "species": "American Robin",
      "confidence": 0.95,
      "start_time": 0.0,
      "end_time": 3.0,
      "chunk_index": 0
    },
    ...
  ],
  "processing_info": {
    "chunks_processed": 4,
    "feature_shape": [1, 128, 282, 1]
  }
}
```

### Detect Bird Calls
```bash
curl -X POST http://localhost:8004/detect \
  -F "file=@bird_audio.wav" \
  -F "threshold=0.5" \
  -F "min_duration=0.1"
```

Parameters:
- `file`: Audio file to analyze
- `threshold`: Energy threshold (default: 0.5)
- `min_duration`: Minimum call duration in seconds (default: 0.1)

Response:
```json
{
  "filename": "bird_audio.wav",
  "duration": 12.5,
  "bird_calls": [
    {
      "start_time": 1.2,
      "end_time": 2.8,
      "duration": 1.6
    },
    ...
  ],
  "total_calls": 3
}
```

### Classify with Detection
```bash
curl -X POST http://localhost:8004/classify \
  -F "file=@bird_audio.wav"
```

Parameters (JSON body):
- `threshold`: Confidence threshold (default: 0.5)
- `min_duration`: Minimum call duration (default: 0.1)
- `top_k`: Number of top predictions per call (default: 5)

Response:
```json
{
  "filename": "bird_audio.wav",
  "total_duration": 12.5,
  "detected_calls": 3,
  "results": [
    {
      "start_time": 1.2,
      "end_time": 2.8,
      "duration": 1.6,
      "classifications": [
        {
          "species": "American Robin",
          "confidence": 0.95
        },
        ...
      ]
    },
    ...
  ]
}
```

### Get Service Info
```bash
curl http://localhost:8004/info
```

Response:
```json
{
  "service": "BirdNET Audio Inference",
  "version": "1.0.0",
  "sample_rate": 48000,
  "supported_formats": ["wav", "mp3", "flac", "ogg"],
  "max_duration": 300,
  "species_count": 30
}
```

## Usage Examples

### Python Client
```python
import requests

# Predict bird species
with open('bird_audio.wav', 'rb') as f:
    response = requests.post(
        'http://localhost:8004/predict',
        files={'file': f},
        data={'threshold': 0.5, 'top_k': 5}
    )
    result = response.json()

for prediction in result['predictions']:
    print(f"{prediction['species']}: {prediction['confidence']:.2%}")
```

### JavaScript Client
```javascript
const formData = new FormData();
formData.append('file', audioFile);
formData.append('threshold', '0.5');
formData.append('top_k', '5');

const response = await fetch('http://localhost:8004/predict', {
    method: 'POST',
    body: formData
});
const result = await response.json();

result.predictions.forEach(pred => {
    console.log(`${pred.species}: ${(pred.confidence * 100).toFixed(2)}%`);
});
```

## Audio Processing Pipeline

1. **Load Audio**: Load audio file and resample to 48kHz
2. **Trim Silence**: Remove quiet segments
3. **Split Chunks**: Divide into 3-second chunks
4. **Extract Features**: Compute mel spectrogram
5. **Inference**: Run BirdNET model
6. **Post-processing**: Filter and rank predictions

## Configuration

### Audio Parameters
Edit `audio_processor.py`:

```python
processor = AudioProcessor(
    sample_rate=48000,
    duration=3.0,
    n_mels=128,
    n_fft=2048,
    hop_length=512
)
```

### Resource Limits
Edit `docker-compose.yml`:

```yaml
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 4G
```

## Monitoring

### View Logs
```bash
docker-compose logs -f birdnet-service
```

### Performance Metrics
The service logs:
- Audio loading time
- Feature extraction time
- Inference time
- Number of predictions

## Troubleshooting

### Audio Loading Errors
```bash
# Check audio format
ffprobe bird_audio.wav

# Test with known good audio
curl -X POST http://localhost:8004/predict \
  -F "file=@test.wav"
```

### Memory Issues
Reduce resource limits or chunk size:

```python
processor = AudioProcessor(duration=1.5)  # Smaller chunks
```

### No Predictions
Lower threshold:
```bash
curl -X POST http://localhost:8004/predict \
  -F "file=@audio.wav" \
  -F "threshold=0.3"
```

## Production Notes

**Note**: The current implementation uses placeholder predictions. For production:

1. Download trained BirdNET model
2. Load model in `birdnet_service.py`
3. Replace placeholder inference with actual model predictions
4. Update species list from model
5. Test with real bird audio data

## Next Steps

- Integrate real BirdNET model
- Add species confidence calibration
- Implement audio visualization
- Add batch processing endpoint
- Implement audio augmentation for training
- Add real-time streaming support
