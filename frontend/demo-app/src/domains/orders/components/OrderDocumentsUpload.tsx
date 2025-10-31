import React, { useState, useCallback } from 'react';
import {
  Paper,
  Stack,
  Title,
  Text,
  Group,
  Button,
  FileButton,
  Badge,
  ActionIcon,
  Box,
  useMantineTheme,
  Modal,
  TextInput,
  Select,
  SimpleGrid,
  Card,
  Image,
  Center,
  Loader
} from '@mantine/core';
import {
  IconUpload,
  IconFile,
  IconFileText,
  IconFileZip,
  IconPhoto,
  IconPdf,
  IconDownload,
  IconTrash,
  IconFileDescription,
  IconX,
  IconCheck,
  IconEdit
} from '@tabler/icons-react';
import { notify } from '../../../shared/services/notificationService';

// Document type enum matching backend
export enum OrderDocumentType {
  T1 = "T1",
  MIO = "MIO",
  SAD = "SAD",
  CMR = "CMR",
  Label = "Label",
  Other = "Other",
  Invoice = "Invoice",
  Pictures = "Pictures",
  PackingList = "Packing list",
  MovingReport = "Moving report",
  LoadingChart = "Loading chart",
  ThreePLFourPL = "3PL/4PL",
  BillOfLoading = "Bill og loading",
  DeviationReport = "Deviation report",
  ExportDocuments = "Export documents",
  OffLoadingChart = "Off loading chart",
  CompanyPlukkList = "owner plukk list",
  PlukkListScanned = "Plukk list scanned",
  ExcelListForPlukk = "Excel list for plukk"
}

interface Document {
  id: string;
  name: string;
  size: number;
  type: string;
  documentType?: OrderDocumentType;
  uploadedAt: Date;
  uploadedBy?: string;
  url?: string;
  status?: 'uploading' | 'completed' | 'error';
  progress?: number;
}

interface PendingDocument {
  file: File;
  name: string;
  documentType: OrderDocumentType;
  preview?: string;
}

interface OrderDocumentsUploadProps {
  orderId: string;
  documents?: Document[];
  onUpload?: (files: File[], documentsMetadata: { name: string; type: OrderDocumentType }[]) => Promise<void>;
  onDelete?: (documentId: string) => Promise<void>;
  onDownload?: (documentId: string) => void;
  onView?: (document: Document) => void;
  onEdit?: (documentId: string, title: string, documentType: OrderDocumentType) => Promise<void>;
}

export interface OrderDocumentsUploadRef {
  uploadPendingDocuments: () => Promise<void>;
  hasPendingDocuments: () => boolean;
}

const getFileIcon = (type: string) => {
  if (type.includes('pdf')) return IconPdf;
  if (type.includes('image')) return IconPhoto;
  if (type.includes('zip') || type.includes('compressed')) return IconFileZip;
  if (type.includes('text')) return IconFileText;
  return IconFile;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

const generatePreview = (file: File): Promise<string | null> => {
  return new Promise((resolve) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    } else {
      resolve(null);
    }
  });
};

// Document type options for select
const documentTypeOptions = Object.values(OrderDocumentType).map(type => ({
  value: type,
  label: type
}));

