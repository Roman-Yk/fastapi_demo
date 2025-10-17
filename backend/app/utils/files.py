"""
Utility functions for file handling and MIME type detection.
"""
import os
import mimetypes
import logging
from typing import Optional, Tuple
from urllib.parse import quote
from fastapi import UploadFile, HTTPException, status

from app.core.configs.FileConfig import FileConfig

logger = logging.getLogger(__name__)


async def validate_file_upload(file: UploadFile) -> bool:
    """
    Validate uploaded file size, extension, and MIME type using FileConfig settings.

    Args:
        file: The uploaded file to validate

    Returns:
        True if validation passes

    Raises:
        HTTPException: If validation fails
    """
    # Check if file is provided
    if not file or not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file provided"
        )

    # Check file extension
    file_ext = os.path.splitext(file.filename)[1].lower().lstrip('.')
    if file_ext not in FileConfig.allowed_upload_extensions:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file type: {file_ext}. Allowed: {', '.join(sorted(FileConfig.allowed_upload_extensions))}"
        )

    # Check file size
    contents = await file.read()
    file_size = len(contents)
    await file.seek(0)  # Reset file pointer for later reading

    if file_size > FileConfig.max_upload_size_bytes:
        max_size_mb = FileConfig.max_upload_size_bytes / 1024 / 1024
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Max size: {max_size_mb:.1f}MB"
        )

    if file_size == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Empty file not allowed"
        )

    # Check MIME type if available
    if file.content_type and file.content_type not in FileConfig.allowed_upload_mime_types:
        logger.warning(f"Unexpected MIME type: {file.content_type} for file: {file.filename}")
        # Don't fail, just log warning as content_type can be incorrect

    logger.info(f"File validation passed: {file.filename} ({file_size} bytes)")
    return True


def get_mime_type(file_path: str) -> str:
    """
    Get MIME type for a file based on its extension.
    Uses the existing FileConfig mappings for consistency.
    
    Args:
        file_path: Path to the file
        
    Returns:
        MIME type string (e.g., 'application/pdf')
    """
    # Try standard library first
    mime_type, _ = mimetypes.guess_type(file_path)
    
    if mime_type:
        return mime_type
    
    # Fallback to FileConfig mappings
    ext = os.path.splitext(file_path)[1].lower()
    return FileConfig.mimetypes_by_extensions.get(ext, 'application/octet-stream')


def is_displayable_in_browser(mime_type: str) -> bool:
    """
    Check if a file type can be displayed inline in a browser using FileConfig settings.

    Args:
        mime_type: MIME type string

    Returns:
        True if browser can display the file, False otherwise
    """
    # All image types are displayable
    if mime_type.startswith('image/'):
        return True

    # All video types are displayable
    if mime_type.startswith('video/'):
        return True

    # All audio types are displayable
    if mime_type.startswith('audio/'):
        return True

    # Check against configured displayable types
    return mime_type in FileConfig.displayable_mime_types


def encode_filename_for_header(filename: str) -> str:
    """
    Encode filename for Content-Disposition header using RFC 5987.
    Handles Unicode filenames properly.
    
    Args:
        filename: Original filename
        
    Returns:
        Encoded Content-Disposition value (e.g., 'attachment; filename="doc.pdf"')
    """
    try:
        # Try ASCII encoding first (simpler, better compatibility)
        filename_ascii = filename.encode('ascii').decode('ascii')
        return f'attachment; filename="{filename_ascii}"'
    except (UnicodeEncodeError, UnicodeDecodeError):
        # Use RFC 5987 encoding for non-ASCII filenames
        filename_encoded = quote(filename)
        return f"attachment; filename*=UTF-8''{filename_encoded}"


def get_file_extension_and_mime(file_path: str) -> Tuple[str, str]:
    """
    Get file extension and MIME type for a file.
    
    Args:
        file_path: Path to the file
        
    Returns:
        Tuple of (extension, mime_type)
    """
    ext = os.path.splitext(file_path)[1].lower()
    mime_type = get_mime_type(file_path)
    return ext, mime_type
