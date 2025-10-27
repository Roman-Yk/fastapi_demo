import React, { useState } from 'react';
import { ActionIcon, Badge, Popover, Stack, Text, Loader, Tooltip, Group, Card, Box } from '@mantine/core';
import { IconFileText, IconEdit, IconFile } from '@tabler/icons-react';
import { FieldProps } from './types';
import { orderDocumentApi } from '../../../domains/orders/api/orderDocumentService';
import { OrderDocument } from '../../../domains/orders/types/document';

export interface DocumentIconFieldProps extends Omit<FieldProps, 'value'> {
  onEdit?: (record: any) => void;
}

export const DocumentIconField: React.FC<DocumentIconFieldProps> = ({
  record,
  onEdit
}) => {
  const [opened, setOpened] = useState(false);
  const [documents, setDocuments] = useState<OrderDocument[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!record) {
    return null;
  }

  // Show edit button if no documents
  if (!record.documents_count || record.documents_count === 0) {
    return (
      <Tooltip label="Edit Order">
        <ActionIcon
          variant="subtle"
          color="blue"
          size="sm"
          onClick={() => onEdit?.(record)}
        >
          <IconEdit size={16} />
        </ActionIcon>
      </Tooltip>
    );
  }

  const handleMouseEnter = async () => {
    // Only fetch if we haven't already
    if (!documents && !loading) {
      setLoading(true);
      setError(null);
      try {
        const docs = await orderDocumentApi.getByOrderId(record.id);
        setDocuments(docs);
      } catch (err) {
        console.error('Failed to load documents:', err);
        setError('Failed to load documents');
      } finally {
        setLoading(false);
      }
    }
    setOpened(true);
  };

  const handleMouseLeave = () => {
    setOpened(false);
  };

  const handleClick = () => {
    if (onEdit) {
      onEdit(record);
    }
  };

  const handleDocumentClick = (doc: OrderDocument, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the icon click
    orderDocumentApi.viewDocument(record.id, doc.id);
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Popover
        opened={opened}
        width={300}
        position="bottom"
        withArrow
        shadow="md"
      >
        <Popover.Target>
          <Tooltip label={`${record.documents_count} document${record.documents_count > 1 ? 's' : ''}`}>
            <ActionIcon
              variant="subtle"
              color="blue"
              size="sm"
              onClick={handleClick}
              style={{ position: 'relative' }}
            >
              <IconFileText size={16} />
              {record.documents_count > 0 && (
                <Badge
                  size="xs"
                  variant="filled"
                  color="blue"
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    minWidth: 16,
                    height: 16,
                    padding: '0 4px',
                    fontSize: 10
                  }}
                >
                  {record.documents_count}
                </Badge>
              )}
            </ActionIcon>
          </Tooltip>
        </Popover.Target>

        <Popover.Dropdown>
          <Stack gap="xs">
            <Text size="sm" fw={600}>Documents ({record.documents_count})</Text>
            {loading && (
              <Group justify="center" p="md">
                <Loader size="sm" />
              </Group>
            )}
            {error && (
              <Text size="sm" c="red">{error}</Text>
            )}
            {documents && documents.length > 0 && (
              <Stack gap="xs">
                {documents.map((doc) => (
                  <Card
                    key={doc.id}
                    padding="sm"
                    radius="md"
                    withBorder
                    style={{
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onClick={(e) => handleDocumentClick(doc, e)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--mantine-color-blue-0)';
                      e.currentTarget.style.borderColor = 'var(--mantine-color-blue-4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.borderColor = 'var(--mantine-color-gray-3)';
                    }}
                  >
                    <Group gap="sm" wrap="nowrap">
                      <Box style={{ flexShrink: 0 }}>
                        <IconFile size={20} color="var(--mantine-color-blue-6)" />
                      </Box>
                      <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                        <Text size="sm" fw={500} lineClamp={1}>
                          {doc.title || 'Untitled'}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {doc.type}
                        </Text>
                      </Stack>
                    </Group>
                  </Card>
                ))}
              </Stack>
            )}
            {documents && documents.length === 0 && (
              <Text size="sm" c="dimmed">No documents found</Text>
            )}
          </Stack>
        </Popover.Dropdown>
      </Popover>
    </div>
  );
};
