"""
Audio Processor for BirdNET
Handles audio loading, preprocessing, and feature extraction
"""
import numpy as np
import librosa
import soundfile as sf
from typing import Tuple, Optional, List
import logging

logger = logging.getLogger(__name__)


class AudioProcessor:
    """Audio processing pipeline for bird audio classification"""

    def __init__(
        self,
        sample_rate: int = 48000,
        duration: float = 3.0,
        n_mels: int = 128,
        n_fft: int = 2048,
        hop_length: int = 512
    ):
        self.sample_rate = sample_rate
        self.duration = duration
        self.n_mels = n_mels
        self.n_fft = n_fft
        self.hop_length = hop_length

    def load_audio(
        self,
        audio_path: str,
        target_sr: Optional[int] = None
    ) -> Tuple[np.ndarray, int]:
        """
        Load audio file

        Args:
            audio_path: Path to audio file
            target_sr: Target sample rate (optional)

        Returns:
            Tuple of (audio_data, sample_rate)
        """
        try:
            audio, sr = librosa.load(audio_path, sr=target_sr)
            logger.info(f"Loaded audio: {audio_path}, shape: {audio.shape}, sr: {sr}")
            return audio, sr
        except Exception as e:
            logger.error(f"Failed to load audio {audio_path}: {e}")
            raise ValueError(f"Failed to load audio: {e}")

    def load_audio_from_bytes(self, audio_bytes: bytes) -> np.ndarray:
        """
        Load audio from bytes

        Args:
            audio_bytes: Audio file as bytes

        Returns:
            Audio data as numpy array
        """
        try:
            audio, sr = sf.read(io.BytesIO(audio_bytes))

            # Convert to mono if stereo
            if len(audio.shape) > 1:
                audio = np.mean(audio, axis=1)

            # Resample if needed
            if sr != self.sample_rate:
                audio = librosa.resample(audio, orig_sr=sr, target_sr=self.sample_rate)

            logger.info(f"Loaded audio from bytes, shape: {audio.shape}")
            return audio

        except Exception as e:
            logger.error(f"Failed to load audio from bytes: {e}")
            raise ValueError(f"Failed to load audio: {e}")

    def trim_silence(
        self,
        audio: np.ndarray,
        threshold: float = 0.01,
        frame_length: int = 2048,
        hop_length: int = 512
    ) -> np.ndarray:
        """
        Trim silence from audio

        Args:
            audio: Input audio
            threshold: Silence threshold
            frame_length: Frame length for silence detection
            hop_length: Hop length for silence detection

        Returns:
            Trimmed audio
        """
        # Trim from start
        trimmed, _ = librosa.effects.trim(
            audio,
            top_db=20 * np.log10(threshold),
            frame_length=frame_length,
            hop_length=hop_length
        )

        logger.info(f"Trimmed audio: {audio.shape} -> {trimmed.shape}")
        return trimmed

    def split_into_chunks(
        self,
        audio: np.ndarray,
        chunk_duration: Optional[float] = None
    ) -> List[np.ndarray]:
        """
        Split audio into fixed-duration chunks

        Args:
            audio: Input audio
            chunk_duration: Duration of each chunk (default: self.duration)

        Returns:
            List of audio chunks
        """
        if chunk_duration is None:
            chunk_duration = self.duration

        chunk_samples = int(chunk_duration * self.sample_rate)
        num_chunks = int(np.ceil(len(audio) / chunk_samples))

        chunks = []
        for i in range(num_chunks):
            start = i * chunk_samples
            end = start + chunk_samples
            chunk = audio[start:end]

            # Pad last chunk if needed
            if len(chunk) < chunk_samples:
                chunk = np.pad(chunk, (0, chunk_samples - len(chunk)), mode='constant')

            chunks.append(chunk)

        logger.info(f"Split audio into {num_chunks} chunks")
        return chunks

    def compute_melspectrogram(
        self,
        audio: np.ndarray,
        n_mels: Optional[int] = None,
        n_fft: Optional[int] = None,
        hop_length: Optional[int] = None
    ) -> np.ndarray:
        """
        Compute mel spectrogram

        Args:
            audio: Input audio
            n_mels: Number of mel bands
            n_fft: FFT window size
            hop_length: Hop length

        Returns:
            Mel spectrogram
        """
        n_mels = n_mels or self.n_mels
        n_fft = n_fft or self.n_fft
        hop_length = hop_length or self.hop_length

        # Compute mel spectrogram
        mel_spec = librosa.feature.melspectrogram(
            y=audio,
            sr=self.sample_rate,
            n_mels=n_mels,
            n_fft=n_fft,
            hop_length=hop_length
        )

        # Convert to dB
        mel_spec_db = librosa.power_to_db(mel_spec, ref=np.max)

        return mel_spec_db

    def compute_mfcc(
        self,
        audio: np.ndarray,
        n_mfcc: int = 40,
        n_fft: Optional[int] = None,
        hop_length: Optional[int] = None
    ) -> np.ndarray:
        """
        Compute MFCC features

        Args:
            audio: Input audio
            n_mfcc: Number of MFCC coefficients
            n_fft: FFT window size
            hop_length: Hop length

        Returns:
            MFCC features
        """
        n_fft = n_fft or self.n_fft
        hop_length = hop_length or self.hop_length

        mfcc = librosa.feature.mfcc(
            y=audio,
            sr=self.sample_rate,
            n_mfcc=n_mfcc,
            n_fft=n_fft,
            hop_length=hop_length
        )

        return mfcc

    def normalize_audio(
        self,
        audio: np.ndarray,
        method: str = "peak"
    ) -> np.ndarray:
        """
        Normalize audio

        Args:
            audio: Input audio
            method: Normalization method ('peak', 'rms')

        Returns:
            Normalized audio
        """
        if method == "peak":
            # Peak normalization
            max_val = np.max(np.abs(audio))
            if max_val > 0:
                audio = audio / max_val
        elif method == "rms":
            # RMS normalization
            rms = np.sqrt(np.mean(audio ** 2))
            if rms > 0:
                audio = audio / rms

        return audio

    def augment_audio(
        self,
        audio: np.ndarray,
        add_noise: bool = False,
        time_shift: bool = False,
        pitch_shift: bool = False,
        speed_change: bool = False
    ) -> np.ndarray:
        """
        Augment audio with random transformations

        Args:
            audio: Input audio
            add_noise: Add random noise
            time_shift: Random time shift
            pitch_shift: Random pitch shift
            speed_change: Random speed change

        Returns:
            Augmented audio
        """
        augmented = audio.copy()

        if add_noise:
            # Add Gaussian noise
            noise = np.random.normal(0, 0.01, len(augmented))
            augmented = augmented + noise

        if time_shift:
            # Random time shift
            shift = np.random.randint(-len(augmented) // 10, len(augmented) // 10)
            augmented = np.roll(augmented, shift)

        if pitch_shift:
            # Random pitch shift (semitones)
            n_steps = np.random.uniform(-2, 2)
            augmented = librosa.effects.pitch_shift(
                augmented,
                sr=self.sample_rate,
                n_steps=n_steps
            )

        if speed_change:
            # Random speed change
            rate = np.random.uniform(0.8, 1.2)
            augmented = librosa.effects.time_stretch(augmented, rate=rate)

        return augmented

    def preprocess_for_inference(
        self,
        audio: np.ndarray,
        feature_type: str = "mel"
    ) -> np.ndarray:
        """
        Preprocess audio for model inference

        Args:
            audio: Input audio
            feature_type: Type of features ('mel', 'mfcc')

        Returns:
            Preprocessed features
        """
        # Normalize
        audio = self.normalize_audio(audio, method="peak")

        # Compute features
        if feature_type == "mel":
            features = self.compute_melspectrogram(audio)
        elif feature_type == "mfcc":
            features = self.compute_mfcc(audio)
        else:
            raise ValueError(f"Unknown feature type: {feature_type}")

        # Add channel dimension for model input
        features = np.expand_dims(features, axis=0)
        features = np.expand_dims(features, axis=-1)

        return features.astype(np.float32)

    def detect_bird_calls(
        self,
        audio: np.ndarray,
        threshold: float = 0.5,
        min_duration: float = 0.1
    ) -> List[Tuple[float, float]]:
        """
        Detect bird calls in audio

        Args:
            audio: Input audio
            threshold: Energy threshold
            min_duration: Minimum call duration

        Returns:
            List of (start_time, end_time) tuples
        """
        # Compute energy envelope
        energy = librosa.feature.rms(y=audio, hop_length=self.hop_length)[0]

        # Threshold
        above_threshold = energy > threshold

        # Find segments
        segments = []
        in_segment = False
        start_idx = None

        for i, is_above in enumerate(above_threshold):
            if is_above and not in_segment:
                start_idx = i
                in_segment = True
            elif not is_above and in_segment:
                end_idx = i
                duration = (end_idx - start_idx) * self.hop_length / self.sample_rate

                if duration >= min_duration:
                    start_time = start_idx * self.hop_length / self.sample_rate
                    end_time = end_idx * self.hop_length / self.sample_rate
                    segments.append((start_time, end_time))

                in_segment = False

        return segments


# Global processor instance
processor = None


def get_processor() -> AudioProcessor:
    """Get global audio processor instance"""
    global processor
    if processor is None:
        processor = AudioProcessor()
    return processor
