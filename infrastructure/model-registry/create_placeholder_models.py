"""
Create Placeholder Models for Testing
Generates simple TensorFlow and ONNX models for testing infrastructure
"""
import tensorflow as tf
import numpy as np
from pathlib import Path
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def create_tensorflow_model(model_path: str, model_name: str):
    """Create a simple TensorFlow model for testing"""
    logger.info(f"Creating TensorFlow model: {model_name}")

    # Create a simple CNN model
    model = tf.keras.Sequential([
        tf.keras.layers.Input(shape=(224, 224, 3)),
        tf.keras.layers.Conv2D(32, 3, activation='relu'),
        tf.keras.layers.MaxPooling2D(),
        tf.keras.layers.Conv2D(64, 3, activation='relu'),
        tf.keras.layers.MaxPooling2D(),
        tf.keras.layers.Conv2D(128, 3, activation='relu'),
        tf.keras.layers.MaxPooling2D(),
        tf.keras.layers.Flatten(),
        tf.keras.layers.Dense(256, activation='relu'),
        tf.keras.layers.Dropout(0.5),
        tf.keras.layers.Dense(10, activation='softmax')
    ])

    # Compile model
    model.compile(
        optimizer='adam',
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )

    # Save as SavedModel
    Path(model_path).mkdir(parents=True, exist_ok=True)
    save_path = f"{model_path}/{model_name}"
    model.save(save_path)

    logger.info(f"Saved TensorFlow model to {save_path}")

    # Test loading
    loaded = tf.keras.models.load_model(save_path)
    logger.info(f"Test loaded model input shape: {loaded.input_shape}")
    logger.info(f"Test loaded model output shape: {loaded.output_shape}")

    return save_path


def create_onnx_model(output_path: str, model_name: str):
    """Create a simple ONNX model for testing"""
    logger.info(f"Creating ONNX model: {model_name}")

    try:
        import onnx
        from onnx import helper, TensorProto
        import tf2onnx

        # Create a simple TensorFlow model first
        model = tf.keras.Sequential([
            tf.keras.layers.Input(shape=(224, 224, 3)),
            tf.keras.layers.Conv2D(32, 3, activation='relu'),
            tf.keras.layers.MaxPooling2D(),
            tf.keras.layers.Flatten(),
            tf.keras.layers.Dense(10, activation='softmax')
        ])

        # Compile model
        model.compile(optimizer='adam', loss='categorical_crossentropy')

        # Convert to ONNX
        Path(output_path).mkdir(parents=True, exist_ok=True)
        onnx_path = f"{output_path}/{model_name}.onnx"

        # Convert using tf2onnx
        onnx_model, _ = tf2onnx.convert.from_keras(model)
        with open(onnx_path, 'wb') as f:
            f.write(onnx_model.SerializeToString())

        logger.info(f"Saved ONNX model to {onnx_path}")

        # Verify model
        loaded_model = onnx.load(onnx_path)
        onnx.checker.check_model(loaded_model)
        logger.info(f"ONNX model is valid")

        return onnx_path

    except ImportError as e:
        logger.warning(f"Cannot create ONNX model (missing dependencies): {e}")
        return None


def create_face_recognition_model(model_path: str):
    """Create a simple face recognition model placeholder"""
    logger.info("Creating face recognition model")

    # Face recognition model (160x160 input, 128-dim embedding)
    model = tf.keras.Sequential([
        tf.keras.layers.Input(shape=(160, 160, 3)),
        tf.keras.layers.Conv2D(64, 3, activation='relu'),
        tf.keras.layers.MaxPooling2D(),
        tf.keras.layers.Conv2D(128, 3, activation='relu'),
        tf.keras.layers.MaxPooling2D(),
        tf.keras.layers.Conv2D(256, 3, activation='relu'),
        tf.keras.layers.MaxPooling2D(),
        tf.keras.layers.Flatten(),
        tf.keras.layers.Dense(512, activation='relu'),
        tf.keras.layers.Dense(128, activation='linear')  # 128-dim embedding
    ])

    # Compile
    model.compile(optimizer='adam', loss='mse')

    # Save
    Path(model_path).mkdir(parents=True, exist_ok=True)
    save_path = f"{model_path}/face_recognition"
    model.save(save_path)

    logger.info(f"Saved face recognition model to {save_path}")
    return save_path


