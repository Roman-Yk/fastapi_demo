import React, { useEffect } from 'react';
import { 
  Container, 
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
import { OrderServiceLabels, CommodityLabels } from '../types/order';
import ApiService from '../../../services/apiService';
import { FormProvider, useFormContext } from '../../../hooks/useFormContext';
import { validators } from '../../../hooks/useFormData';
import { 
  Grid, 
  GridCol, 
  GroupGrid, 
  FormTextInput, 
  FormSelectInput,
  FormDateInput,
  FormTimeInput,
  FormSwitchInput,
  DriverReferenceField,
  TruckReferenceField,
  TrailerReferenceField,
  TerminalReferenceField
} from '../../../shared/components';
import { transformFormData, ORDER_FORM_CONFIG } from '../../../utils/formTransform';

// TypeScript interface for order form data
interface OrderFormData {
  reference: string;
  service: string;
  terminal_id: string | null;
  eta_date: Date | null;
  eta_time: string;
  etd_date: Date | null;
  etd_time: string;
  eta_driver_id: string | null;
  eta_truck_id: string | null;
  eta_trailer_id: string | null;
  etd_driver_id: string | null;
  etd_truck_id: string | null;
  etd_trailer_id: string | null;
  commodity: string;
  pallets: number;
  boxes: number;
  kilos: number;
  notes: string;
  priority: boolean;
}

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
  const { formData, validateAll, isValid } = useFormContext<OrderFormData>();

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
      // Transform form data to API format automatically
      const apiData = transformFormData(formData, ORDER_FORM_CONFIG);
      
      console.log('Creating order:', apiData);
      const newOrder = await ApiService.createOrder(apiData);
      
      // Navigate to the edit page of the newly created order
      if (newOrder && newOrder.id) {
        navigate(`/orders/${newOrder.id}/edit`);
      } else {
        // Fallback to orders list if no ID is returned
        navigate('/');
      }
    } catch (error) {
      console.error('Failed to create order:', error);
      // TODO: Show error notification to user
    }
  };

  const serviceOptions = Object.entries(OrderServiceLabels).map(([value, label]) => ({
    value,
    label
  }));

  const commodityOptions = Object.entries(CommodityLabels).map(([value, label]) => ({
    value,
    label
  }));

  return (
    <Box style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Container size="lg" px="md" py="sm" style={{ flex: 1 }}>
        <Stack gap="sm">
          {/* Header */}
          <Stack gap="xs">
            <Group>
              <Button 
                variant="subtle" 
                leftSection={<IconArrowLeft size={16} />}
                onClick={onBack}
              >
                Back to Orders
              </Button>
            </Group>
            
            <Title order={1} fw={600}>
              Create New Order
            </Title>
            <Text c="dimmed" size="sm">
              Fill in the order details below to create a new shipping order.
            </Text>
          </Stack>

          {/* Form Content */}
          <Paper withBorder p="md" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Stack gap="md">
              <GroupGrid title="Order Information">
                <Grid>
                  <GridCol span={6}>
                    <FormTextInput<OrderFormData, 'reference'>
                      label="Reference"
                      source="reference"
                      placeholder="Enter order reference"
                      required
                    />
                  </GridCol>
                  <GridCol span={6}>
                    <FormSelectInput<OrderFormData, 'service'>
                      label="Service Type"
                      source="service"
                      placeholder="Select service"
                      required
                      data={serviceOptions}
                    />
                  </GridCol>
                </Grid>
              </GroupGrid>

              <GroupGrid title="Location & Schedule">
                <Grid>
                  <GridCol span={6}>
                    <TerminalReferenceField<OrderFormData, 'terminal_id'>
                      label="Terminal"
                      source="terminal_id"
                      placeholder="Select terminal"
                      required
                    />
                  </GridCol>
                </Grid>
              
                <Grid>
                  <GridCol span={3}>
                    <FormDateInput<OrderFormData, 'eta_date'>
                      label="ETA Date"
                      source="eta_date"
                      placeholder="Select ETA date"
                    />
                  </GridCol>
                  <GridCol span={3}>
                    <FormTimeInput<OrderFormData, 'eta_time'>
                      label="ETA Time"
                      source="eta_time"
                      placeholder="Select ETA time"
                    />
                  </GridCol>
                  
                  <GridCol span={3}>
                    <FormDateInput<OrderFormData, 'etd_date'>
                      label="ETD Date"
                      source="etd_date"
                      placeholder="Select ETD date"
                    />
                  </GridCol>
                  <GridCol span={3}>
                    <FormTimeInput<OrderFormData, 'etd_time'>
                      label="ETD Time"
                      source="etd_time"
                      placeholder="Select ETD time"
                    />
                  </GridCol>
                </Grid>
              </GroupGrid>

              <GroupGrid title="ETA Vehicle & Driver">
                <Grid>
                  <GridCol span={4}>
                    <DriverReferenceField<OrderFormData, 'eta_driver_id'>
                      label="ETA Driver"
                      source="eta_driver_id"
                      placeholder="Select driver"
                    />
                  </GridCol>
                  <GridCol span={4}>
                    <TruckReferenceField<OrderFormData, 'eta_truck_id'>
                      label="ETA Truck"
                      source="eta_truck_id"
                      placeholder="Select truck"
                    />
                  </GridCol>
                  <GridCol span={4}>
                    <TrailerReferenceField<OrderFormData, 'eta_trailer_id'>
                      label="ETA Trailer"
                      source="eta_trailer_id"
                      placeholder="Select trailer"
                    />
                  </GridCol>
                </Grid>
              </GroupGrid>

              <GroupGrid title="ETD Vehicle & Driver">
                <Grid>
                  <GridCol span={4}>
                    <DriverReferenceField<OrderFormData, 'etd_driver_id'>
                      label="ETD Driver"
                      source="etd_driver_id"
                      placeholder="Select driver"
                    />
                  </GridCol>
                  <GridCol span={4}>
                    <TruckReferenceField<OrderFormData, 'etd_truck_id'>
                      label="ETD Truck"
                      source="etd_truck_id"
                      placeholder="Select truck"
                    />
                  </GridCol>
                  <GridCol span={4}>
                    <TrailerReferenceField<OrderFormData, 'etd_trailer_id'>
                      label="ETD Trailer"
                      source="etd_trailer_id"
                      placeholder="Select trailer"
                    />
                  </GridCol>
                </Grid>
              </GroupGrid>

              <GroupGrid title="Cargo Details">
                <Grid>
                  <GridCol span={6}>
                    <FormSelectInput<OrderFormData, 'commodity'>
                      label="Commodity Type"
                      source="commodity"
                      placeholder="Select commodity"
                      data={commodityOptions}
                    />
                  </GridCol>
                </Grid>
                
                <Grid>
                  <GridCol span={4}>
                    <FormTextInput<OrderFormData, 'pallets'>
                      label="Pallets"
                      source="pallets"
                      placeholder="Number of pallets"
                      type="number"
                    />
                  </GridCol>
                  <GridCol span={4}>
                    <FormTextInput<OrderFormData, 'boxes'>
                      label="Boxes"
                      source="boxes"
                      placeholder="Number of boxes"
                      type="number"
                    />
                  </GridCol>
                  <GridCol span={4}>
                    <FormTextInput<OrderFormData, 'kilos'>
                      label="Weight (kg)"
                      source="kilos"
                      placeholder="Weight in kilograms"
                      type="number"
                    />
                  </GridCol>
                </Grid>
              </GroupGrid>

              <GroupGrid title="Additional Information">
                <Grid>
                  <GridCol span={9}>
                    <FormTextInput<OrderFormData, 'notes'>
                      label="Notes"
                      source="notes"
                      placeholder="Some notes..."
                      multiline
                      rows={2}
                    />
                  </GridCol>
                  <GridCol span={3}>
                    <Stack gap="md" pt="lg">
                      <FormSwitchInput<OrderFormData, 'priority'>
                        label="Priority Order"
                        source="priority"
                        size="md"
                      />
                    </Stack>
                  </GridCol>
                </Grid>
              </GroupGrid>

              {/* Actions */}
              <Group justify="space-between" mt="md" pt="md" style={{ borderTop: '1px solid var(--mantine-color-gray-3)' }}>
                <Button variant="light" onClick={onBack}>
                  Cancel
                </Button>
                
                <Button 
                  leftSection={<IconDeviceFloppy size={16} />}
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
      </Container>
    </Box>
  );
};

export const CreateOrderPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

  // Initial form data with proper types
  const initialData: OrderFormData = {
    reference: '',
    service: '',
    terminal_id: null,
    eta_date: null,
    eta_time: '',
    etd_date: null,
    etd_time: '',
    eta_driver_id: null,
    eta_truck_id: null,
    eta_trailer_id: null,
    etd_driver_id: null,
    etd_truck_id: null,
    etd_trailer_id: null,
    commodity: '',
    pallets: 0,
    boxes: 0,
    kilos: 0,
    notes: '',
    priority: false,
  };

  return (
    <FormProvider<OrderFormData>
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