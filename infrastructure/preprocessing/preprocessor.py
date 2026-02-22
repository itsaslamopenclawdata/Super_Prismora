"""
Image Preprocessing Pipeline
Handles image preprocessing for AI models
"""
import numpy as np
from PIL import Image, ImageOps, ImageEnhance
import cv2
from typing import Dict, Any, Optional, Tuple, List
import logging
from enum import Enum

logger = logging.getLogger(__name__)


class PreprocessingMode(Enum):
    """Preprocessing modes for different models"""
    CLASSIFICATION = "classification"
    OBJECT_DETECTION = "object_detection"
    FACE_RECOGNITION = "face_recognition"
    SEGMENTATION = "segmentation"


class ImagePreprocessor:
    """Image preprocessing pipeline for AI models"""

    def __init__(self):
        self.cache = {}

    def load_image(self, image_data: bytes) -> np.ndarray:
        """
        Load image from bytes

        Args:
            image_data: Image as bytes

        Returns:
            numpy array of image
        """
        try:
            # Try PIL first
            image = Image.open(io.BytesIO(image_data))
            image_array = np.array(image)
            return image_array
        except Exception as e:
            logger.error(f"Failed to load image: {e}")
            raise ValueError(f"Invalid image data: {e}")

    def resize_image(
        self,
        image: np.ndarray,
        target_size: Tuple[int, int],
        maintain_aspect_ratio: bool = True,
        method: str = "bilinear"
    ) -> np.ndarray:
        """
        Resize image to target size

        Args:
            image: Input image as numpy array
            target_size: Target size (width, height)
            maintain_aspect_ratio: Whether to maintain aspect ratio
            method: Resizing method (nearest, bilinear, bicubic, lanczos)

        Returns:
            Resized image
        """
        # Convert to PIL Image
        if image.dtype != np.uint8:
            image = (image * 255).astype(np.uint8)

        pil_image = Image.fromarray(image)

        # Choose interpolation method
        interpolation_map = {
            "nearest": Image.Resampling.NEAREST,
            "bilinear": Image.Resampling.BILINEAR,
            "bicubic": Image.Resampling.BICUBIC,
            "lanczos": Image.Resampling.LANCZOS
        }
        interpolation = interpolation_map.get(method, Image.Resampling.BILINEAR)

        if maintain_aspect_ratio:
            # Resize with padding
            pil_image = ImageOps.fit(pil_image, target_size, method=interpolation)
        else:
            # Direct resize
            pil_image = pil_image.resize(target_size, method=interpolation)

        return np.array(pil_image)

    def normalize_image(
        self,
        image: np.ndarray,
        mean: Optional[List[float]] = None,
        std: Optional[List[float]] = None,
        scale: float = 255.0
    ) -> np.ndarray:
        """
        Normalize image

        Args:
            image: Input image
            mean: Mean values per channel (optional)
            std: Std deviation per channel (optional)
            scale: Scale factor (default: 255.0)

        Returns:
            Normalized image
        """
        # Convert to float
        if image.dtype != np.float32:
            image = image.astype(np.float32)

        # Scale to [0, 1]
        if scale != 1.0:
            image = image / scale

        # Apply mean and std if provided
        if mean is not None or std is not None:
            if mean is None:
                mean = [0.0, 0.0, 0.0]
            if std is None:
                std = [1.0, 1.0, 1.0]

            mean = np.array(mean, dtype=np.float32)
            std = np.array(std, dtype=np.float32)

            image = (image - mean) / std

        return image

    def enhance_image(
        self,
        image: np.ndarray,
        brightness: float = 1.0,
        contrast: float = 1.0,
        saturation: float = 1.0,
        sharpness: float = 1.0
    ) -> np.ndarray:
        """
        Enhance image quality

        Args:
            image: Input image
            brightness: Brightness factor
            contrast: Contrast factor
            saturation: Saturation factor
            sharpness: Sharpness factor

        Returns:
            Enhanced image
        """
        if image.dtype != np.uint8:
            image = (image * 255).astype(np.uint8)

        pil_image = Image.fromarray(image)

        # Apply enhancements
        if brightness != 1.0:
            pil_image = ImageEnhance.Brightness(pil_image).enhance(brightness)
        if contrast != 1.0:
            pil_image = ImageEnhance.Contrast(pil_image).enhance(contrast)
        if saturation != 1.0:
            pil_image = ImageEnhance.Color(pil_image).enhance(saturation)
        if sharpness != 1.0:
            pil_image = ImageEnhance.Sharpness(pil_image).enhance(sharpness)

        return np.array(pil_image)

    def crop_to_aspect_ratio(
        self,
        image: np.ndarray,
        target_ratio: float,
        crop_mode: str = "center"
    ) -> np.ndarray:
        """
        Crop image to target aspect ratio

        Args:
            image: Input image
            target_ratio: Target aspect ratio (width/height)
            crop_mode: Crop mode (center, random, smart)

        Returns:
            Cropped image
        """
        if image.dtype != np.uint8:
            image = (image * 255).astype(np.uint8)

        height, width = image.shape[:2]
        current_ratio = width / height

        if current_ratio == target_ratio:
            return image

        pil_image = Image.fromarray(image)

        if current_ratio > target_ratio:
            # Too wide, crop sides
            new_width = int(height * target_ratio)
            left = (width - new_width) // 2
            if crop_mode == "center":
                box = (left, 0, left + new_width, height)
            elif crop_mode == "random":
                left = np.random.randint(0, width - new_width)
                box = (left, 0, left + new_width, height)
            else:
                box = (left, 0, left + new_width, height)
        else:
            # Too tall, crop top/bottom
            new_height = int(width / target_ratio)
            top = (height - new_height) // 2
            if crop_mode == "center":
                box = (0, top, width, top + new_height)
            elif crop_mode == "random":
                top = np.random.randint(0, height - new_height)
                box = (0, top, width, top + new_height)
            else:
                box = (0, top, width, top + new_height)

        return np.array(pil_image.crop(box))

    def add_batch_dimension(self, image: np.ndarray) -> np.ndarray:
        """Add batch dimension to image"""
        return np.expand_dims(image, axis=0)

    def transpose_channels(
        self,
        image: np.ndarray,
        from_format: str = "HWC",
        to_format: str = "CHW"
    ) -> np.ndarray:
        """
        Transpose image channels

        Args:
            image: Input image
            from_format: Source format (HWC or CHW)
            to_format: Target format (HWC or CHW)

        Returns:
            Transposed image
        """
        if from_format == "HWC" and to_format == "CHW":
            # NHWC -> NCHW or HWC -> CHW
            return np.transpose(image, (0, 3, 1, 2) if image.ndim == 4 else (2, 0, 1))
        elif from_format == "CHW" and to_format == "HWC":
            # NCHW -> NHWC or CHW -> HWC
            return np.transpose(image, (0, 2, 3, 1) if image.ndim == 4 else (1, 2, 0))
        else:
            return image

    def preprocess_for_mode(
        self,
        image: np.ndarray,
        mode: PreprocessingMode,
        target_size: Optional[Tuple[int, int]] = None
    ) -> np.ndarray:
        """
        Preprocess image for specific model mode

        Args:
            image: Input image
            mode: Preprocessing mode
            target_size: Target size (optional)

        Returns:
            Preprocessed image
        """
        # Convert to RGB if needed
        if len(image.shape) == 3 and image.shape[2] == 4:
            image = image[:, :, :3]

        if mode == PreprocessingMode.CLASSIFICATION:
            # ImageNet-style preprocessing
            target_size = target_size or (224, 224)
            image = self.resize_image(image, target_size, maintain_aspect_ratio=False)
            image = self.normalize_image(image, scale=255.0)
            image = self.transpose_channels(image, "HWC", "CHW")
            image = self.add_batch_dimension(image)

        elif mode == PreprocessingMode.OBJECT_DETECTION:
            # YOLO-style preprocessing
            target_size = target_size or (640, 640)
            image = self.resize_image(image, target_size, maintain_aspect_ratio=False)
            image = self.normalize_image(image, scale=255.0)
            image = self.transpose_channels(image, "HWC", "CHW")
            image = self.add_batch_dimension(image)

        elif mode == PreprocessingMode.FACE_RECOGNITION:
            # Face recognition preprocessing
            target_size = target_size or (160, 160)
            image = self.resize_image(image, target_size, maintain_aspect_ratio=True)
            image = self.normalize_image(image, scale=255.0)
            image = self.transpose_channels(image, "HWC", "CHW")
            image = self.add_batch_dimension(image)

        elif mode == PreprocessingMode.SEGMENTATION:
            # Segmentation preprocessing
            target_size = target_size or (512, 512)
            image = self.resize_image(image, target_size, maintain_aspect_ratio=False)
            image = self.normalize_image(image, scale=255.0)
            image = self.transpose_channels(image, "HWC", "CHW")
            image = self.add_batch_dimension(image)

        return image

    def auto_enhance(self, image: np.ndarray) -> np.ndarray:
        """
        Auto-enhance image quality

        Args:
            image: Input image

        Returns:
            Enhanced image
        """
        if image.dtype != np.uint8:
            image = (image * 255).astype(np.uint8)

        # Convert to OpenCV format
        cv_image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

        # Convert to LAB color space
        lab = cv2.cvtColor(cv_image, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)

        # Apply CLAHE to L channel
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        l = clahe.apply(l)

        # Merge channels and convert back
        lab = cv2.merge([l, a, b])
        enhanced = cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)
        enhanced = cv2.cvtColor(enhanced, cv2.COLOR_BGR2RGB)

        return enhanced


# Global preprocessor instance
preprocessor = None


def get_preprocessor() -> ImagePreprocessor:
    """Get global preprocessor instance"""
    global preprocessor
    if preprocessor is None:
        preprocessor = ImagePreprocessor()
    return preprocessor
