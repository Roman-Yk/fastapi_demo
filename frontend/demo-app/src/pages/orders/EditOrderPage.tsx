import React from 'react';
import { Container, Title, Text, Stack, Button, Paper, Group } from '@mantine/core';
import { useNavigate, useParams } from 'react-router-dom';
import { IconArrowLeft, IconDeviceFloppy, IconTrash } from '@tabler/icons-react';

export const EditOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();

  const handleBack = () => {
    navigate('/');
  };

  const handleSave = () => {
    // TODO: Implement order update logic
    console.log('Save order:', orderId);
    navigate('/');
  };

  const handleDelete = () => {
    // TODO: Implement order deletion logic
    if (window.confirm('Are you sure you want to delete this order?')) {
      console.log('Delete order:', orderId);
      navigate('/');
    }
  };

  return (
    <Container size="md" px="xl" py="sm">
      <Stack gap="lg">
        {/* Header */}
        <Stack gap="xs">
          <Button 
            variant="subtle" 
            leftSection={<IconArrowLeft size={16} />}
            onClick={handleBack}
            size="sm"
            style={{ alignSelf: 'flex-start' }}
          >
            Back to Orders
          </Button>
          
          <Title order={2}>Edit Order {orderId}</Title>
          <Text c="dimmed">Update the order details below</Text>
        </Stack>

        {/* Form */}
        <Paper withBorder p="xl">
          <Stack gap="md">
            <Text size="lg" fw={500}>Order Details</Text>
            <Text c="dimmed">
              This is a placeholder for the order editing form.
              Order ID: {orderId}
            </Text>
            
            {/* TODO: Add order form fields here with pre-filled values */}
            
            <Group justify="space-between" pt="md">
              <Button 
                variant="light"
                color="red"
                leftSection={<IconTrash size={16} />}
                onClick={handleDelete}
              >
                Delete Order
              </Button>
              
              <Button 
                leftSection={<IconDeviceFloppy size={16} />}
                onClick={handleSave}
              >
                Save Changes
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}; 