def create_object_detection_model(model_path: str):
    """Create a simple object detection model placeholder"""
    logger.info("Creating object detection model")

    # YOLO-style model (640x640 input, 8400*84 output)
    model = tf.keras.Sequential([
        tf.keras.layers.Input(shape=(640, 640, 3)),
        tf.keras.layers.Conv2D(32, 3, activation='relu'),
        tf.keras.layers.MaxPooling2D(),
        tf.keras.layers.Conv2D(64, 3, activation='relu'),
        tf.keras.layers.MaxPooling2D(),
        tf.keras.layers.Conv2D(128, 3, activation='relu'),
        tf.keras.layers.Flatten(),
        tf.keras.layers.Dense(8400 * 84, activation='sigmoid'),
        tf.keras.layers.Reshape((8400, 84))
    ])

    # Compile
    model.compile(optimizer='adam', loss='mse')

    # Save
    Path(model_path).mkdir(parents=True, exist_ok=True)
    save_path = f"{model_path}/object_detector"
    model.save(save_path)

    logger.info(f"Saved object detection model to {save_path}")
    return save_path


def create_model_info_json(output_dir: str):
    """Create a JSON file with model information"""
    import json

    models_info = {
        "image_classifier": {
            "type": "classification",
            "input_shape": [1, 224, 224, 3],
            "output_shape": [1, 10],
            "format": "tensorflow_saved_model",
            "classes": 10
        },
        "mobilenet_v3": {
            "type": "classification",
            "input_shape": [1, 3, 224, 224],  # NCHW format for ONNX
            "output_shape": [1, 10],
            "format": "onnx",
            "classes": 10
        },
        "face_recognition": {
            "type": "face_recognition",
            "input_shape": [1, 160, 160, 3],
            "output_shape": [1, 128],
            "format": "tensorflow_saved_model",
            "embedding_dim": 128
        },
        "object_detector": {
            "type": "object_detection",
            "input_shape": [1, 640, 640, 3],
            "output_shape": [1, 8400, 84],
            "format": "tensorflow_saved_model",
            "num_detections": 8400
        }
    }

    info_path = f"{output_dir}/models_info.json"
    with open(info_path, 'w') as f:
        json.dump(models_info, f, indent=2)

    logger.info(f"Saved models info to {info_path}")
    return info_path


def main():
    """Main function to create all placeholder models"""
    logger.info("Starting placeholder model creation...")

    # Base output directory
    output_base = Path(__file__).parent / "placeholder_models"
    tf_models_dir = output_base / "tensorflow"
    onnx_models_dir = output_base / "onnx"

    # Create TensorFlow models
    logger.info("\n=== Creating TensorFlow Models ===")
    create_tensorflow_model(str(tf_models_dir / "image_classifier"), "1")
    create_face_recognition_model(str(tf_models_dir))
    create_object_detection_model(str(tf_models_dir))

    # Create ONNX models
    logger.info("\n=== Creating ONNX Models ===")
    create_onnx_model(str(onnx_models_dir), "mobilenet_v3")
    create_onnx_model(str(onnx_models_dir), "yolov8n")

    # Create models info
    create_model_info_json(str(output_base))

    logger.info("\n=== Model Creation Complete ===")
    logger.info(f"All models saved to: {output_base}")
    logger.info("\nModels created:")
    logger.info(f"  TensorFlow: {list(tf_models_dir.rglob('saved_model.pb'))}")
    logger.info(f"  ONNX: {list(onnx_models_dir.glob('*.onnx'))}")


if __name__ == "__main__":
    main()
