"""
Utility functions for file handling and MIME type detection.
"""
import os
import mimetypes
from typing import Optional, Tuple
from urllib.parse import quote

from app.core.configs.FileConfig import FileConfig


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
    Check if a file type can be displayed inline in a browser.
    
    Args:
        mime_type: MIME type string
        
    Returns:
        True if browser can display the file, False otherwise
    """
    # Displayable types that browsers can render natively
    displayable_types = [
        'application/pdf',
        'text/plain',
        'text/html',
        'text/css',
        'text/javascript',
    ]
    
    # All image types are displayable
    if mime_type.startswith('image/'):
        return True
    
    # All video types are displayable
    if mime_type.startswith('video/'):
        return True
    
    # All audio types are displayable
    if mime_type.startswith('audio/'):
        return True
    
    return mime_type in displayable_types


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
