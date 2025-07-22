import React from 'react';
import { Container, Title, Text, Stack, Button, Paper } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { IconArrowLeft, IconPlus } from '@tabler/icons-react';

export const CreateOrderPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

  const handleSave = () => {
    // TODO: Implement order creation logic
    console.log('Save new order');
    navigate('/');
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
          
          <Title order={2}>Create New Order</Title>
          <Text c="dimmed">Fill in the details to create a new order</Text>
        </Stack>

        {/* Form */}
        <Paper withBorder p="xl">
          <Stack gap="md">
            <Text size="lg" fw={500}>Order Form</Text>
            <Text c="dimmed">
              This is a placeholder for the order creation form.
              You can add form fields here using the FormField components.
            </Text>
            
            {/* TODO: Add order form fields here */}
            <Stack gap="sm" pt="md">
              <Button 
                leftSection={<IconPlus size={16} />}
                onClick={handleSave}
              >
                Create Order
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}; 