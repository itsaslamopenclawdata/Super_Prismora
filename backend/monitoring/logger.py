"""
Centralized logging configuration for PhotoIdentifier backend
Integrates with ELK stack for log aggregation and search
"""

import logging
import logging.handlers
import json
import os
from datetime import datetime
from typing import Dict, Any, Optional


class JsonFormatter(logging.Formatter):
    """
    Custom formatter that outputs logs in JSON format
    Compatible with ELK stack and structured logging
    """
    
    def format(self, record: logging.LogRecord) -> str:
        """
        Format log record as JSON
        """
        log_data: Dict[str, Any] = {
            'timestamp': datetime.utcnow().isoformat(),
            'level': record.levelname,
            'logger': record.name,
            'message': record.getMessage(),
            'service': os.getenv('SERVICE_NAME', 'photoidentifier-backend'),
            'environment': os.getenv('NODE_ENV', 'development'),
            'version': os.getenv('APP_VERSION', '0.1.0'),
        }
        
        # Add extra fields if present
        if hasattr(record, 'extra_fields'):
            log_data.update(record.extra_fields)
        
        # Add exception info if present
        if record.exc_info:
            log_data['exception'] = self.formatException(record.exc_info)
        
        # Add stack trace if present
        if record.stack_info:
            log_data['stack_trace'] = self.formatStack(record.stack_info)
        
        # Add request context if available (for web applications)
        if hasattr(record, 'request_id'):
            log_data['request_id'] = record.request_id
        if hasattr(record, 'user_id'):
            log_data['user_id'] = record.user_id
        if hasattr(record, 'endpoint'):
            log_data['endpoint'] = record.endpoint
        
        return json.dumps(log_data)


def setup_logging(
    service_name: str = 'photoidentifier-backend',
    log_level: str = 'INFO',
    log_file: Optional[str] = None,
    enable_elk: bool = True
) -> logging.Logger:
    """
    Set up centralized logging for the application
    
    Args:
        service_name: Name of the service
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_file: Optional file to log to
        enable_elk: Enable ELK stack integration
    
    Returns:
        Configured logger instance
    """
    # Set environment variable for service name
    os.environ['SERVICE_NAME'] = service_name
    
    # Create logger
    logger = logging.getLogger(service_name)
    logger.setLevel(getattr(logging, log_level.upper(), logging.INFO))
    
    # Clear existing handlers
    logger.handlers = []
    
    # Create JSON formatter
    json_formatter = JsonFormatter()
    
    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(json_formatter)
    logger.addHandler(console_handler)
    
    # File handler (optional)
    if log_file:
        file_handler = logging.handlers.RotatingFileHandler(
            log_file,
            maxBytes=10*1024*1024,  # 10MB
            backupCount=5
        )
        file_handler.setFormatter(json_formatter)
        logger.addHandler(file_handler)
    
    # ELK integration via Gelf (if enabled)
    if enable_elk:
        try:
            from graypy import GELFUDPHandler
            gelf_handler = GELFUDPHandler(
                os.getenv('LOGSTASH_HOST', 'localhost'),
                int(os.getenv('LOGSTASH_PORT', 5000))
            )
            gelf_handler.setFormatter(json_formatter)
            logger.addHandler(gelf_handler)
        except ImportError:
            logger.warning("graypy not installed. ELK integration disabled.")
    
    return logger


class Logger:
    """
    Logger wrapper with support for contextual logging
    """
    
    def __init__(self, name: str):
        self.logger = logging.getLogger(name)
    
    def _log(self, level: str, message: str, **kwargs):
        """
        Internal logging method with support for extra fields
        """
        extra = {'extra_fields': kwargs} if kwargs else {}
        getattr(self.logger, level.lower())(message, extra=extra)
    
    def debug(self, message: str, **kwargs):
        """Log debug message"""
        self._log('DEBUG', message, **kwargs)
    
    def info(self, message: str, **kwargs):
        """Log info message"""
        self._log('INFO', message, **kwargs)
    
    def warning(self, message: str, **kwargs):
        """Log warning message"""
        self._log('WARNING', message, **kwargs)
    
    def error(self, message: str, **kwargs):
        """Log error message"""
        self._log('ERROR', message, **kwargs)
    
    def critical(self, message: str, **kwargs):
        """Log critical message"""
        self._log('CRITICAL', message, **kwargs)
    
    def exception(self, message: str, **kwargs):
        """Log exception with traceback"""
        self.logger.exception(message, extra={'extra_fields': kwargs} if kwargs else {})


def get_logger(name: str) -> Logger:
    """
    Get a logger instance
    
    Args:
        name: Logger name (usually __name__)
    
    Returns:
        Logger instance
    """
    return Logger(name)


# Initialize default logger
setup_logging()

# Export functions
__all__ = [
    'setup_logging',
    'get_logger',
    'Logger',
    'JsonFormatter',
]
