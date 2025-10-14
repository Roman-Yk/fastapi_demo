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
import { transformFormData, ORDER_FORM_CONFIG } from '../../utils/formTransform';

// Form content component that uses the context
const CreateOrderFormContent: React.FC<{
  onBack: () => void;
}> = ({ onBack }) => {
  const navigate = useNavigate();
  const { formData } = useFormContext();

  const handleSave = async () => {
    try {
      // Transform form data to API format automatically
      const apiData = transformFormData(formData, ORDER_FORM_CONFIG);
      
      console.log('Creating order:', apiData);
      await ApiService.createOrder(apiData);
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

  const handleBack = () => {
    navigate('/');
  };

  return (
    <ReferenceDataProvider>
      <FormProvider initialData={{}}>
        <CreateOrderFormContent 
          onBack={handleBack}
        />
      </FormProvider>
    </ReferenceDataProvider>
  );
};