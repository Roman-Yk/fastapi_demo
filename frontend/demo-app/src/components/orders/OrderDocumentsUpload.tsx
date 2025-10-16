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
  useMantineTheme
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
  IconFileDescription
} from '@tabler/icons-react';

interface Document {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  uploadedBy?: string;
  url?: string;
  status?: 'uploading' | 'completed' | 'error';
  progress?: number;
}

interface OrderDocumentsUploadProps {
  orderId: string;
  documents?: Document[];
  onUpload?: (files: File[]) => Promise<void>;
  onDelete?: (documentId: string) => Promise<void>;
  onDownload?: (documentId: string) => void;
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

export const OrderDocumentsUpload: React.FC<OrderDocumentsUploadProps> = ({
  documents = [],
  onUpload,
  onDelete,
  onDownload
}) => {
  const theme = useMantineTheme();
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = useCallback(async (files: File[] | null) => {
    if (!files || files.length === 0) return;
    
    setUploading(true);
    try {
      await onUpload?.(files);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  }, [onUpload]);

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
          <FileButton onChange={handleFileSelect} accept="image/*,application/pdf,.zip,.doc,.docx" multiple>
            {(props) => (
              <Button
                {...props}
                size="xs"
                variant="light"
                leftSection={<IconUpload size={14} />}
                loading={uploading}
              >
                Upload
              </Button>
            )}
          </FileButton>
        </Group>

        {/* Upload Area - Hidden when has documents */}
        {documents.length === 0 && (
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
                  Drop files here or use upload button
                </Text>
              </Group>
            </Paper>
          </Box>
        )}

        {/* Documents List */}
        {documents.length > 0 && (
          <Stack gap="xs">
            {documents.map((doc) => {
              const FileIcon = getFileIcon(doc.type);
              
              return (
                <Group
                  key={doc.id}
                  justify="space-between"
                  wrap="nowrap"
                  p="xs"
                  style={{
                    borderRadius: theme.radius.sm,
                    transition: 'background-color 0.1s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.gray[0];
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {/* File Info */}
                  <Group gap="xs" style={{ flex: 1, minWidth: 0 }}>
                    <FileIcon size={16} stroke={1.5} color={theme.colors.gray[6]} />
                    
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Text size="sm" lineClamp={1} style={{ cursor: 'default' }}>
                        {doc.name}
                      </Text>
                      <Group gap={4}>
                        <Text size="xs" c="dimmed">
                          {formatFileSize(doc.size)}
                        </Text>
                      </Group>
                    </Box>
                  </Group>

                  {/* Actions */}
                  <Group gap={4} style={{ flexShrink: 0 }}>
                    {doc.status === 'uploading' && doc.progress !== undefined ? (
                      <Text size="xs" c="dimmed">{doc.progress}%</Text>
                    ) : (
                      <>
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          size="sm"
                          onClick={() => onDownload?.(doc.id)}
                        >
                          <IconDownload size={14} stroke={1.5} />
                        </ActionIcon>
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          size="sm"
                          onClick={() => onDelete?.(doc.id)}
                        >
                          <IconTrash size={14} stroke={1.5} />
                        </ActionIcon>
                      </>
                    )}
                  </Group>
                </Group>
              );
            })}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
};
