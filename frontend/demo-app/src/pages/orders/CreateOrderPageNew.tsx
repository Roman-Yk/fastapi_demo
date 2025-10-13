import React, { useState, useEffect } from 'react';
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
import { 
  Grid, 
  GridCol, 
  GroupGrid, 
  ContextFormTextField, 
  ContextFormSelectField,
  ContextFormDateField,
  ContextFormTimePicker,
  ContextFormSwitchField
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
}

// Form content component that uses the context
const CreateOrderFormContent: React.FC<{
  terminals: Array<{value: string, label: string}>;
  loading: boolean;
  onBack: () => void;
}> = ({ terminals, loading, onBack }) => {
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
                    <ContextFormSelectField
                      label="Terminal"
                      source="terminal_id"
                      placeholder={loading ? "Loading terminals..." : "Select terminal"}
                      required
                      data={terminals}
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
  const [terminals, setTerminals] = useState<Array<{value: string, label: string}>>([]);
  const [loading, setLoading] = useState(true);

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
  };

  // Load terminals from API
  useEffect(() => {
    const loadTerminals = async () => {
      try {
        const terminalsData = await ApiService.getTerminals();
        const terminalOptions = terminalsData.map(terminal => ({
          value: terminal.id,
          label: terminal.name
        }));
        setTerminals(terminalOptions);
      } catch (error) {
        console.error('Failed to load terminals:', error);
        // Fallback to default options
        setTerminals([
          { value: 'dc170a0a-a896-411e-9b5a-f466d834ec77', label: 'Terminal 1' },
          { value: '004f7daa-50dc-48f4-acb5-9dfe69b2e92c', label: 'Terminal 2' },
          { value: '0f74eb29-4dd7-4139-8718-db7eef530dbf', label: 'Terminal 3' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadTerminals();
  }, []);

  const handleBack = () => {
    navigate('/');
  };

  return (
    <FormProvider initialData={initialFormData}>
      <CreateOrderFormContent 
        terminals={terminals}
        loading={loading}
        onBack={handleBack}
      />
    </FormProvider>
  );
};