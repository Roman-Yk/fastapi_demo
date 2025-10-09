import React, { useState } from 'react';
import { 
  Container, 
  Title, 
  Text, 
  Stack, 
  Button, 
  Switch, 
  Group,
  Box
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useNavigate } from 'react-router-dom';
import { IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-react';
import { OrderService, CommodityType, OrderServiceLabels, CommodityLabels } from '../../types/order';
import { 
  Form, 
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
    terminal_id: ''
  });

  const handleBack = () => {
    navigate('/');
  };

  const handleSave = () => {
    // Convert form data to API format
    const orderData = {
      reference: form.reference,
      service: form.service,
      eta_date: form.eta_date?.toISOString().split('T')[0] || null,
      eta_time: form.eta_time || null,
      etd_date: form.etd_date?.toISOString().split('T')[0] || null,
      etd_time: form.etd_time || null,
      commodity: form.commodity,
      pallets: typeof form.pallets === 'number' ? form.pallets : (form.pallets ? parseFloat(form.pallets.toString()) : null),
      boxes: typeof form.boxes === 'number' ? form.boxes : (form.boxes ? parseFloat(form.boxes.toString()) : null),
      kilos: typeof form.kilos === 'number' ? form.kilos : (form.kilos ? parseFloat(form.kilos.toString()) : null),
      notes: form.notes || null,
      priority: form.priority,
      terminal_id: parseInt(form.terminal_id) || 1
    };
    
    console.log('Creating order:', orderData);
    // TODO: Implement API call
    navigate('/');
  };

  const serviceOptions = Object.entries(OrderServiceLabels).map(([value, label]) => ({
    value,
    label
  }));

  const commodityOptions = Object.entries(CommodityLabels).map(([value, label]) => ({
    value,
    label
  }));

  const terminalOptions = [
    { value: '1', label: 'Terminal 1' },
    { value: '2', label: 'Terminal 2' },
    { value: '3', label: 'Terminal 3' }
  ];

  return (
    <Box style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Container size="lg" px="md" py="sm" style={{ flex: 1 }}>
        <Stack gap="sm">
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
          <Form>
            {/* Basic Information */}
            <GroupGrid title="Basic Information">
              <Grid>
                <GridCol span={4}>
                  <TextField
                    label="Reference"
                    placeholder="Order reference"
                    value={form.reference}
                    onChange={(value) => setForm(prev => ({ ...prev, reference: value }))}
                    required
                  />
                </GridCol>
                <GridCol span={4}>
                  <SelectField
                    label="Service"
                    placeholder="Select service"
                    data={serviceOptions}
                    value={form.service?.toString() || null}
                    onChange={(value) => setForm(prev => ({ 
                      ...prev, 
                      service: value ? parseInt(value) as OrderService : null 
                    }))}
                    required
                  />
                </GridCol>
                <GridCol span={4}>
                  <SelectField
                    label="Terminal"
                    placeholder="Select terminal"
                    data={terminalOptions}
                    value={form.terminal_id || null}
                    onChange={(value) => setForm(prev => ({ ...prev, terminal_id: value || '' }))}
                    required
                  />
                </GridCol>
              </Grid>
            </GroupGrid>

            {/* Dates & Times */}
            <GroupGrid title="Schedule">
              <Grid>
                <GridCol span={3}>
                  <DateInput
                    label="ETA Date"
                    placeholder="Select ETA date"
                    value={form.eta_date}
                    onChange={(date) => setForm(prev => ({ ...prev, eta_date: date }))}
                  />
                </GridCol>
                <GridCol span={3}>
                  <TimePicker
                    label="ETA Time"
                    value={form.eta_time}
                    onChange={(value) => setForm(prev => ({ ...prev, eta_time: value }))}
                  />
                </GridCol>
                <GridCol span={3}>
                  <DateInput
                    label="ETD Date"
                    placeholder="Select ETD date"
                    value={form.etd_date}
                    onChange={(date) => setForm(prev => ({ ...prev, etd_date: date }))}
                  />
                </GridCol>
                <GridCol span={3}>
                  <TimePicker
                    label="ETD Time"
                    value={form.etd_time}
                    onChange={(value) => setForm(prev => ({ ...prev, etd_time: value }))}
                  />
                </GridCol>
              </Grid>
            </GroupGrid>

            {/* Commodity & Quantities */}
            <GroupGrid title="Cargo Details">
              <Grid>
                <GridCol span={3}>
                  <SelectField
                    label="Commodity"
                    placeholder="Select commodity"
                    data={commodityOptions}
                    value={form.commodity}
                    onChange={(value) => setForm(prev => ({ 
                      ...prev, 
                      commodity: value as CommodityType || null 
                    }))}
                  />
                </GridCol>
                <GridCol span={3}>
                  <TextField
                    label="Pallets"
                    placeholder="10"
                    value={form.pallets}
                    onChange={(value) => setForm(prev => ({ ...prev, pallets: value }))}
                    type="number"
                    min={0}
                  />
                </GridCol>
                <GridCol span={3}>
                  <TextField
                    label="Boxes"
                    placeholder="40"
                    value={form.boxes}
                    onChange={(value) => setForm(prev => ({ ...prev, boxes: value }))}
                    type="number"
                    min={0}
                  />
                </GridCol>
                <GridCol span={3}>
                  <TextField
                    label="Kilos"
                    placeholder="200.5"
                    value={form.kilos}
                    onChange={(value) => setForm(prev => ({ ...prev, kilos: value }))}
                    type="number"
                    min={0}
                    decimalScale={2}
                  />
                </GridCol>
              </Grid>
            </GroupGrid>

            {/* Notes & Priority */}
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

            {/* Actions - Sticking to the bottom */}
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
              >
                Create Order
              </Button>
            </Group>
          </Form>
        </Stack>
      </Container>
    </Box>
  );
}; 