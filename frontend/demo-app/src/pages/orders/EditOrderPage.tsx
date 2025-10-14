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
import { FormProvider, useFormContext } from '../../hooks/useFormContext';
import { transformFormData, populateFormFromApi, ORDER_FORM_CONFIG, ORDER_DATE_FIELDS } from '../../utils/formTransform';

// Form content component that uses the context
const EditOrderFormContent: React.FC<{
  orderId: string;
  onBack: () => void;
}> = ({ orderId, onBack }) => {
  const navigate = useNavigate();
  const { formData, setForm } = useFormContext();

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

  // Load data and populate form
  useEffect(() => {
    const loadData = async () => {
      try {
        const [orderData, driversData, trucksData, trailersData] = await Promise.all([
          ApiService.getOrder(orderId),
          ApiService.getDrivers(),
          ApiService.getTrucks(),
          ApiService.getTrailers()
        ]);
        
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
            label: trailer.license_plate || trailer.id
          }))
        ];
        setTrailers(trailerOptions);

        // Populate form from API data - fields are defined by JSX components only
        if (orderData) {
          setForm(() => populateFormFromApi(orderData, ORDER_DATE_FIELDS));

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
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [orderId, setForm]);

  const handleSave = async () => {
    try {
      // Transform form data to API format automatically
      const apiData = transformFormData(formData, ORDER_FORM_CONFIG);
      
      console.log('Updating order:', apiData);
      await ApiService.updateOrder(orderId, apiData);
      navigate('/');
    } catch (error) {
      console.error('Failed to update order:', error);
      // TODO: Show error notification
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        console.log('Delete order:', orderId);
        await ApiService.deleteOrder(orderId);
        navigate('/');
      } catch (error) {
        console.error('Failed to delete order:', error);
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
                onClick={onBack}
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
                      value={formData.reference}
                      onChange={(value) => setForm(prev => ({ ...prev, reference: value }))}
                    />
                  </GridCol>
                  <GridCol span={2}>
                    <SelectField
                      label="Service Type"
                      placeholder="Select service"
                      required
                      data={serviceOptions}
                      value={formData.service?.toString() || ''}
                      onChange={(value) => setForm(prev => ({ 
                        ...prev, 
                        service: value ? parseInt(value) as OrderService : null 
                      }))}
                    />
                  </GridCol>
                  <GridCol span={2}>
                    <Switch
                      label="Priority"
                      checked={formData.priority}
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
                          value={formData.eta_date}
                          onChange={(value) => setForm(prev => ({ ...prev, eta_date: value }))}
                          required
                        />
                      </GridCol>
                      <GridCol span={6}>
                        <TimePicker
                          label="ETA-A time"
                          placeholder="Select time"
                          value={formData.eta_time}
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
                              value={formData.eta_driver_id}
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
                              value={formData.eta_driver}
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
                          value={etaDriverManualMode ? formData.eta_driver_phone : 
                                 (formData.eta_driver_id && formData.eta_driver_id !== '' ? (drivers.find(d => d.value === formData.eta_driver_id)?.phone || '') : '')}
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
                              value={formData.eta_truck_id}
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
                              value={formData.eta_truck}
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
                              value={formData.eta_trailer_id}
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
                              value={formData.eta_trailer}
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
                          value={formData.etd_date}
                          onChange={(value) => setForm(prev => ({ ...prev, etd_date: value }))}
                          required
                        />
                      </GridCol>
                      <GridCol span={6}>
                        <TimePicker
                          label="ETD-D time"
                          placeholder="Select time"
                          value={formData.etd_time}
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
                              value={formData.etd_driver_id}
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
                              value={formData.etd_driver}
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
                          value={etdDriverManualMode ? formData.etd_driver_phone : 
                                 (formData.etd_driver_id && formData.etd_driver_id !== '' ? (drivers.find(d => d.value === formData.etd_driver_id)?.phone || '') : '')}
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
                              value={formData.etd_truck_id}
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
                              value={formData.etd_truck}
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
                              value={formData.etd_trailer_id}
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
                              value={formData.etd_trailer}
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
                      value={formData.commodity || ''}
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
                      value={formData.pallets?.toString() || ''}
                      onChange={(value) => setForm(prev => ({ ...prev, pallets: value }))}
                    />
                  </GridCol>
                  <GridCol span={3}>
                    <TextField
                      label="Boxes"
                      placeholder="Number of boxes"
                      type="number"
                      value={formData.boxes?.toString() || ''}
                      onChange={(value) => setForm(prev => ({ ...prev, boxes: value }))}
                    />
                  </GridCol>
                  <GridCol span={3}>
                    <TextField
                      label="Kilos"
                      placeholder="Weight in kg"
                      type="number"
                      value={formData.kilos?.toString() || ''}
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
                      value={formData.notes}
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

export const EditOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();

  const handleBack = () => {
    navigate('/');
  };

  if (!orderId) {
    return <div>Order ID not found</div>;
  }

  return (
    <FormProvider initialData={{}}>
      <EditOrderFormContent 
        orderId={orderId}
        onBack={handleBack}
      />
    </FormProvider>
  );
};
