import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Title, 
  Text, 
  Stack, 
  Button, 
  Group,
  Box
} from '@mantine/core';
import { useNavigate, useParams } from 'react-router-dom';
import { IconArrowLeft, IconDeviceFloppy, IconTrash } from '@tabler/icons-react';
import { CommodityType, CommodityLabels } from '../../types/order';
import { 
  Form, 
  Grid, 
  GridCol, 
  GroupGrid, 
  TextField, 
  SelectField
} from '../../components/admin/forms';

interface EditOrderForm {
  commodity: CommodityType | null;
  pallets: string | number;
  boxes: string | number;
  kilos: string | number;
  eta_driver_id: string;
  eta_trailer_id: string;
  etd_driver: string;
  etd_driver_phone: string;
  etd_truck: string;
  etd_trailer: string;
}

// Mock data - replace with actual API calls
const mockDrivers = [
  { value: '1', label: 'John Doe', phone: '+311111111111' },
  { value: '2', label: 'Jane Smith', phone: '+312222222222' },
  { value: '3', label: 'Mike Johnson', phone: '+313333333333' },
];

const mockTrailers = [
  { value: '1', label: 'Trailer ABC-123', truck: 'Volvo FH16' },
  { value: '2', label: 'Trailer DEF-456', truck: 'Scania R450' },
  { value: '3', label: 'Trailer GHI-789', truck: 'Mercedes Actros' },
];

