"""
ONNX Model Loader for PhotoIdentifier
Handles loading and managing ONNX models
"""
import onnxruntime as ort
import numpy as np
from typing import Dict, Any, Optional
from pathlib import Path
import logging

logger = logging.getLogger(__name__)


class ONNXModelLoader:
    """Manages ONNX model loading and inference"""

    def __init__(self, model_dir: str = "/models/onnx"):
        self.model_dir = Path(model_dir)
        self.sessions: Dict[str, ort.InferenceSession] = {}
        self.model_metadata: Dict[str, Dict[str, Any]] = {}

        # Load models at startup
        self._load_available_models()

    def _load_available_models(self):
        """Load all available ONNX models from the model directory"""
        logger.info(f"Scanning for models in {self.model_dir}")

        if not self.model_dir.exists():
            logger.warning(f"Model directory {self.model_dir} does not exist")
            return

        # Find all .onnx files
        model_files = list(self.model_dir.glob("**/*.onnx"))

        for model_path in model_files:
            model_name = model_path.stem
            try:
                self._load_model(model_name, str(model_path))
            except Exception as e:
                logger.error(f"Failed to load model {model_name}: {e}")

        logger.info(f"Loaded {len(self.sessions)} models successfully")

    def _load_model(self, name: str, path: str):
        """Load a single ONNX model"""
        logger.info(f"Loading model: {name} from {path}")

        # Create inference session
        session = ort.InferenceSession(
            path,
            providers=['CUDAExecutionProvider', 'CPUExecutionProvider']
        )

        # Extract metadata
        self.sessions[name] = session
        self.model_metadata[name] = {
            'path': path,
            'inputs': {inp.name: inp for inp in session.get_inputs()},
            'outputs': {out.name: out for out in session.get_outputs()},
            'provider': session.get_providers()[0]
        }

        logger.info(f"Model {name} loaded successfully with provider: {session.get_providers()[0]}")

    def get_model(self, name: str) -> Optional[ort.InferenceSession]:
        """Get a loaded model by name"""
        return self.sessions.get(name)

    def get_model_metadata(self, name: str) -> Optional[Dict[str, Any]]:
        """Get metadata for a model"""
        return self.model_metadata.get(name)

    def list_models(self) -> list[str]:
        """List all available models"""
        return list(self.sessions.keys())

    def predict(self, model_name: str, inputs: Dict[str, np.ndarray]) -> Dict[str, np.ndarray]:
        """Run inference on a model"""
        if model_name not in self.sessions:
            raise ValueError(f"Model {model_name} not found")

        session = self.sessions[model_name]

        # Validate inputs
        for input_name, input_array in inputs.items():
            if input_name not in [inp.name for inp in session.get_inputs()]:
                raise ValueError(f"Invalid input name: {input_name}")

        # Run inference
        outputs = session.run(None, inputs)

        # Map outputs to names
        output_names = [out.name for out in session.get_outputs()]
        return dict(zip(output_names, outputs))

    def preprocess_image(self, image: np.ndarray, target_size: tuple = (224, 224)) -> np.ndarray:
        """Preprocess image for model input"""
        from PIL import Image

        # Convert to PIL Image if needed
        if image.dtype != np.uint8:
            image = (image * 255).astype(np.uint8)

        pil_image = Image.fromarray(image)

        # Resize
        pil_image = pil_image.resize(target_size, Image.Resampling.BILINEAR)

        # Convert to numpy and normalize
        image_array = np.array(pil_image, dtype=np.float32)
        image_array = image_array / 255.0  # Normalize to [0, 1]

        # Add batch dimension
        image_array = np.expand_dims(image_array, axis=0)

        # Transpose to NCHW format if needed (NHWC -> NCHW)
        image_array = np.transpose(image_array, (0, 3, 1, 2))

        return image_array

    def reload_model(self, name: str):
        """Reload a model from disk"""
        if name in self.sessions:
            del self.sessions[name]
            del self.model_metadata[name]

        model_path = self.model_dir / f"{name}.onnx"
        if model_path.exists():
            self._load_model(name, str(model_path))
            logger.info(f"Model {name} reloaded successfully")
        else:
            raise FileNotFoundError(f"Model file not found: {model_path}")


# Global model loader instance
model_loader = None


def get_model_loader() -> ONNXModelLoader:
    """Get the global model loader instance"""
    global model_loader
    if model_loader is None:
        model_loader = ONNXModelLoader()
    return model_loader