// Modal for editing existing document
const EditDocumentModal: React.FC<{
  document: Document | null;
  opened: boolean;
  onClose: () => void;
  onSave: (title: string, type: OrderDocumentType) => void;
}> = ({ document, opened, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<OrderDocumentType>(OrderDocumentType.Other);

  React.useEffect(() => {
    if (document) {
      setName(document.name);
      setType(document.documentType || OrderDocumentType.Other);
    }
  }, [document]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(name, type);
    onClose();
  };

  const documentTypeOptions = Object.values(OrderDocumentType).map(value => ({
    value,
    label: value
  }));

  if (!document) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Edit Document"
      size="md"
    >
      <Stack gap="md">
        <TextInput
          label="Document Name"
          placeholder="Enter document name"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          required
        />

        <Select
          label="Document Type"
          placeholder="Select document type"
          data={documentTypeOptions}
          value={type}
          onChange={(value) => setType(value as OrderDocumentType)}
          required
          searchable
        />

        {/* Actions */}
        <Group justify="flex-end" gap="xs">
          <Button variant="light" onClick={onClose} leftSection={<IconX size={16} />}>
            Cancel
          </Button>
          <Button onClick={handleSave} leftSection={<IconCheck size={16} />}>
            Save Changes
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

// Modal for adding new document (file upload)
const DocumentEditModal: React.FC<{
  file: File;
  opened: boolean;
  onClose: () => void;
  onSave: (name: string, type: OrderDocumentType) => void;
}> = ({ file, opened, onClose, onSave }) => {
  const [name, setName] = useState(file.name.replace(/\.[^/.]+$/, '')); // Remove extension
  const [type, setType] = useState<OrderDocumentType>(OrderDocumentType.Other);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    if (opened) {
      setLoading(true);
      generatePreview(file).then((previewUrl) => {
        setPreview(previewUrl);
        setLoading(false);
      });
    }
  }, [file, opened]);

  const handleSave = () => {
    try {
      const extension = file.name.split('.').pop();
      const fullName = extension ? `${name}.${extension}` : name;
      onSave(fullName, type);
      onClose();
    } catch (error) {
      console.error('Error in handleSave:', error);
      notify.error(`Error saving document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Document Details"
      size="lg"
      centered
    >
      <Stack gap="md">
        {/* Preview */}
        <Box
          style={{
            width: '100%',
            height: 300,
            borderRadius: 8,
            overflow: 'hidden',
            backgroundColor: '#f8f9fa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {loading ? (
            <Loader size="md" />
          ) : preview ? (
            <Image
              src={preview}
              alt={file.name}
              fit="contain"
              style={{ maxHeight: '100%', maxWidth: '100%' }}
            />
          ) : (
            <Center>
              <Stack align="center" gap="xs">
                {React.createElement(getFileIcon(file.type), { size: 48, stroke: 1.5, color: '#adb5bd' })}
                <Text size="sm" c="dimmed">{file.type || 'Unknown type'}</Text>
              </Stack>
            </Center>
          )}
        </Box>

        {/* Form Fields */}
        <TextInput
          label="Document Name"
          placeholder="Enter document name"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          required
        />

        <Select
          label="Document Type"
          placeholder="Select document type"
          data={documentTypeOptions}
          value={type}
          onChange={(value) => setType(value as OrderDocumentType)}
          required
          searchable
        />

        <Text size="xs" c="dimmed">
          Size: {formatFileSize(file.size)}
        </Text>

        {/* Actions */}
        <Group justify="flex-end" gap="xs">
          <Button variant="light" onClick={onClose} leftSection={<IconX size={16} />}>
            Cancel
          </Button>
          <Button onClick={handleSave} leftSection={<IconCheck size={16} />}>
            Add Document
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

// Separate component for pending documents to avoid hooks in loops
const PendingDocumentCard: React.FC<{
  pendingDoc: PendingDocument;
  index: number;
  FileIcon: React.ComponentType<any>;
  isImage: boolean;
  theme: any;
  onRemove: (index: number) => void;
}> = ({ pendingDoc, index, FileIcon, isImage, theme, onRemove }) => {
  const [preview, setPreview] = useState<string | null>(null);

  React.useEffect(() => {
    if (isImage) {
      generatePreview(pendingDoc.file).then(setPreview);
    }
  }, [pendingDoc.file, isImage]);

  return (
    <Card
      key={`pending-${index}`}
      padding="sm"
      radius="md"
      withBorder
      style={{
        opacity: 0.8,
        position: 'relative',
        borderColor: theme.colors.blue[3],
        borderWidth: 2
      }}
    >
      <Badge
        size="xs"
        color="blue"
        style={{ position: 'absolute', top: 4, right: 4, zIndex: 1 }}
      >
        Pending
      </Badge>

      {/* Preview */}
      <Card.Section
        style={{
          height: 140,
          backgroundColor: theme.colors.gray[1],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {isImage && preview ? (
          <Image
            src={preview}
            alt={pendingDoc.name}
            fit="cover"
            style={{ height: '100%', width: '100%' }}
          />
        ) : (
          <FileIcon size={48} stroke={1.5} color={theme.colors.gray[5]} />
        )}
      </Card.Section>

      {/* Info */}
      <Stack gap={4} mt="sm">
        <Text size="sm" fw={500} lineClamp={1} title={pendingDoc.name}>
          {pendingDoc.name}
        </Text>
        <Group gap={4} justify="space-between">
          <Badge size="xs" variant="light" color="blue">
            {pendingDoc.documentType}
          </Badge>
          <Text size="xs" c="dimmed">
            {formatFileSize(pendingDoc.file.size)}
          </Text>
        </Group>
      </Stack>

      {/* Actions */}
      <Group gap={4} mt="xs" justify="center">
        <ActionIcon
          variant="subtle"
          color="red"
          size="sm"
          onClick={() => onRemove(index)}
        >
          <IconTrash size={14} stroke={1.5} />
        </ActionIcon>
      </Group>
    </Card>
  );
};

export const OrderDocumentsUpload = React.forwardRef<OrderDocumentsUploadRef, OrderDocumentsUploadProps>(({
  documents = [],
  onUpload,
  onDelete,
  onDownload,
  onView,
  onEdit
}, ref) => {
  const theme = useMantineTheme();
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [editingFile, setEditingFile] = useState<File | null>(null);
  const [pendingDocs, setPendingDocs] = useState<PendingDocument[]>([]);
  
  // Edit existing document state
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [editModalOpened, setEditModalOpened] = useState(false);

  const handleFileSelect = useCallback(async (files: File[] | null) => {
    if (!files || files.length === 0) return;
    
    // Open modal for each file
    if (files.length === 1) {
      setEditingFile(files[0]);
    } else {
      // For multiple files, open modal for first one, others will be queued
      setEditingFile(files[0]);
      // You could enhance this to handle multiple files in sequence
    }
  }, []);

  const handleDocumentSave = useCallback((name: string, type: OrderDocumentType) => {
    if (!editingFile) return;
    
    const newDoc: PendingDocument = {
      file: editingFile,
      name,
      documentType: type
    };
    
    setPendingDocs(prev => [...prev, newDoc]);
    setEditingFile(null);
  }, [editingFile]);

  const handleUploadAll = useCallback(async () => {
    if (pendingDocs.length === 0) return;
    
    setUploading(true);
    try {
      const files = pendingDocs.map(doc => doc.file);
      const metadata = pendingDocs.map(doc => ({ name: doc.name, type: doc.documentType }));
      await onUpload?.(files, metadata);
      setPendingDocs([]); // Clear pending docs only on success
    } catch (error) {
      console.error('Upload failed:', error);
      // Don't clear pending docs on error so user can retry
      notify.error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  }, [pendingDocs, onUpload]);

  // Expose methods to parent component
  React.useImperativeHandle(ref, () => ({
    uploadPendingDocuments: handleUploadAll,
    hasPendingDocuments: () => pendingDocs.length > 0,
  }), [handleUploadAll, pendingDocs.length]);

  const handleRemovePending = useCallback((index: number) => {
    setPendingDocs(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleEditDocument = useCallback((document: Document) => {
    setEditingDocument(document);
    setEditModalOpened(true);
  }, []);

  const handleSaveEdit = useCallback(async (title: string, documentType: OrderDocumentType) => {
    if (!editingDocument) return;
    
    try {
      await onEdit?.(editingDocument.id, title, documentType);
      setEditingDocument(null);
    } catch (error) {
      console.error('Failed to edit document:', error);
      notify.error(`Failed to edit document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [editingDocument, onEdit]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files && files.length > 0) {
      await handleFileSelect(files);
    }
  }, [handleFileSelect]);

  return (
    <Paper
      withBorder
      p="md"
      radius="sm"
    >
      <Stack gap="md">
        {/* Header */}
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <IconFileDescription size={18} stroke={1.5} />
            <Title order={5} fw={500}>
              Documents
            </Title>
            {documents.length > 0 && (
              <Badge size="sm" variant="light" color="gray" radius="sm">
                {documents.length}
              </Badge>
            )}
          </Group>
          <Group gap="xs">
            {pendingDocs.length > 0 && (
              <Button
                size="xs"
                variant="filled"
                onClick={handleUploadAll}
                loading={uploading}
              >
                Upload {pendingDocs.length} {pendingDocs.length === 1 ? 'File' : 'Files'}
              </Button>
            )}
            <FileButton onChange={handleFileSelect} accept="image/*,application/pdf,.zip,.doc,.docx" multiple>
              {(props) => (
                <Button
                  {...props}
                  size="xs"
                  variant="light"
                  leftSection={<IconUpload size={14} />}
                >
                  Add Files
                </Button>
              )}
            </FileButton>
          </Group>
        </Group>

        {/* Upload Area - Shown when no documents */}
        {documents.length === 0 && pendingDocs.length === 0 && (
          <Box
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Paper
              p="md"
              radius="sm"
              withBorder
              style={{
                borderStyle: 'dashed',
                borderWidth: 1,
                borderColor: dragActive ? theme.colors.blue[4] : theme.colors.gray[3],
                backgroundColor: dragActive ? theme.colors.blue[0] : theme.colors.gray[0],
                transition: 'border-color 0.15s ease',
                cursor: 'pointer'
              }}
            >
              <Group justify="center" gap="xs">
                <IconUpload size={16} stroke={1.5} color={theme.colors.gray[5]} />
                <Text size="xs" c="dimmed">
                  Drop files here or use add files button
                </Text>
              </Group>
            </Paper>
          </Box>
        )}

        {/* Documents Grid - Card Layout */}
        {(documents.length > 0 || pendingDocs.length > 0) && (
          <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 5 }} spacing="md">
            {/* Existing Documents */}
            {documents.map((doc) => {
              const FileIcon = getFileIcon(doc.type);
              const isImage = doc.type.includes('image');
              
              return (
                <Card
                  key={doc.id}
                  padding="sm"
                  radius="md"
                  withBorder
                  style={{
                    cursor: 'pointer',
                    transition: 'transform 0.1s ease, box-shadow 0.1s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = theme.shadows.sm;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  onClick={() => onView?.(doc)}
                >
                  {/* Preview */}
                  <Card.Section
                    style={{
                      height: 140,
                      backgroundColor: theme.colors.gray[1],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {isImage && doc.url ? (
                      <Image
                        src={doc.url}
                        alt={doc.name}
                        fit="cover"
                        style={{ height: '100%', width: '100%' }}
                      />
                    ) : (
                      <FileIcon size={48} stroke={1.5} color={theme.colors.gray[5]} />
                    )}
                  </Card.Section>

                  {/* Info */}
                  <Stack gap={4} mt="sm">
                    <Text size="sm" fw={500} lineClamp={1} title={doc.name}>
                      {doc.name}
                    </Text>
                    <Group gap={4} justify="space-between">
                      <Badge size="xs" variant="light" color="blue">
                        {doc.documentType || 'Other'}
                      </Badge>
                      {doc.size > 0 && (
                        <Text size="xs" c="dimmed">
                          {formatFileSize(doc.size)}
                        </Text>
                      )}
                    </Group>
                  </Stack>

                  {/* Actions */}
                  <Group gap={4} mt="xs" justify="center">
                     <ActionIcon
                      variant="subtle"
                      color="blue"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditDocument(doc);
                      }}
                    >
                      <IconEdit size={14} stroke={1.5} />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDownload?.(doc.id);
                      }}
                    >
                      <IconDownload size={14} stroke={1.5} />
                    </ActionIcon>
                   
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete?.(doc.id);
                      }}
                    >
                      <IconTrash size={14} stroke={1.5} />
                    </ActionIcon>
                  </Group>
                </Card>
              );
            })}

            {/* Pending Documents */}
            {pendingDocs.map((pendingDoc, index) => {
              const FileIcon = getFileIcon(pendingDoc.file.type);
              const isImage = pendingDoc.file.type.startsWith('image/');
              
              return (
                <PendingDocumentCard
                  key={`pending-${index}`}
                  pendingDoc={pendingDoc}
                  index={index}
                  FileIcon={FileIcon}
                  isImage={isImage}
                  theme={theme}
                  onRemove={handleRemovePending}
                />
              );
            })}
          </SimpleGrid>
        )}
      </Stack>

      {/* Document Edit Modal */}
      {editingFile && (
        <DocumentEditModal
          file={editingFile}
          opened={!!editingFile}
          onClose={() => setEditingFile(null)}
          onSave={handleDocumentSave}
        />
      )}

      {/* Edit Existing Document Modal */}
      <EditDocumentModal
        opened={editModalOpened}
        document={editingDocument}
        onClose={() => {
          setEditModalOpened(false);
          setEditingDocument(null);
        }}
        onSave={handleSaveEdit}
      />
    </Paper>
  );
});
