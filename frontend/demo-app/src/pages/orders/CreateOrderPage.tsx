import React from 'react';
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
import { OrderService, CommodityType, OrderServiceLabels, CommodityLabels } from '../../types/order';
import ApiService from '../../services/apiService';
import { FormProvider, useFormContext } from '../../hooks/useFormContext';
import { ReferenceDataProvider } from '../../context/ReferenceDataContext';
import { 
  Grid, 
  GridCol, 
  GroupGrid, 
  ContextFormTextField, 
  ContextFormSelectField,
  ContextFormDateField,
  ContextFormTimePicker,
  ContextFormSwitchField,
  DriverReferenceField,
  TruckReferenceField,
  TrailerReferenceField,
  TerminalReferenceField
} from '../../components/admin/forms';

interface CreateOrderForm {
  reference: string;
  service: OrderService | null;
  eta_date: Date | null;
  eta_time: string;
  etd_date: Date | null;
  etd_time: string;
  commodity: CommodityType | null;
  pallets: string | number;
  boxes: string | number;
  kilos: string | number;
  notes: string;
  priority: boolean;
  terminal_id: string;
  // ETA reference fields
  eta_driver_id: string | null;
  eta_truck_id: string | null;
  eta_trailer_id: string | null;
  // ETD reference fields
  etd_driver_id: string | null;
  etd_truck_id: string | null;
  etd_trailer_id: string | null;
}

// Form content component that uses the context
const CreateOrderFormContent: React.FC<{
  onBack: () => void;
}> = ({ onBack }) => {
  const navigate = useNavigate();
  const { formData } = useFormContext<CreateOrderForm>();

  const handleSave = async () => {
    try {
      // Convert form data to API format
      const orderData = {
        reference: formData.reference,
        service: formData.service!,
        terminal_id: formData.terminal_id,
        eta_date: formData.eta_date?.toISOString().split('T')[0],
        eta_time: formData.eta_time || undefined,
        etd_date: formData.etd_date?.toISOString().split('T')[0],
        etd_time: formData.etd_time || undefined,
        commodity: formData.commodity || undefined,
        pallets: typeof formData.pallets === 'number' ? formData.pallets : (formData.pallets ? parseFloat(formData.pallets.toString()) : undefined),
        boxes: typeof formData.boxes === 'number' ? formData.boxes : (formData.boxes ? parseFloat(formData.boxes.toString()) : undefined),
        kilos: typeof formData.kilos === 'number' ? formData.kilos : (formData.kilos ? parseFloat(formData.kilos.toString()) : undefined),
        notes: formData.notes || undefined,
        priority: formData.priority,
        // ETA vehicle assignments
        eta_driver_id: formData.eta_driver_id || undefined,
        eta_truck_id: formData.eta_truck_id || undefined,
        eta_trailer_id: formData.eta_trailer_id || undefined,
        // ETD vehicle assignments  
        etd_driver_id: formData.etd_driver_id || undefined,
        etd_truck_id: formData.etd_truck_id || undefined,
        etd_trailer_id: formData.etd_trailer_id || undefined,
      };
      
      console.log('Creating order:', orderData);
      await ApiService.createOrder(orderData);
      navigate('/');
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
                    <ContextFormTextField
                      label="Reference"
                      source="reference"
                      placeholder="Enter order reference"
                      required
                    />
                  </GridCol>
                  <GridCol span={6}>
                    <ContextFormSelectField
                      label="Service Type"
                      source="service"
                      placeholder="Select service"
                      required
                      data={serviceOptions}
                      transform={(value: any) => value ? parseInt(value) as OrderService : null}
                    />
                  </GridCol>
                </Grid>
              </GroupGrid>

              <GroupGrid title="Location & Schedule">
                <Grid>
                  <GridCol span={6}>
                    <TerminalReferenceField
                      label="Terminal"
                      source="terminal_id"
                      placeholder="Select terminal"
                      required
                    />
                  </GridCol>
                </Grid>
              
                <Grid>
                  <GridCol span={3}>
                    <ContextFormDateField
                      label="ETA Date"
                      source="eta_date"
                      placeholder="Select ETA date"
                    />
                  </GridCol>
                  <GridCol span={3}>
                    <ContextFormTimePicker
                      label="ETA Time"
                      source="eta_time"
                      placeholder="Select ETA time"
                    />
                  </GridCol>
                  
                  <GridCol span={3}>
                    <ContextFormDateField
                      label="ETD Date"
                      source="etd_date"
                      placeholder="Select ETD date"
                    />
                  </GridCol>
                  <GridCol span={3}>
                    <ContextFormTimePicker
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
                    <DriverReferenceField
                      label="ETA Driver"
                      source="eta_driver_id"
                      placeholder="Select driver"
                    />
                  </GridCol>
                  <GridCol span={4}>
                    <TruckReferenceField
                      label="ETA Truck"
                      source="eta_truck_id"
                      placeholder="Select truck"
                    />
                  </GridCol>
                  <GridCol span={4}>
                    <TrailerReferenceField
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
                    <DriverReferenceField
                      label="ETD Driver"
                      source="etd_driver_id"
                      placeholder="Select driver"
                    />
                  </GridCol>
                  <GridCol span={4}>
                    <TruckReferenceField
                      label="ETD Truck"
                      source="etd_truck_id"
                      placeholder="Select truck"
                    />
                  </GridCol>
                  <GridCol span={4}>
                    <TrailerReferenceField
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
                    <ContextFormSelectField
                      label="Commodity Type"
                      source="commodity"
                      placeholder="Select commodity"
                      data={commodityOptions}
                      transform={(value: any) => value as CommodityType || null}
                    />
                  </GridCol>
                </Grid>
                
                <Grid>
                  <GridCol span={4}>
                    <ContextFormTextField
                      label="Pallets"
                      source="pallets"
                      placeholder="Number of pallets"
                      type="number"
                    />
                  </GridCol>
                  <GridCol span={4}>
                    <ContextFormTextField
                      label="Boxes"
                      source="boxes"
                      placeholder="Number of boxes"
                      type="number"
                    />
                  </GridCol>
                  <GridCol span={4}>
                    <ContextFormTextField
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
                    <ContextFormTextField
                      label="Notes"
                      source="notes"
                      placeholder="Some notes..."
                      multiline
                      rows={2}
                    />
                  </GridCol>
                  <GridCol span={3}>
                    <Stack gap="md" pt="lg">
                      <ContextFormSwitchField
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
                  disabled={!formData.reference || !formData.service || !formData.terminal_id}
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

  const initialFormData: CreateOrderForm = {
    reference: '',
    service: null,
    eta_date: null,
    eta_time: '',
    etd_date: null,
    etd_time: '',
    commodity: null,
    pallets: '',
    boxes: '',
    kilos: '',
    notes: '',
    priority: false,
    terminal_id: '',
    eta_driver_id: null,
    eta_truck_id: null,
    eta_trailer_id: null,
    etd_driver_id: null,
    etd_truck_id: null,
    etd_trailer_id: null,
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <ReferenceDataProvider>
      <FormProvider initialData={initialFormData}>
        <CreateOrderFormContent 
          onBack={handleBack}
        />
      </FormProvider>
    </ReferenceDataProvider>
  );
};