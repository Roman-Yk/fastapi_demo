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
import { useNavigate, useParams } from 'react-router-dom';
import { IconArrowLeft, IconDeviceFloppy, IconTrash, IconEdit } from '@tabler/icons-react';
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

interface EditOrderForm {
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
  // ETA fields - ID or manual, not both
  eta_driver_id: string;
  eta_truck_id: string;
  eta_trailer_id: string;
  eta_driver: string;      // Manual driver name
  eta_driver_phone: string; // Manual driver phone
  eta_truck: string;       // Manual truck name
  eta_trailer: string;     // Manual trailer name
  // ETD fields - ID or manual, not both
  etd_driver_id: string;
  etd_truck_id: string;
  etd_trailer_id: string;
  etd_driver: string;      // Manual driver name
  etd_driver_phone: string; // Manual driver phone
  etd_truck: string;       // Manual truck name
  etd_trailer: string;     // Manual trailer name
}

export const EditOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  
  // Form state
  const [form, setForm] = useState<EditOrderForm>({
    priority: false,
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
    terminal_id: '',
    // ETA fields
    eta_driver_id: '',
    eta_truck_id: '',
    eta_trailer_id: '',
    eta_driver: '',
    eta_driver_phone: '',
    eta_truck: '',
    eta_trailer: '',
    // ETD fields
    etd_driver_id: '',
    etd_truck_id: '',
    etd_trailer_id: '',
    etd_driver: '',
    etd_driver_phone: '',
    etd_truck: '',
    etd_trailer: ''
  });

  const [terminals, setTerminals] = useState<Array<{value: string, label: string}>>([]);
  const [drivers, setDrivers] = useState<Array<{value: string, label: string, phone: string}>>([]);
  const [trucks, setTrucks] = useState<Array<{value: string, label: string}>>([]);
  const [trailers, setTrailers] = useState<Array<{value: string, label: string}>>([]);
  const [loading, setLoading] = useState(true);
  const [etaDriverManualMode, setEtaDriverManualMode] = useState(false);
  const [etdDriverManualMode, setEtdDriverManualMode] = useState(false);
  const [etaTruckManualMode, setEtaTruckManualMode] = useState(false);
  const [etdTruckManualMode, setEtdTruckManualMode] = useState(false);
  const [etaTrailerManualMode, setEtaTrailerManualMode] = useState(false);
  const [etdTrailerManualMode, setEtdTrailerManualMode] = useState(false);

  // Load terminals and order data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        const [orderData, terminalsData, driversData, trucksData, trailersData] = await Promise.all([
          orderId ? ApiService.getOrder(orderId) : null,
          ApiService.getTerminals(),
          ApiService.getDrivers(),
          ApiService.getTrucks(),
          ApiService.getTrailers()
        ]);
        
        const terminalOptions = terminalsData.map(terminal => ({
          value: terminal.id,
          label: terminal.name
        }));
        setTerminals(terminalOptions);
        
        const driverOptions = [
          { value: '', label: '-- Select Driver --', phone: '' },
          ...driversData.map(driver => ({
            value: driver.id,
            label: driver.name,
            phone: driver.phone || ''
          }))
        ];
        setDrivers(driverOptions);
        
        const truckOptions = [
          { value: '', label: '-- Select Truck --' },
          ...trucksData.map(truck => ({
            value: truck.id,
            label: `${truck.make || ''} ${truck.model || ''}`.trim() || truck.truck_number || truck.license_plate || truck.id
          }))
        ];
        setTrucks(truckOptions);
        
        const trailerOptions = [
          { value: '', label: '-- Select Trailer --' },
          ...trailersData.map(trailer => ({
            value: trailer.id,
            label: trailer.trailer_number || trailer.id
          }))
        ];
        setTrailers(trailerOptions);

        // If editing existing order, populate form
        if (orderData) {
          setForm({
            reference: orderData.reference || '',
            service: orderData.service || null,
            eta_date: orderData.eta_date ? new Date(orderData.eta_date) : null,
            eta_time: orderData.eta_time || '',
            etd_date: orderData.etd_date ? new Date(orderData.etd_date) : null,
            etd_time: orderData.etd_time || '',
            commodity: orderData.commodity || null,
            pallets: orderData.pallets || '',
            boxes: orderData.boxes || '',
            kilos: orderData.kilos || '',
            notes: orderData.notes || '',
            priority: orderData.priority || false,
            terminal_id: orderData.terminal_id || '',
            // ETA fields
            eta_driver_id: orderData.eta_driver_id || '',
            eta_truck_id: orderData.eta_truck_id || '',
            eta_trailer_id: orderData.eta_trailer_id || '',
            eta_driver: orderData.eta_driver || '',
            eta_driver_phone: orderData.eta_driver_phone || '',
            eta_truck: orderData.eta_truck || '',
            eta_trailer: orderData.eta_trailer || '',
            // ETD fields
            etd_driver_id: orderData.etd_driver_id || '',
            etd_truck_id: orderData.etd_truck_id || '',
            etd_trailer_id: orderData.etd_trailer_id || '',
            etd_driver: orderData.etd_driver || '',
            etd_driver_phone: orderData.etd_driver_phone || '',
            etd_truck: orderData.etd_truck || '',
            etd_trailer: orderData.etd_trailer || '',
          });

          // Set manual mode based on whether manual fields have data
          setEtaDriverManualMode(!!(orderData.eta_driver || orderData.eta_driver_phone));
          setEtdDriverManualMode(!!(orderData.etd_driver || orderData.etd_driver_phone));
          setEtaTruckManualMode(!!orderData.eta_truck);
          setEtdTruckManualMode(!!orderData.etd_truck);
          setEtaTrailerManualMode(!!orderData.eta_trailer);
          setEtdTrailerManualMode(!!orderData.etd_trailer);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
        // Fallback to default options
        setTerminals([
          { value: 'dc170a0a-a896-411e-9b5a-f466d834ec77', label: 'Terminal 1' },
          { value: '004f7daa-50dc-48f4-acb5-9dfe69b2e92c', label: 'Terminal 2' },
          { value: '0f74eb29-4dd7-4139-8718-db7eef530dbf', label: 'Terminal 3' }
        ]);
        setDrivers([
          { value: '', label: '-- Select Driver --', phone: '' },
          { value: '1', label: 'John Doe', phone: '+47123456789' },
          { value: '2', label: 'Jane Smith', phone: '+47987654321' },
        ]);
        setTrucks([
          { value: '', label: '-- Select Truck --' },
          { value: '1', label: 'Truck 001' },
          { value: '2', label: 'Truck 002' },
        ]);
        setTrailers([
          { value: '', label: '-- Select Trailer --' },
          { value: '1', label: 'Trailer 001' },
          { value: '2', label: 'Trailer 002' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [orderId]);

  const handleBack = () => {
    navigate('/');
  };

  const handleSave = async () => {
    if (!orderId) return;
    
    try {
      // Convert form data to API format
      const orderData = {
        reference: form.reference || undefined,
        service: form.service || undefined,
        terminal_id: form.terminal_id || undefined,
        eta_date: form.eta_date ? form.eta_date.toISOString().split('T')[0] : undefined,
        eta_time: form.eta_time || undefined,
        etd_date: form.etd_date ? form.etd_date.toISOString().split('T')[0] : undefined,
        etd_time: form.etd_time || undefined,
        commodity: form.commodity || undefined,
        pallets: typeof form.pallets === 'number' ? form.pallets : (form.pallets ? parseFloat(form.pallets.toString()) : undefined),
        boxes: typeof form.boxes === 'number' ? form.boxes : (form.boxes ? parseFloat(form.boxes.toString()) : undefined),
        kilos: typeof form.kilos === 'number' ? form.kilos : (form.kilos ? parseFloat(form.kilos.toString()) : undefined),
        notes: form.notes || undefined,
        priority: form.priority,
        // ETA fields - either ID or manual, never both
        eta_driver_id: form.eta_driver_id || undefined,
        eta_truck_id: form.eta_truck_id || undefined,
        eta_trailer_id: form.eta_trailer_id || undefined,
        eta_driver: form.eta_driver || undefined,
        eta_driver_phone: form.eta_driver_phone || undefined,
        eta_truck: form.eta_truck || undefined,
        eta_trailer: form.eta_trailer || undefined,
        // ETD fields - either ID or manual, never both
        etd_driver_id: form.etd_driver_id || undefined,
        etd_truck_id: form.etd_truck_id || undefined,
        etd_trailer_id: form.etd_trailer_id || undefined,
        etd_driver: form.etd_driver || undefined,
        etd_driver_phone: form.etd_driver_phone || undefined,
        etd_truck: form.etd_truck || undefined,
        etd_trailer: form.etd_trailer || undefined,
      };
      
      console.log('Updating order:', orderData);
      await ApiService.updateOrder(orderId, orderData);
      navigate('/');
    } catch (error) {
      console.error('Failed to update order:', error);
      // TODO: Show error notification
    }
  };

  const handleDelete = async () => {
    if (!orderId) return;
    
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        console.log('Delete order:', orderId);
        await ApiService.deleteOrder(orderId);
        navigate('/');
      } catch (error) {
        console.error('Failed to delete order:', error);
        // TODO: Show error notification
      }
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
              Edit Order {orderId}
            </Title>
            <Text c="dimmed" size="sm">
              Update the order details below.
            </Text>
          </Stack>

          {/* Form Content */}
          <Paper withBorder p="md" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Stack gap="md">
              {/* Header Row with Basic Info */}
              <GroupGrid title="Order Information">
                <Grid>
                  <GridCol span={2}>
                    <TextField
                      label="Reference"
                      placeholder="Order reference"
                      required
                      value={form.reference}
                      onChange={(value) => setForm(prev => ({ ...prev, reference: value }))}
                    />
                  </GridCol>
                  <GridCol span={2}>
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
                  <GridCol span={2}>
                    <Switch
                      label="Priority"
                      checked={form.priority}
                      onChange={(e) => setForm(prev => ({ ...prev, priority: e.target.checked }))}
                      size="md"
                    />
                  </GridCol>
                </Grid>
              </GroupGrid>

              {/* ETA and ETD Sections Side by Side */}
              <Grid>
                {/* ETA Section */}
                <GridCol span={6}>
                  <GroupGrid title="ETA — ARRIVAL — TRUCK">
                    <Grid>
                      <GridCol span={6}>
                        <DateInput
                          label="ETA-A date"
                          placeholder="Select date"
                          value={form.eta_date}
                          onChange={(value) => setForm(prev => ({ ...prev, eta_date: value }))}
                          required
                        />
                      </GridCol>
                      <GridCol span={6}>
                        <TimePicker
                          label="ETA-A time"
                          placeholder="Select time"
                          value={form.eta_time}
                          onChange={(value) => setForm(prev => ({ ...prev, eta_time: value || '' }))}
                        />
                      </GridCol>
                    </Grid>

                    <Grid>
                      <GridCol span={12}>
                        <Group gap="xs">
                          {!etaDriverManualMode ? (
                            <SelectField
                              label="ETA-A driver"
                              placeholder="Select driver"
                              data={drivers}
                              value={form.eta_driver_id}
                              onChange={(driverId) => {
                                setForm(prev => ({ 
                                  ...prev, 
                                  eta_driver_id: driverId || '',
                                  eta_driver: '',
                                  eta_driver_phone: ''
                                }));
                              }}
                            />
                          ) : (
                            <TextField
                              label="ETA-A driver"
                              placeholder="Enter driver name"
                              value={form.eta_driver}
                              onChange={(value) => setForm(prev => ({ 
                                ...prev, 
                                eta_driver: value,
                                eta_driver_id: ''
                              }))}
                            />
                          )}
                          <Button
                            variant="light"
                            size="sm"
                            onClick={() => setEtaDriverManualMode(!etaDriverManualMode)}
                            style={{ alignSelf: 'flex-end', marginBottom: '2px' }}
                          >
                            <IconEdit size={16} />
                          </Button>
                        </Group>
                      </GridCol>
                    </Grid>

                    <Grid>
                      <GridCol span={12}>
                        <TextField
                          label="ETA-A driver phone"
                          placeholder="+47"
                          value={etaDriverManualMode ? form.eta_driver_phone : 
                                 (form.eta_driver_id && form.eta_driver_id !== '' ? (drivers.find(d => d.value === form.eta_driver_id)?.phone || '') : '')}
                          onChange={(value) => {
                            if (etaDriverManualMode) {
                              setForm(prev => ({ 
                                ...prev, 
                                eta_driver_phone: value,
                                eta_driver_id: ''
                              }));
                            }
                          }}
                        />
                      </GridCol>
                    </Grid>

                    <Grid>
                      <GridCol span={12}>
                        <Group gap="xs">
                          {!etaTruckManualMode ? (
                            <SelectField
                              label="ETA-A truck"
                              placeholder="Select truck"
                              data={trucks}
                              value={form.eta_truck_id}
                              onChange={(value) => setForm(prev => ({ 
                                ...prev, 
                                eta_truck_id: value || '',
                                eta_truck: ''
                              }))}
                            />
                          ) : (
                            <TextField
                              label="ETA-A truck"
                              placeholder="Enter truck name"
                              value={form.eta_truck}
                              onChange={(value) => setForm(prev => ({ 
                                ...prev, 
                                eta_truck: value,
                                eta_truck_id: ''
                              }))}
                            />
                          )}
                          <Button
                            variant="light"
                            size="sm"
                            onClick={() => setEtaTruckManualMode(!etaTruckManualMode)}
                            style={{ alignSelf: 'flex-end', marginBottom: '2px' }}
                          >
                            <IconEdit size={16} />
                          </Button>
                        </Group>
                      </GridCol>
                    </Grid>

                    <Grid>
                      <GridCol span={12}>
                        <Group gap="xs">
                          {!etaTrailerManualMode ? (
                            <SelectField
                              label="ETA-A trailer"
                              placeholder="Select trailer"
                              data={trailers}
                              value={form.eta_trailer_id}
                              onChange={(value) => setForm(prev => ({ 
                                ...prev, 
                                eta_trailer_id: value || '',
                                eta_trailer: ''
                              }))}
                            />
                          ) : (
                            <TextField
                              label="ETA-A trailer"
                              placeholder="Enter trailer name"
                              value={form.eta_trailer}
                              onChange={(value) => setForm(prev => ({ 
                                ...prev, 
                                eta_trailer: value,
                                eta_trailer_id: ''
                              }))}
                            />
                          )}
                          <Button
                            variant="light"
                            size="sm"
                            onClick={() => setEtaTrailerManualMode(!etaTrailerManualMode)}
                            style={{ alignSelf: 'flex-end', marginBottom: '2px' }}
                          >
                            <IconEdit size={16} />
                          </Button>
                        </Group>
                      </GridCol>
                    </Grid>
                  </GroupGrid>
                </GridCol>

                {/* ETD Section */}
                <GridCol span={6}>
                  <GroupGrid title="ETD — DEPARTURE — TRUCK">
                    <Grid>
                      <GridCol span={6}>
                        <DateInput
                          label="ETD-D date"
                          placeholder="Select date"
                          value={form.etd_date}
                          onChange={(value) => setForm(prev => ({ ...prev, etd_date: value }))}
                          required
                        />
                      </GridCol>
                      <GridCol span={6}>
                        <TimePicker
                          label="ETD-D time"
                          placeholder="Select time"
                          value={form.etd_time}
                          onChange={(value) => setForm(prev => ({ ...prev, etd_time: value || '' }))}
                        />
                      </GridCol>
                    </Grid>

                    <Grid>
                      <GridCol span={12}>
                        <Group gap="xs">
                          {!etdDriverManualMode ? (
                            <SelectField
                              label="ETD-D driver"
                              placeholder="Select driver"
                              data={drivers}
                              value={form.etd_driver_id}
                              onChange={(driverId) => {
                                setForm(prev => ({ 
                                  ...prev, 
                                  etd_driver_id: driverId || '',
                                  etd_driver: '',
                                  etd_driver_phone: ''
                                }));
                              }}
                            />
                          ) : (
                            <TextField
                              label="ETD-D driver"
                              placeholder="Enter driver name"
                              value={form.etd_driver}
                              onChange={(value) => setForm(prev => ({ 
                                ...prev, 
                                etd_driver: value,
                                etd_driver_id: ''
                              }))}
                            />
                          )}
                          <Button
                            variant="light"
                            size="sm"
                            onClick={() => setEtdDriverManualMode(!etdDriverManualMode)}
                            style={{ alignSelf: 'flex-end', marginBottom: '2px' }}
                          >
                            <IconEdit size={16} />
                          </Button>
                        </Group>
                      </GridCol>
                    </Grid>

                    <Grid>
                      <GridCol span={12}>
                        <TextField
                          label="ETD-D driver phone"
                          placeholder="+47"
                          value={etdDriverManualMode ? form.etd_driver_phone : 
                                 (form.etd_driver_id && form.etd_driver_id !== '' ? (drivers.find(d => d.value === form.etd_driver_id)?.phone || '') : '')}
                          onChange={(value) => {
                            if (etdDriverManualMode) {
                              setForm(prev => ({ 
                                ...prev, 
                                etd_driver_phone: value,
                                etd_driver_id: ''
                              }));
                            }
                          }}
                        />
                      </GridCol>
                    </Grid>

                    <Grid>
                      <GridCol span={12}>
                        <Group gap="xs">
                          {!etdTruckManualMode ? (
                            <SelectField
                              label="ETD-D truck"
                              placeholder="Select truck"
                              data={trucks}
                              value={form.etd_truck_id}
                              onChange={(value) => setForm(prev => ({ 
                                ...prev, 
                                etd_truck_id: value || '',
                                etd_truck: ''
                              }))}
                            />
                          ) : (
                            <TextField
                              label="ETD-D truck"
                              placeholder="Enter truck name"
                              value={form.etd_truck}
                              onChange={(value) => setForm(prev => ({ 
                                ...prev, 
                                etd_truck: value,
                                etd_truck_id: ''
                              }))}
                            />
                          )}
                          <Button
                            variant="light"
                            size="sm"
                            onClick={() => setEtdTruckManualMode(!etdTruckManualMode)}
                            style={{ alignSelf: 'flex-end', marginBottom: '2px' }}
                          >
                            <IconEdit size={16} />
                          </Button>
                        </Group>
                      </GridCol>
                    </Grid>

                    <Grid>
                      <GridCol span={12}>
                        <Group gap="xs">
                          {!etdTrailerManualMode ? (
                            <SelectField
                              label="ETD-D trailer"
                              placeholder="Select trailer"
                              data={trailers}
                              value={form.etd_trailer_id}
                              onChange={(value) => setForm(prev => ({ 
                                ...prev, 
                                etd_trailer_id: value || '',
                                etd_trailer: ''
                              }))}
                            />
                          ) : (
                            <TextField
                              label="ETD-D trailer"
                              placeholder="Enter trailer name"
                              value={form.etd_trailer}
                              onChange={(value) => setForm(prev => ({ 
                                ...prev, 
                                etd_trailer: value,
                                etd_trailer_id: ''
                              }))}
                            />
                          )}
                          <Button
                            variant="light"
                            size="sm"
                            onClick={() => setEtdTrailerManualMode(!etdTrailerManualMode)}
                            style={{ alignSelf: 'flex-end', marginBottom: '2px' }}
                          >
                            <IconEdit size={16} />
                          </Button>
                        </Group>
                      </GridCol>
                    </Grid>
                  </GroupGrid>
                </GridCol>
              </Grid>

              {/* Cargo Details */}
              <GroupGrid title="Cargo Details">
                <Grid>
                  <GridCol span={3}>
                    <SelectField
                      label="Commodity"
                      placeholder="Select commodity"
                      data={commodityOptions}
                      value={form.commodity || ''}
                      onChange={(value) => setForm(prev => ({ 
                        ...prev, 
                        commodity: value as CommodityType || null 
                      }))}
                    />
                  </GridCol>
                  <GridCol span={3}>
                    <TextField
                      label="Pallets"
                      placeholder="Number of pallets"
                      type="number"
                      value={form.pallets.toString()}
                      onChange={(value) => setForm(prev => ({ ...prev, pallets: value }))}
                    />
                  </GridCol>
                  <GridCol span={3}>
                    <TextField
                      label="Boxes"
                      placeholder="Number of boxes"
                      type="number"
                      value={form.boxes.toString()}
                      onChange={(value) => setForm(prev => ({ ...prev, boxes: value }))}
                    />
                  </GridCol>
                  <GridCol span={3}>
                    <TextField
                      label="Kilos"
                      placeholder="Weight in kg"
                      type="number"
                      value={form.kilos.toString()}
                      onChange={(value) => setForm(prev => ({ ...prev, kilos: value }))}
                    />
                  </GridCol>
                </Grid>
              </GroupGrid>

              {/* Notes */}
              <GroupGrid title="Additional Information">
                <Grid>
                  <GridCol span={12}>
                    <TextField
                      label="Notes"
                      placeholder="Order notes..."
                      value={form.notes}
                      onChange={(value) => setForm(prev => ({ ...prev, notes: value }))}
                      multiline
                      rows={3}
                    />
                  </GridCol>
                </Grid>
              </GroupGrid>

            {/* Actions */}
            <Group justify="space-between" mt="xl" pt="md" style={{ borderTop: '1px solid var(--mantine-color-gray-3)' }}>
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
                loading={loading}
              >
                Update Order
              </Button>
            </Group>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
};