export const EditOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  
  const [form, setForm] = useState<EditOrderForm>({
    commodity: null,
    pallets: '',
    boxes: '',
    kilos: '',
    eta_driver_id: '',
    eta_trailer_id: '',
    etd_driver: '',
    etd_driver_phone: '',
    etd_truck: '',
    etd_trailer: '',
  });

  // Load order data - replace with actual API call
  useEffect(() => {
    if (orderId) {
      // Mock loading existing order data
      setForm({
        commodity: 'general_cargo' as CommodityType,
        pallets: 11,
        boxes: 44,
        kilos: 450.5,
        eta_driver_id: '1',
        eta_trailer_id: '1',
        etd_driver: 'A driver',
        etd_driver_phone: '+311111111111',
        etd_truck: 'Some Truck',
        etd_trailer: 'Some Trailer',
      });
    }
  }, [orderId]);

  const handleBack = () => {
    navigate('/');
  };

  const handleSave = () => {
    // Convert form data to API format
    const orderData = {
      commodity: form.commodity,
      pallets: typeof form.pallets === 'number' ? form.pallets : (form.pallets ? parseFloat(form.pallets.toString()) : null),
      boxes: typeof form.boxes === 'number' ? form.boxes : (form.boxes ? parseFloat(form.boxes.toString()) : null),
      kilos: typeof form.kilos === 'number' ? form.kilos : (form.kilos ? parseFloat(form.kilos.toString()) : null),
      eta_driver_id: parseInt(form.eta_driver_id) || null,
      eta_trailer_id: parseInt(form.eta_trailer_id) || null,
      etd_driver: form.etd_driver,
      etd_driver_phone: form.etd_driver_phone,
      etd_truck: form.etd_truck,
      etd_trailer: form.etd_trailer,
    };
    
    console.log('Updating order:', orderData);
    // TODO: Implement API call
    navigate('/');
  };

  // Auto-populate ETD driver info when driver is selected
  const handleDriverChange = (driverId: string | null) => {
    if (driverId) {
      const selectedDriver = mockDrivers.find(d => d.value === driverId);
      if (selectedDriver) {
        setForm(prev => ({
          ...prev,
          eta_driver_id: driverId,
          etd_driver: selectedDriver.label,
          etd_driver_phone: selectedDriver.phone,
        }));
        return;
      }
    }
    
    setForm(prev => ({
      ...prev,
      eta_driver_id: driverId || '',
      etd_driver: '',
      etd_driver_phone: '',
    }));
  };

  // Auto-populate ETD truck/trailer info when trailer is selected
  const handleTrailerChange = (trailerId: string | null) => {
    if (trailerId) {
      const selectedTrailer = mockTrailers.find(t => t.value === trailerId);
      if (selectedTrailer) {
        setForm(prev => ({
          ...prev,
          eta_trailer_id: trailerId,
          etd_truck: selectedTrailer.truck,
          etd_trailer: selectedTrailer.label,
        }));
        return;
      }
    }
    
    setForm(prev => ({
      ...prev,
      eta_trailer_id: trailerId || '',
      etd_truck: '',
      etd_trailer: '',
    }));
  };

  const handleDelete = () => {
    // TODO: Implement order deletion logic
    if (window.confirm('Are you sure you want to delete this order?')) {
      console.log('Delete order:', orderId);
      navigate('/');
    }
  };

  const commodityOptions = Object.entries(CommodityLabels).map(([value, label]) => ({
    value,
    label
  }));

  const driverOptions = mockDrivers.map(driver => ({
    value: driver.value,
    label: driver.label
  }));

  const trailerOptions = mockTrailers.map(trailer => ({
    value: trailer.value,
    label: trailer.label
  }));

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
            
            <Title order={2}>Edit Order {orderId}</Title>
            <Text c="dimmed">Update order details</Text>
          </Stack>

          {/* Form */}
          <Form>
            {/* Cargo Details */}
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
                    required
                  />
                </GridCol>
                <GridCol span={3}>
                  <TextField
                    label="Pallets"
                    placeholder="11"
                    value={form.pallets}
                    onChange={(value) => setForm(prev => ({ ...prev, pallets: value }))}
                    type="number"
                    min={0}
                    required
                  />
                </GridCol>
                <GridCol span={3}>
                  <TextField
                    label="Boxes"
                    placeholder="44"
                    value={form.boxes}
                    onChange={(value) => setForm(prev => ({ ...prev, boxes: value }))}
                    type="number"
                    min={0}
                    required
                  />
                </GridCol>
                <GridCol span={3}>
                  <TextField
                    label="Kilos"
                    placeholder="450.5"
                    value={form.kilos}
                    onChange={(value) => setForm(prev => ({ ...prev, kilos: value }))}
                    type="number"
                    min={0}
                    decimalScale={2}
                    required
                  />
                </GridCol>
              </Grid>
            </GroupGrid>

            {/* ETA Assignment */}
            <GroupGrid title="ETA Assignment">
              <Grid>
                <GridCol span={6}>
                  <SelectField
                    label="ETA Driver"
                    placeholder="Select driver"
                    data={driverOptions}
                    value={form.eta_driver_id || null}
                    onChange={handleDriverChange}
                    required
                  />
                </GridCol>
                <GridCol span={6}>
                  <SelectField
                    label="ETA Trailer"
                    placeholder="Select trailer"
                    data={trailerOptions}
                    value={form.eta_trailer_id || null}
                    onChange={handleTrailerChange}
                    required
                  />
                </GridCol>
              </Grid>
            </GroupGrid>

            {/* ETD Information (Auto-populated) */}
            <GroupGrid title="ETD Information">
              <Grid>
                <GridCol span={6}>
                  <TextField
                    label="ETD Driver"
                    placeholder="Driver name"
                    value={form.etd_driver}
                    onChange={(value) => setForm(prev => ({ ...prev, etd_driver: value }))}
                    required
                  />
                </GridCol>
                <GridCol span={6}>
                  <TextField
                    label="ETD Driver Phone"
                    placeholder="+311111111111"
                    value={form.etd_driver_phone}
                    onChange={(value) => setForm(prev => ({ ...prev, etd_driver_phone: value }))}
                    required
                  />
                </GridCol>
                <GridCol span={6}>
                  <TextField
                    label="ETD Truck"
                    placeholder="Truck model"
                    value={form.etd_truck}
                    onChange={(value) => setForm(prev => ({ ...prev, etd_truck: value }))}
                    required
                  />
                </GridCol>
                <GridCol span={6}>
                  <TextField
                    label="ETD Trailer"
                    placeholder="Trailer identifier"
                    value={form.etd_trailer}
                    onChange={(value) => setForm(prev => ({ ...prev, etd_trailer: value }))}
                    required
                  />
                </GridCol>
              </Grid>
            </GroupGrid>

            {/* Actions */}
            <Group justify="space-between" mt="md" pt="md" style={{ borderTop: '1px solid var(--mantine-color-gray-3)' }}>
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
                size="md"
              >
                Update Order
              </Button>
            </Group>
          </Form>
        </Stack>
      </Container>
    </Box>
  );
}; 