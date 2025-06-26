from typing import Optional, Dict

from app.utils.immutables import BaseConstants

class FileConfig(BaseConstants):
    """
    Configuration class for handling file types, extensions, and related settings.
    Inherits from BaseConstants.
    """
    
    images_extensions: tuple = (".png", ".jpg", ".jpeg", ".webp")
    word_extensions: tuple = (".docx", ".doc")
    pdf_extensions: tuple = (".pdf",)
    excel_extensions: tuple = (".xlsx", ".xls")
    text_extensions: tuple = (".txt",)
    documents_extensions: tuple = (*pdf_extensions, *word_extensions, *excel_extensions, *text_extensions)
    acceptable_extensions: tuple = (*images_extensions, *documents_extensions)
    searchable_extensions: tuple = (*images_extensions, ".pdf", ".docx", ".xlsx", ".txt")

    local_dir_path: str = "files"

    default_thumbnail_path_by_ext: Dict[str, str] = {
        ".pdf": "thumbnail-pdf.jpeg",
        ".docx": "thumbnail-docx.jpeg",
        ".doc": "thumbnail-doc.jpeg",
        ".xlsx": "thumbnail-xlsx.jpeg",
        ".xls": "thumbnail-xls.jpeg",
        ".txt": "thumbnail-txt.jpeg",
    }

    thumbnail_prefix: str = 'thumbnail-'
    thumbnail_extension: str = '.jpeg'

    deleted_filename: str = "file_deleted.webp"
    deleted_thumbnail_filename: str = f"{thumbnail_prefix}file_deleted.webp"

    images_mimetypes_by_extensions: Dict[str, str] = {
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".webp": "image/webp",
    }
    documents_mimetypes_by_extensions: Dict[str, str] = {
        ".pdf": "application/pdf",
        ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ".doc": "application/msword",
        ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ".xls": "application/vnd.ms-excel",
        ".txt": "text/plain",
    }
    mimetypes_by_extensions: Dict[str, str] = {
        **images_mimetypes_by_extensions, 
        **documents_mimetypes_by_extensions
    }
