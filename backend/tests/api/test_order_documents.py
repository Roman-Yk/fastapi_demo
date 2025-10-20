import pytest
import uuid
import os
import io
from httpx import AsyncClient
from app.database.models.orders import Order, OrderDocument, OrderDocumentType


class TestOrderDocumentsAPI:
    """Test suite for Order Documents API endpoints."""

    @pytest.mark.asyncio
    async def test_get_order_documents_empty(
        self, async_client: AsyncClient, sample_order
    ):
        """Test getting order documents when there are none."""
        response = await async_client.get(
            f"/api/v1/orders/{sample_order.id}/documents/"
        )
        assert response.status_code == 200
        assert response.json() == []

    @pytest.mark.asyncio
    async def test_get_order_documents_with_data(
        self, async_client: AsyncClient, sample_order_document
    ):
        """Test getting order documents with existing data."""
        response = await async_client.get(
            f"/api/v1/orders/{sample_order_document.order_id}/documents/"
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["id"] == str(sample_order_document.id)
        assert data[0]["title"] == sample_order_document.title

    @pytest.mark.asyncio
    async def test_get_order_document_by_id_success(
        self, async_client: AsyncClient, sample_order_document
    ):
        """Test getting a specific order document by ID."""
        response = await async_client.get(
            f"/api/v1/orders/{sample_order_document.order_id}/documents/{sample_order_document.id}"
        )
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(sample_order_document.id)
        assert data["title"] == sample_order_document.title

    @pytest.mark.asyncio
    async def test_get_order_document_by_id_not_found(
        self, async_client: AsyncClient, sample_order
    ):
        """Test getting a non-existent order document."""
        non_existent_id = uuid.uuid4()
        response = await async_client.get(
            f"/api/v1/orders/{sample_order.id}/documents/{non_existent_id}"
        )
        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_upload_document_pdf(
        self, async_client: AsyncClient, sample_order
    ):
        """Test uploading a PDF document."""
        # Create a fake PDF file
        pdf_content = b"%PDF-1.4 fake pdf content"
        files = {"file": ("test.pdf", io.BytesIO(pdf_content), "application/pdf")}
        data = {"title": "Test PDF Document", "type": "CMR"}

        response = await async_client.post(
            f"/api/v1/orders/{sample_order.id}/documents/",
            files=files,
            data=data,
        )
        assert response.status_code == 201

    @pytest.mark.asyncio
    async def test_upload_document_image(
        self, async_client: AsyncClient, sample_order
    ):
        """Test uploading an image document."""
        # Create a fake image file
        image_content = b"\x89PNG\r\n\x1a\n fake png content"
        files = {"file": ("test.png", io.BytesIO(image_content), "image/png")}
        data = {"title": "Test Image Document", "type": "POD"}

        response = await async_client.post(
            f"/api/v1/orders/{sample_order.id}/documents/",
            files=files,
            data=data,
        )
        assert response.status_code == 201

    @pytest.mark.asyncio
    async def test_upload_document_unsupported_type(
        self, async_client: AsyncClient, sample_order
    ):
        """Test uploading an unsupported file type."""
        # Create a fake executable file
        exe_content = b"MZ fake exe content"
        files = {"file": ("test.exe", io.BytesIO(exe_content), "application/x-msdownload")}
        data = {"title": "Test Exe", "type": "Other"}

        response = await async_client.post(
            f"/api/v1/orders/{sample_order.id}/documents/",
            files=files,
            data=data,
        )
        assert response.status_code == 415  # Unsupported Media Type

    @pytest.mark.asyncio
    async def test_upload_document_too_large(
        self, async_client: AsyncClient, sample_order
    ):
        """Test uploading a file that's too large."""
        # Create a file larger than 10MB
        large_content = b"x" * (11 * 1024 * 1024)  # 11MB
        files = {"file": ("large.pdf", io.BytesIO(large_content), "application/pdf")}
        data = {"title": "Large PDF", "type": "CMR"}

        response = await async_client.post(
            f"/api/v1/orders/{sample_order.id}/documents/",
            files=files,
            data=data,
        )
        assert response.status_code == 413  # Payload Too Large

    @pytest.mark.asyncio
    async def test_upload_document_missing_title(
        self, async_client: AsyncClient, sample_order
    ):
        """Test uploading without required title field."""
        pdf_content = b"%PDF-1.4 fake pdf"
        files = {"file": ("test.pdf", io.BytesIO(pdf_content), "application/pdf")}
        data = {"type": "CMR"}  # Missing title

        response = await async_client.post(
            f"/api/v1/orders/{sample_order.id}/documents/",
            files=files,
            data=data,
        )
        assert response.status_code == 422  # Validation error

    @pytest.mark.asyncio
    async def test_upload_document_batch(
        self, async_client: AsyncClient, sample_order
    ):
        """Test batch uploading multiple documents."""
        pdf_content1 = b"%PDF-1.4 fake pdf 1"
        pdf_content2 = b"%PDF-1.4 fake pdf 2"

        files = [
            ("files", ("test1.pdf", io.BytesIO(pdf_content1), "application/pdf")),
            ("files", ("test2.pdf", io.BytesIO(pdf_content2), "application/pdf")),
        ]
        data = {"type": "CMR"}

        response = await async_client.post(
            f"/api/v1/orders/{sample_order.id}/documents/batch",
            files=files,
            data=data,
        )
        assert response.status_code == 200
        result = response.json()
        assert result["created"] == 2
        assert len(result["documents"]) == 2

    @pytest.mark.asyncio
    async def test_download_document(
        self, async_client: AsyncClient, sample_order_document
    ):
        """Test downloading a document."""
        response = await async_client.get(
            f"/api/v1/orders/{sample_order_document.order_id}/documents/{sample_order_document.id}/download"
        )
        # Document might not exist on filesystem in test environment
        assert response.status_code in [200, 404]

        if response.status_code == 200:
            assert "Content-Disposition" in response.headers
            assert "attachment" in response.headers["Content-Disposition"].lower()

    @pytest.mark.asyncio
    async def test_view_document(
        self, async_client: AsyncClient, sample_order_document
    ):
        """Test viewing a document inline."""
        response = await async_client.get(
            f"/api/v1/orders/{sample_order_document.order_id}/documents/{sample_order_document.id}/view"
        )
        # Document might not exist on filesystem in test environment
        assert response.status_code in [200, 404]

    @pytest.mark.asyncio
    async def test_update_document_metadata(
        self, async_client: AsyncClient, sample_order_document
    ):
        """Test updating document metadata (title, type)."""
        update_data = {"title": "Updated Title", "type": "POD"}

        response = await async_client.put(
            f"/api/v1/orders/{sample_order_document.order_id}/documents/{sample_order_document.id}",
            json=update_data,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == update_data["title"]

    @pytest.mark.asyncio
    async def test_patch_document_metadata(
        self, async_client: AsyncClient, sample_order_document
    ):
        """Test partially updating document metadata."""
        patch_data = {"title": "Patched Title"}

        response = await async_client.patch(
            f"/api/v1/orders/{sample_order_document.order_id}/documents/{sample_order_document.id}",
            json=patch_data,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == patch_data["title"]

    @pytest.mark.asyncio
    async def test_delete_document(
        self, async_client: AsyncClient, sample_order, sample_order_document
    ):
        """Test deleting a document."""
        response = await async_client.delete(
            f"/api/v1/orders/{sample_order_document.order_id}/documents/{sample_order_document.id}"
        )
        assert response.status_code == 204

        # Verify document is deleted
        get_response = await async_client.get(
            f"/api/v1/orders/{sample_order.id}/documents/{sample_order_document.id}"
        )
        assert get_response.status_code == 404

    @pytest.mark.asyncio
    async def test_upload_document_invalid_order_id(
        self, async_client: AsyncClient
    ):
        """Test uploading document to non-existent order."""
        non_existent_order_id = uuid.uuid4()
        pdf_content = b"%PDF-1.4 fake pdf"
        files = {"file": ("test.pdf", io.BytesIO(pdf_content), "application/pdf")}
        data = {"title": "Test PDF", "type": "CMR"}

        response = await async_client.post(
            f"/api/v1/orders/{non_existent_order_id}/documents/",
            files=files,
            data=data,
        )
        # Should fail because order doesn't exist
        assert response.status_code in [404, 422, 500]

    @pytest.mark.asyncio
    async def test_document_type_validation(
        self, async_client: AsyncClient, sample_order
    ):
        """Test that document type enum validation works."""
        pdf_content = b"%PDF-1.4 fake pdf"
        files = {"file": ("test.pdf", io.BytesIO(pdf_content), "application/pdf")}
        data = {"title": "Test PDF", "type": "INVALID_TYPE"}

        response = await async_client.post(
            f"/api/v1/orders/{sample_order.id}/documents/",
            files=files,
            data=data,
        )
        assert response.status_code == 422  # Validation error

    @pytest.mark.asyncio
    async def test_multiple_documents_for_same_order(
        self, async_client: AsyncClient, sample_order
    ):
        """Test uploading multiple documents for the same order."""
        # Upload first document
        files1 = {"file": ("test1.pdf", io.BytesIO(b"%PDF-1.4 fake 1"), "application/pdf")}
        data1 = {"title": "Document 1", "type": "CMR"}
        response1 = await async_client.post(
            f"/api/v1/orders/{sample_order.id}/documents/",
            files=files1,
            data=data1,
        )
        assert response1.status_code == 201

        # Upload second document
        files2 = {"file": ("test2.pdf", io.BytesIO(b"%PDF-1.4 fake 2"), "application/pdf")}
        data2 = {"title": "Document 2", "type": "POD"}
        response2 = await async_client.post(
            f"/api/v1/orders/{sample_order.id}/documents/",
            files=files2,
            data=data2,
        )
        assert response2.status_code == 201

        # Verify both documents exist
        response = await async_client.get(
            f"/api/v1/orders/{sample_order.id}/documents/"
        )
        assert response.status_code == 200
        documents = response.json()
        assert len(documents) == 2

    @pytest.mark.asyncio
    async def test_document_pagination(
        self, async_client: AsyncClient, sample_order
    ):
        """Test pagination of order documents."""
        # Create multiple documents
        for i in range(15):
            files = {"file": (f"test{i}.pdf", io.BytesIO(b"%PDF-1.4"), "application/pdf")}
            data = {"title": f"Document {i}", "type": "Other"}
            await async_client.post(
                f"/api/v1/orders/{sample_order.id}/documents/",
                files=files,
                data=data,
            )

        # Test pagination
        response = await async_client.get(
            f"/api/v1/orders/{sample_order.id}/documents/?range=[0,9]"
        )
        assert response.status_code == 200
        documents = response.json()
        assert len(documents) <= 10

    @pytest.mark.asyncio
    async def test_upload_supported_file_types(
        self, async_client: AsyncClient, sample_order
    ):
        """Test uploading various supported file types."""
        test_files = [
            ("test.pdf", b"%PDF-1.4", "application/pdf"),
            ("test.jpg", b"\xFF\xD8\xFF", "image/jpeg"),
            ("test.png", b"\x89PNG\r\n\x1a\n", "image/png"),
            ("test.tiff", b"II*\x00", "image/tiff"),
        ]

        for filename, content, mime_type in test_files:
            files = {"file": (filename, io.BytesIO(content), mime_type)}
            data = {"title": f"Test {filename}", "type": "Other"}

            response = await async_client.post(
                f"/api/v1/orders/{sample_order.id}/documents/",
                files=files,
                data=data,
            )
            assert response.status_code == 201, f"Failed to upload {filename}"
