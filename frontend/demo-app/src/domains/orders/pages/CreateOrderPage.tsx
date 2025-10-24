import React, { useEffect } from 'react';
import { 
  Title, 
  Text, 
  Stack, 
  Button, 
  Group,
  Box,
  Paper
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-react';
import { OrderServiceLabels } from '../types/order';
import { orderApi } from '../api/orderService';
import { FormProvider, useFormContext } from '../../../hooks/useFormContext';
import { validators } from '../../../hooks/useFormData';
import {
  Grid,
  GridCol,
  GroupGrid,
  FormTextInput,
  FormNumberInput,
  FormFloatInput,
  FormSelectInput,
  FormDateInput,
  FormTimeInput,
  FormSwitchInput,
  TerminalReferenceInput,
  CommoditySelectInput
} from '../../../shared/components';
import { createOrderFormSchema, CreateOrderFormData } from '../schemas/orderSchemas';

// Validation rules for the order form
const orderValidationRules = {
  reference: [
    { validator: validators.required },
    { validator: validators.minLength(1), message: 'Reference is required' }
  ],
  service: [
    { validator: validators.required }
  ],
  terminal_id: [
    { validator: validators.required }
  ],
};

// Form content component that uses the context
const CreateOrderFormContent: React.FC<{
  onBack: () => void;
}> = ({ onBack }) => {
  const navigate = useNavigate();
  const { formData, validateAll, isValid } = useFormContext<CreateOrderFormData>();

  useEffect(() => {
    console.log('isValid changed:', isValid);
    console.log('formData:', formData);
  }, [isValid, formData]);

  const handleSave = async () => {
    // Validate all fields before submission
    if (!validateAll()) {
      console.log('Form validation failed. Please check the errors.');
      return;
    }

    try {
      // Transform form data to API format using Zod schema
      const apiData = createOrderFormSchema.parse(formData) as any;

      console.log('Creating order:', apiData);
      const newOrder = await orderApi.create(apiData);

      // Navigate to the edit page of the newly created order
      if (newOrder && newOrder.id) {
        navigate(`/orders/${newOrder.id}/edit`);
      } else {
        // Fallback to orders list if no ID is returned
        navigate('/');
      }
    } catch (error) {
      console.error('Failed to create order:', error);
      alert(`Failed to create order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const serviceOptions = Object.entries(OrderServiceLabels).map(([value, label]) => ({
    value,
    label
  }));

  return (
    <Box style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8f9fa' }}>
      <Box px="xl" py="md" style={{ flex: 1, width: '100%' }}>
        <Stack gap="md">
          {/* Header */}
          <Stack gap="xs">
            <Button 
              variant="subtle" 
              leftSection={<IconArrowLeft size={16} />}
              onClick={onBack}
              style={{ alignSelf: 'flex-start' }}
            >
              Back to Orders
            </Button>
            
            <Title order={2} fw={600} size="h2">
              Create New Order
            </Title>
            <Text c="dimmed" size="sm">
              Fill in the order details below to create a new shipping order.
            </Text>
          </Stack>

          {/* Form Content */}
          <Paper withBorder p="xl" radius="md" style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'white' }}>
            <Stack gap="lg">
              <GroupGrid title="Order Information">
                <Grid>
                  <GridCol span={3}>
                    <FormTextInput<CreateOrderFormData, 'reference'>
                      label="Reference"
                      source="reference"
                      placeholder="Enter order reference"
                      required
                    />
                  </GridCol>
                  <GridCol span={3}>
                    <TerminalReferenceInput<CreateOrderFormData, 'terminal_id'>
                      label="Terminal"
                      source="terminal_id"
                      placeholder="-- Select Terminal --"
                      required
                    />
                  </GridCol>
                  <GridCol span={3}>
                    <FormSelectInput<CreateOrderFormData, 'service'>
                      label="Service Type"
                      source="service"
                      placeholder="Select service"
                      required
                      data={serviceOptions}
                    />
                  </GridCol>
                  <GridCol span={3}>
                    <FormSwitchInput<CreateOrderFormData, 'priority'>
                      label="Priority Order"
                      source="priority"
                      size="md"
                    />
                  </GridCol>
                </Grid>
              </GroupGrid>

              <Grid gutter="lg">
                <GridCol span={6}>
                  <Box style={{ backgroundColor: '#e8f5e9', padding: '20px', borderRadius: '8px', height: '100%' }}>
                    <GroupGrid title="ETA — ARRIVAL">
                      <Grid>
                        <GridCol span={6}>
                          <FormDateInput<CreateOrderFormData, 'eta_date'>
                            label="ETA Date"
                            source="eta_date"
                            placeholder="Select ETA date"
                          />
                        </GridCol>
                        <GridCol span={6}>
                          <FormTimeInput<CreateOrderFormData, 'eta_time'>
                            label="ETA Time"
                            source="eta_time"
                            placeholder="Select ETA time"
                          />
                        </GridCol>
                      </Grid>
                    </GroupGrid>
                  </Box>
                </GridCol>

                <GridCol span={6}>
                  <Box style={{ backgroundColor: '#fce4ec', padding: '20px', borderRadius: '8px', height: '100%' }}>
                    <GroupGrid title="ETD — DEPARTURE">
                      <Grid>
                        <GridCol span={6}>
                          <FormDateInput<CreateOrderFormData, 'etd_date'>
                            label="ETD Date"
                            source="etd_date"
                            placeholder="Select ETD date"
                          />
                        </GridCol>
                        <GridCol span={6}>
                          <FormTimeInput<CreateOrderFormData, 'etd_time'>
                            label="ETD Time"
                            source="etd_time"
                            placeholder="Select ETD time"
                          />
                        </GridCol>
                      </Grid>
                    </GroupGrid>
                  </Box>
                </GridCol>
              </Grid>

              <GroupGrid title="Cargo Details">
                <Grid>
                  <GridCol span={3}>
                    <CommoditySelectInput<CreateOrderFormData, 'commodity'>
                      label="Commodity Type"
                      source="commodity"
                      placeholder="Select commodity"
                    />
                  </GridCol>
                  <GridCol span={3}>
                    <FormNumberInput<CreateOrderFormData, 'pallets'>
                      label="Pallets"
                      source="pallets"
                      placeholder="0"
                    />
                  </GridCol>
                  <GridCol span={3}>
                    <FormNumberInput<CreateOrderFormData, 'boxes'>
                      label="Boxes"
                      source="boxes"
                      placeholder="0"
                    />
                  </GridCol>
                  <GridCol span={3}>
                    <FormFloatInput<CreateOrderFormData, 'kilos'>
                      label="Weight (kg)"
                      source="kilos"
                      placeholder="0.00"
                      decimalScale={2}
                    />
                  </GridCol>
                </Grid>
              </GroupGrid>

              <GroupGrid title="Additional Information">
                <Grid>
                  <GridCol span={12}>
                    <FormTextInput<CreateOrderFormData, 'notes'>
                      label="Notes"
                      source="notes"
                      placeholder="Some notes..."
                      multiline
                      rows={4}
                    />
                  </GridCol>
                </Grid>
              </GroupGrid>

              {/* Actions */}
              <Group justify="flex-end" mt="md" pt="md" style={{ borderTop: '1px solid var(--mantine-color-gray-3)' }}>
                <Button variant="default" onClick={onBack} size="md">
                  Cancel
                </Button>
                
                <Button 
                  leftSection={<IconDeviceFloppy size={18} />}
                  onClick={handleSave}
                  size="md"
                  disabled={!isValid}
                >
                  Create Order
                </Button>
              </Group>
            </Stack>
          </Paper>
        </Stack>
      </Box>
    </Box>
  );
};

export const CreateOrderPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

  // Initial form data with proper types
  const initialData: CreateOrderFormData = {
    reference: '',
    service: 0,
    terminal_id: '',
    eta_date: null,
    eta_time: '',
    etd_date: null,
    etd_time: '',
    commodity: null,
    pallets: 0,
    boxes: 0,
    kilos: 0,
    notes: '',
    priority: false,
  };

  return (
    <FormProvider<CreateOrderFormData>
      initialData={initialData}
      validationRules={orderValidationRules}
      validateOnBlur={true}
    >
      <CreateOrderFormContent 
        onBack={handleBack}
      />
    </FormProvider>
  );
};