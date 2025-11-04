import React, { useState } from 'react';
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
import { OrderService } from '../types/order';
import { orderApi } from '../api/orderService';
import { ServiceSelectInput } from '../components';
import { FormProvider, useFormContext } from '../../../hooks/useFormContext';
import { validators } from '../../../hooks/useFormData';
import { notify } from '../../../shared/services/notificationService';
import { useOrderValidation } from '../validation';
import {
  Grid,
  GridCol,
  GroupGrid,
  FormTextField,
  FormNumberInput,
  FormFloatInput,
  DatePicker,
  TimePicker,
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
  const { formData, setForm, validateAll, isValid } = useFormContext<CreateOrderFormData>();
  const { validateCreateOrder, isValidating } = useOrderValidation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isCCOrCTC = formData.service === OrderService.RELOAD_CAR_CAR ||
                    formData.service === OrderService.RELOAD_CAR_TERMINAL_CAR;

  const handleSave = async () => {
    // Prevent double submission
    if (isSubmitting || isValidating) return;

    // Validate required fields
    if (!validateAll()) {
      notify.error('Please fill in all required fields');
      return;
    }

    // Validate order-specific business rules (dates, reference uniqueness, etc.)
    const isValid = await validateCreateOrder(formData);
    if (!isValid) {
      return; // Errors already shown via toast notifications
    }

    try {
      setIsSubmitting(true);

      // Transform form data to API format using Zod schema
      const apiData = createOrderFormSchema.parse(formData) as any;

      console.log('Creating order:', apiData);
      const newOrder = await orderApi.create(apiData);

      // Show success notification
      notify.success('Order created successfully!');

      // Navigate to the edit page of the newly created order
      if (newOrder && newOrder.id) {
        navigate(`/orders/${newOrder.id}/edit`);
      } else {
        // Fallback to orders list if no ID is returned
        navigate('/');
      }
    } catch (error) {
      console.error('Failed to create order:', error);
      notify.error(`Failed to create order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

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
                    <FormTextField
                      label="Reference"
                      placeholder="Enter order reference"
                      required
                      value={formData.reference}
                      onChange={(value) => setForm(prev => ({ ...prev, reference: value }))}
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
                    <ServiceSelectInput<CreateOrderFormData, 'service'>
                      source="service"
                      required
                    />
                  </GridCol>
                  <GridCol span={3}>
                    <Box style={{ paddingTop: '28px' }}>
                      <FormSwitchInput<CreateOrderFormData, 'priority'>
                        label="Priority Order"
                        source="priority"
                        size="md"
                      />
                    </Box>
                  </GridCol>
                </Grid>
              </GroupGrid>

              <Grid gutter="lg">
                <GridCol span={6}>
                  <Box style={{ backgroundColor: '#e8f5e9', padding: '20px', borderRadius: '8px', height: '100%' }}>
                    <GroupGrid title="ETA — ARRIVAL">
                      <Grid>
                        <GridCol span={6}>
                          <DatePicker
                            label="ETA Date"
                            placeholder="Select ETA date"
                            value={formData.eta_date}
                            onChange={(value) => setForm(prev => {
                              // For CC/CTC orders, sync both dates
                              if (isCCOrCTC) {
                                return { ...prev, eta_date: value, etd_date: value };
                              }
                              return { ...prev, eta_date: value };
                            })}
                          />
                        </GridCol>
                        <GridCol span={6}>
                          <TimePicker
                            label="ETA Time"
                            placeholder="Select ETA time"
                            value={formData.eta_time}
                            onChange={(value) => setForm(prev => {
                              // For CC/CTC orders, sync both times
                              if (isCCOrCTC) {
                                return { ...prev, eta_time: value || '', etd_time: value || '' };
                              }
                              return { ...prev, eta_time: value || '' };
                            })}
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
                          <DatePicker
                            label="ETD Date"
                            placeholder="Select ETD date"
                            value={formData.etd_date}
                            onChange={(value) => setForm(prev => {
                              // For CC/CTC orders, sync both dates
                              if (isCCOrCTC) {
                                return { ...prev, eta_date: value, etd_date: value };
                              }
                              return { ...prev, etd_date: value };
                            })}
                          />
                        </GridCol>
                        <GridCol span={6}>
                          <TimePicker
                            label="ETD Time"
                            placeholder="Select ETD time"
                            value={formData.etd_time}
                            onChange={(value) => setForm(prev => {
                              // For CC/CTC orders, sync both times
                              if (isCCOrCTC) {
                                return { ...prev, eta_time: value || '', etd_time: value || '' };
                              }
                              return { ...prev, etd_time: value || '' };
                            })}
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
                    <FormTextField
                      label="Notes"
                      placeholder="Some notes..."
                      value={formData.notes || ''}
                      onChange={(value) => setForm(prev => ({ ...prev, notes: value }))}
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
                  disabled={!isValid || isSubmitting || isValidating}
                  loading={isSubmitting || isValidating}
                >
                  {isSubmitting ? 'Creating...' : isValidating ? 'Validating...' : 'Create Order'}
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