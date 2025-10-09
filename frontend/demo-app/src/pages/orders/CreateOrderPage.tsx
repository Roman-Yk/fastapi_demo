import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Title, 
  Text, 
  Stack, 
  Button, 
  Switch, 
  Group,
  Box,
  Paper
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useNavigate } from 'react-router-dom';
import { IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-react';
import { OrderService, CommodityType, OrderServiceLabels, CommodityLabels } from '../../types/order';
import ApiService from '../../services/apiService';
import { 
  Grid, 
  GridCol, 
  GroupGrid, 
  TextField, 
  SelectField, 
  TimePicker 
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

export const CreateOrderPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [form, setForm] = useState<CreateOrderForm>({
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
  });

  const [terminals, setTerminals] = useState<Array<{value: string, label: string}>>([]);
  const [loading, setLoading] = useState(true);

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

  const handleSave = async () => {
    try {
      // Convert form data to API format
      const orderData = {
        reference: form.reference,
        service: form.service!,
        terminal_id: form.terminal_id,
        eta_date: form.eta_date?.toISOString().split('T')[0],
        eta_time: form.eta_time || undefined,
        etd_date: form.etd_date?.toISOString().split('T')[0],
        etd_time: form.etd_time || undefined,
        commodity: form.commodity || undefined,
        pallets: typeof form.pallets === 'number' ? form.pallets : (form.pallets ? parseFloat(form.pallets.toString()) : undefined),
        boxes: typeof form.boxes === 'number' ? form.boxes : (form.boxes ? parseFloat(form.boxes.toString()) : undefined),
        kilos: typeof form.kilos === 'number' ? form.kilos : (form.kilos ? parseFloat(form.kilos.toString()) : undefined),
        notes: form.notes || undefined,
        priority: form.priority,
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
                onClick={handleBack}
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
                    <TextField
                      label="Reference"
                      placeholder="Enter order reference"
                      required
                      value={form.reference}
                      onChange={(value) => setForm(prev => ({ ...prev, reference: value }))}
                    />
                  </GridCol>
                  <GridCol span={6}>
                    <SelectField
                      label="Service Type"
                      placeholder="Select service"
                      required
                      data={serviceOptions}
                      value={form.service?.toString() || ''}
                      onChange={(value) => setForm(prev => ({ 
                        ...prev, 
                        service: value ? parseInt(value) as OrderService : null 
                      }))}
                    />
                  </GridCol>
                </Grid>
              </GroupGrid>

              <GroupGrid title="Location & Schedule">
                <Grid>
                  <GridCol span={6}>
                    <SelectField
                      label="Terminal"
                      placeholder={loading ? "Loading terminals..." : "Select terminal"}
                      required
                      data={terminals}
                      value={form.terminal_id}
                      onChange={(value) => setForm(prev => ({ ...prev, terminal_id: value || '' }))}
                    />
                  </GridCol>
                </Grid>
              
              <Grid>
                <GridCol span={3}>
                  <DateInput
                    label="ETA Date"
                    placeholder="Select ETA date"
                    value={form.eta_date}
                    onChange={(value) => setForm(prev => ({ ...prev, eta_date: value }))}
                  />
                </GridCol>
                <GridCol span={3}>
                  <TimePicker
                    label="ETA Time"
                    placeholder="Select ETA time"
                    value={form.eta_time}
                    onChange={(value) => setForm(prev => ({ ...prev, eta_time: value || '' }))}
                  />
                </GridCol>
                
                <GridCol span={3}>
                  <DateInput
                    label="ETD Date"
                    placeholder="Select ETD date"
                    value={form.etd_date}
                    onChange={(value) => setForm(prev => ({ ...prev, etd_date: value }))}
                  />
                </GridCol>
                <GridCol span={3}>
                  <TimePicker
                    label="ETD Time"
                    placeholder="Select ETD time"
                    value={form.etd_time}
                    onChange={(value) => setForm(prev => ({ ...prev, etd_time: value || '' }))}
                  />
                </GridCol>
              </Grid>
            </GroupGrid>

            <GroupGrid title="Cargo Details">
              <Grid>
                <GridCol span={6}>
                  <SelectField
                    label="Commodity Type"
                    placeholder="Select commodity"
                    data={commodityOptions}
                    value={form.commodity || ''}
                    onChange={(value) => setForm(prev => ({ 
                      ...prev, 
                      commodity: value as CommodityType || null 
                    }))}
                  />
                </GridCol>
              </Grid>
              
              <Grid>
                <GridCol span={4}>
                  <TextField
                    label="Pallets"
                    placeholder="Number of pallets"
                    type="number"
                    value={form.pallets.toString()}
                    onChange={(value) => setForm(prev => ({ ...prev, pallets: value }))}
                  />
                </GridCol>
                <GridCol span={4}>
                  <TextField
                    label="Boxes"
                    placeholder="Number of boxes"
                    type="number"
                    value={form.boxes.toString()}
                    onChange={(value) => setForm(prev => ({ ...prev, boxes: value }))}
                  />
                </GridCol>
                <GridCol span={4}>
                  <TextField
                    label="Weight (kg)"
                    placeholder="Weight in kilograms"
                    type="number"
                    value={form.kilos.toString()}
                    onChange={(value) => setForm(prev => ({ ...prev, kilos: value }))}
                  />
                </GridCol>
              </Grid>
            </GroupGrid>

            <GroupGrid title="Additional Information">
              <Grid>
                <GridCol span={9}>
                  <TextField
                    label="Notes"
                    placeholder="Some notes..."
                    value={form.notes}
                    onChange={(value) => setForm(prev => ({ ...prev, notes: value }))}
                    multiline
                    rows={2}
                  />
                </GridCol>
                <GridCol span={3}>
                  <Stack gap="md" pt="lg">
                    <Switch
                      label="Priority Order"
                      checked={form.priority}
                      onChange={(e) => setForm(prev => ({ ...prev, priority: e.target.checked }))}
                      size="md"
                    />
                  </Stack>
                </GridCol>
              </Grid>
            </GroupGrid>

            {/* Actions */}
            <Group justify="space-between" mt="md" pt="md" style={{ borderTop: '1px solid var(--mantine-color-gray-3)' }}>
              <Button 
                variant="light" 
                onClick={handleBack}
              >
                Cancel
              </Button>
              
              <Button 
                leftSection={<IconDeviceFloppy size={16} />}
                onClick={handleSave}
                size="md"
                disabled={!form.reference || !form.service || !form.terminal_id}
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
