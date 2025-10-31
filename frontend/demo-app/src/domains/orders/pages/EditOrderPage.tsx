import React, { useState, useEffect, useRef } from 'react';
import {
  Title,
  Text,
  Stack,
  Button,
  Switch,
  Group,
  Box,
  Paper
} from '@mantine/core';
import { useNavigate, useParams } from 'react-router-dom';
import { IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-react';
import { OrderService } from '../types/order';
import { OrderDocument } from '../types/document';
import { orderApi } from '../api/orderService';
import { ServiceSelectInput } from '../components';
import { notify } from '../../../shared/services/notificationService';
import { useOrderValidation } from '../validation';
import {
  Grid,
  GridCol,
  GroupGrid,
  FormTextField,
  FormNumberInput,
  FormFloatInput,
  TimePicker,
  DatePicker,
  CommoditySelectInput
} from '../../../shared/components';
import { FormProvider, useFormContext } from '../../../hooks/useFormContext';
import { apiToFormSchema, editOrderFormSchema, EditOrderFormData } from '../schemas/orderSchemas';
import { OrderDocumentsUpload, OrderDocumentsUploadRef } from '../components/OrderDocumentsUpload';
import { ToggleDriverInput } from '../components/ToggleDriverInput';
import { ToggleTruckInput } from '../components/ToggleTruckInput';
import { ToggleTrailerInput } from '../components/ToggleTrailerInput';
import { ErrorBoundary } from '../../../components/ErrorBoundary';

// Form content component that uses the context
const EditOrderFormContent: React.FC<{
  orderId: string;
  onBack: () => void;
}> = ({ orderId, onBack }) => {
  const navigate = useNavigate();
  const { formData, setForm } = useFormContext<EditOrderFormData>();
  const documentsUploadRef = useRef<OrderDocumentsUploadRef>(null);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { validateEditOrder, isValidating } = useOrderValidation();
  const [etaDriverManualMode, setEtaDriverManualMode] = useState(false);
  const [etdDriverManualMode, setEtdDriverManualMode] = useState(false);
  const [etaTruckManualMode, setEtaTruckManualMode] = useState(false);
  const [etdTruckManualMode, setEtdTruckManualMode] = useState(false);
  const [etaTrailerManualMode, setEtaTrailerManualMode] = useState(false);
  const [etdTrailerManualMode, setEtdTrailerManualMode] = useState(false);
  const [existingDocuments, setExistingDocuments] = useState<OrderDocument[]>([]);
  const [terminalId, setTerminalId] = useState<string>('');

  // Service is already a number thanks to parseValue in FormSelectInput
  const isPlukk = formData.service === OrderService.INTO_PLUKK_STORAGE;

  // Auto-sync dates for non-Plukk services
  useEffect(() => {
    if (!isPlukk && formData.service !== null && formData.service !== 0 && !isNaN(formData.service)) {
      // If ETA date is set and ETD date is not, copy ETA to ETD
      if (formData.eta_date && !formData.etd_date) {
        setForm(prev => ({ ...prev, etd_date: formData.eta_date }));
      }
      // If ETD date is set and ETA date is not, copy ETD to ETA
      else if (formData.etd_date && !formData.eta_date) {
        setForm(prev => ({ ...prev, eta_date: formData.etd_date }));
      }
    }
  }, [formData.eta_date, formData.etd_date, isPlukk, formData.service, setForm]);

  // Load data and populate form
  useEffect(() => {
    const loadData = async () => {
      try {
        const orderData = await orderApi.getOrder(orderId);

        // Populate form from API data using Zod schema
        if (orderData) {
          setForm(() => apiToFormSchema.parse(orderData));

          // Store terminal_id for reference validation
          setTerminalId(orderData.terminal_id);

          // Set manual mode based on whether manual fields have data
          setEtaDriverManualMode(!!(orderData.eta_driver || orderData.eta_driver_phone));
          setEtdDriverManualMode(!!(orderData.etd_driver || orderData.etd_driver_phone));
          setEtaTruckManualMode(!!orderData.eta_truck);
          setEtdTruckManualMode(!!orderData.etd_truck);
          setEtaTrailerManualMode(!!orderData.eta_trailer);
          setEtdTrailerManualMode(!!orderData.etd_trailer);
        }

        // Load existing documents
        const documents = await orderApi.getOrderDocuments(orderId);
        setExistingDocuments(documents);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [orderId, setForm]);

  const handleSave = async () => {
    // Prevent double submission
    if (isSubmitting || isValidating) return;

    // Validate order-specific business rules
    const isValid = await validateEditOrder(formData, orderId, terminalId);
    if (!isValid) {
      return; // Errors already shown via toast notifications
    }

    try {
      setIsSubmitting(true);

      // First, upload any pending documents
      if (documentsUploadRef.current?.hasPendingDocuments()) {
        await documentsUploadRef.current.uploadPendingDocuments();
      }

      // Transform form data to API format using Zod schema
      const apiData = editOrderFormSchema.parse(formData);

      await orderApi.updateOrder(orderId, apiData);

      // Show success notification
      notify.success('Order updated successfully!');

      navigate('/');
    } catch (error) {
      console.error('Failed to update order:', error);
      notify.error(`Failed to save order: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
              Edit Order {orderId}
            </Title>
            <Text c="dimmed" size="sm">
              Update the order details below.
            </Text>
          </Stack>

          {/* Form Content */}
          <Paper withBorder p="xl" radius="md" style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'white' }}>
            <Stack gap="lg">
              {/* Header Row with Basic Info */}
              <GroupGrid title="Order Information">
                <Grid>
                  <GridCol span={3}>
                    <FormTextField
                      label="Reference"
                      placeholder="Order reference"
                      required
                      value={formData.reference}
                      onChange={(value) => setForm(prev => ({ ...prev, reference: value }))}
                    />
                  </GridCol>
                  <GridCol span={3}>
                    <ServiceSelectInput<EditOrderFormData, 'service'>
                      source="service"
                      required
                      nullable
                    />
                  </GridCol>
                  <GridCol span={3}>
                    <Switch
                      label="Priority"
                      checked={formData.priority}
                      onChange={(e) => setForm(prev => ({ ...prev, priority: e.target.checked }))}
                      size="md"
                      style={{ paddingTop: '28px' }}
                    />
                  </GridCol>
                </Grid>
              </GroupGrid>

              {/* ETA and ETD Sections Side by Side */}
              <Grid gutter="lg">
                {/* ETA Section */}
                <GridCol span={6}>
                  <Box style={{ backgroundColor: '#e8f5e9', padding: '20px', borderRadius: '8px', height: '100%' }}>
                    <GroupGrid title="ETA — ARRIVAL — TRUCK">
                    <Grid>
                      <GridCol span={6}>
                        <DatePicker
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
                        <ToggleDriverInput
                          label="ETA-A driver"
                          driverName={formData.eta_driver}
                          driverPhone={formData.eta_driver_phone}
                          driverIdSource="eta_driver_id"
                          isManualMode={etaDriverManualMode}
                          onToggleMode={() => {
                            setEtaDriverManualMode(!etaDriverManualMode);
                            // Clear the opposite field when toggling
                            if (!etaDriverManualMode) {
                              // Switching to manual mode - clear ID
                              setForm(prev => ({ ...prev, eta_driver_id: null }));
                            } else {
                              // Switching to reference mode - clear manual fields
                              setForm(prev => ({ ...prev, eta_driver: null, eta_driver_phone: null }));
                            }
                          }}
                          onDriverNameChange={(value) => setForm(prev => ({ 
                            ...prev, 
                            eta_driver: value,
                            eta_driver_id: null
                          }))}
                          onDriverPhoneChange={(value) => setForm(prev => ({ 
                            ...prev, 
                            eta_driver_phone: value
                          }))}
                        />
                      </GridCol>
                    </Grid>

                    <Grid>
                      <GridCol span={{ base: 12, md: 6 }}>
                        <ToggleTruckInput
                          label="ETA-A truck"
                          truckName={formData.eta_truck}
                          truckIdSource="eta_truck_id"
                          isManualMode={etaTruckManualMode}
                          onToggleMode={() => {
                            setEtaTruckManualMode(!etaTruckManualMode);
                            // Clear the opposite field when toggling
                            if (!etaTruckManualMode) {
                              // Switching to manual mode - clear ID
                              setForm(prev => ({ ...prev, eta_truck_id: null }));
                            } else {
                              // Switching to reference mode - clear manual field
                              setForm(prev => ({ ...prev, eta_truck: null }));
                            }
                          }}
                          onTruckNameChange={(value) => setForm(prev => ({ 
                            ...prev, 
                            eta_truck: value,
                            eta_truck_id: null
                          }))}
                        />
                      </GridCol>
                      <GridCol span={{ base: 12, md: 6 }}>
                        <ToggleTrailerInput
                          label="ETA-A trailer"
                          trailerName={formData.eta_trailer}
                          trailerIdSource="eta_trailer_id"
                          isManualMode={etaTrailerManualMode}
                          onToggleMode={() => {
                            setEtaTrailerManualMode(!etaTrailerManualMode);
                            // Clear the opposite field when toggling
                            if (!etaTrailerManualMode) {
                              // Switching to manual mode - clear ID
                              setForm(prev => ({ ...prev, eta_trailer_id: null }));
                            } else {
                              // Switching to reference mode - clear manual field
                              setForm(prev => ({ ...prev, eta_trailer: null }));
                            }
                          }}
                          onTrailerNameChange={(value) => setForm(prev => ({ 
                            ...prev, 
                            eta_trailer: value,
                            eta_trailer_id: null
                          }))}
                        />
                      </GridCol>
                    </Grid>
                  </GroupGrid>
                  </Box>
                </GridCol>

                {/* ETD Section */}
                <GridCol span={6}>
                  <Box style={{ backgroundColor: '#fce4ec', padding: '20px', borderRadius: '8px', height: '100%' }}>
                    <GroupGrid title="ETD — DEPARTURE — TRUCK">
                    <Grid>
                      <GridCol span={6}>
                        <DatePicker
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
                        <ToggleDriverInput
                          label="ETD-D driver"
                          driverName={formData.etd_driver}
                          driverPhone={formData.etd_driver_phone}
                          driverIdSource="etd_driver_id"
                          isManualMode={etdDriverManualMode}
                          onToggleMode={() => {
                            setEtdDriverManualMode(!etdDriverManualMode);
                            // Clear the opposite field when toggling
                            if (!etdDriverManualMode) {
                              // Switching to manual mode - clear ID
                              setForm(prev => ({ ...prev, etd_driver_id: null }));
                            } else {
                              // Switching to reference mode - clear manual fields
                              setForm(prev => ({ ...prev, etd_driver: null, etd_driver_phone: null }));
                            }
                          }}
                          onDriverNameChange={(value) => setForm(prev => ({ 
                            ...prev, 
                            etd_driver: value,
                            etd_driver_id: null
                          }))}
                          onDriverPhoneChange={(value) => setForm(prev => ({ 
                            ...prev, 
                            etd_driver_phone: value
                          }))}
                        />
                      </GridCol>
                    </Grid>

                    <Grid>
                      <GridCol span={{ base: 12, md: 6 }}>
                        <ToggleTruckInput
                          label="ETD-D truck"
                          truckName={formData.etd_truck}
                          truckIdSource="etd_truck_id"
                          isManualMode={etdTruckManualMode}
                          onToggleMode={() => {
                            setEtdTruckManualMode(!etdTruckManualMode);
                            // Clear the opposite field when toggling
                            if (!etdTruckManualMode) {
                              // Switching to manual mode - clear ID
                              setForm(prev => ({ ...prev, etd_truck_id: null }));
                            } else {
                              // Switching to reference mode - clear manual field
                              setForm(prev => ({ ...prev, etd_truck: null }));
                            }
                          }}
                          onTruckNameChange={(value) => setForm(prev => ({ 
                            ...prev, 
                            etd_truck: value,
                            etd_truck_id: null
                          }))}
                        />
                      </GridCol>
                      <GridCol span={{ base: 12, md: 6 }}>
                        <ToggleTrailerInput
                          label="ETD-D trailer"
                          trailerName={formData.etd_trailer}
                          trailerIdSource="etd_trailer_id"
                          isManualMode={etdTrailerManualMode}
                          onToggleMode={() => {
                            setEtdTrailerManualMode(!etdTrailerManualMode);
                            // Clear the opposite field when toggling
                            if (!etdTrailerManualMode) {
                              // Switching to manual mode - clear ID
                              setForm(prev => ({ ...prev, etd_trailer_id: null }));
                            } else {
                              // Switching to reference mode - clear manual field
                              setForm(prev => ({ ...prev, etd_trailer: null }));
                            }
                          }}
                          onTrailerNameChange={(value) => setForm(prev => ({ 
                            ...prev, 
                            etd_trailer: value,
                            etd_trailer_id: null
                          }))}
                        />
                      </GridCol>
                    </Grid>
                  </GroupGrid>
                  </Box>
                </GridCol>
              </Grid>

              {/* Cargo Details */}
              <GroupGrid title="Cargo Details">
                <Grid>
                  <GridCol span={3}>
                    <CommoditySelectInput<EditOrderFormData, 'commodity'>
                      label="Commodity"
                      source="commodity"
                      placeholder="Select commodity"
                    />
                  </GridCol>
                  <GridCol span={3}>
                    <FormNumberInput<EditOrderFormData, 'pallets'>
                      label="Pallets"
                      source="pallets"
                      placeholder="0"
                    />
                  </GridCol>
                  <GridCol span={3}>
                    <FormNumberInput<EditOrderFormData, 'boxes'>
                      label="Boxes"
                      source="boxes"
                      placeholder="0"
                    />
                  </GridCol>
                  <GridCol span={3}>
                    <FormFloatInput<EditOrderFormData, 'kilos'>
                      label="Weight (kg)"
                      source="kilos"
                      placeholder="0.00"
                      decimalScale={2}
                    />
                  </GridCol>
                </Grid>
              </GroupGrid>

              {/* Notes */}
              <GroupGrid title="Additional Information">
                <Grid>
                  <GridCol span={12}>
                    <FormTextField
                      label="Notes"
                      placeholder="Order notes..."
                      value={formData.notes || ''}
                      onChange={(value) => setForm(prev => ({ ...prev, notes: value || null }))}
                      multiline
                      rows={3}
                    />
                  </GridCol>
                </Grid>
              </GroupGrid>

              {/* Documents Upload Section */}
              <ErrorBoundary>
                <OrderDocumentsUpload
                  ref={documentsUploadRef}
                  orderId={orderId}
                  documents={[
                    // Existing documents from the server
                    ...existingDocuments.map((doc) => ({
                      id: doc.id.toString(),
                      name: doc.display_name || doc.title || 'Untitled',
                      size: 0, // Backend doesn't provide file size
                      type: '', // Backend doesn't provide mime type
                      documentType: doc.type,
                      uploadedAt: new Date(doc.created_at),
                      url: doc.src,
                      status: 'completed' as const
                    }))
                  ]}
                  onUpload={async (files, metadata) => {
                    // Upload files immediately with metadata
                    try {
                      // Ensure metadata has title field
                      const enrichedMetadata = metadata.map(m => ({
                        ...m,
                        title: m.name
                      }));
                      await orderApi.uploadOrderDocuments(orderId, files, enrichedMetadata);
                      // Refresh the documents list
                      const documents = await orderApi.getOrderDocuments(orderId);
                      setExistingDocuments(documents);
                    } catch (error) {
                      console.error('Failed to upload documents:', error);
                      notify.error(`Failed to upload documents: ${error instanceof Error ? error.message : 'Unknown error'}`);
                      throw error; // Re-throw to let component handle it
                    }
                  }}
                  onDelete={async (documentId) => {
                    // Delete existing document from server
                    try {
                      await orderApi.deleteOrderDocument(orderId, documentId);
                      // Refresh the documents list
                      const documents = await orderApi.getOrderDocuments(orderId);
                      setExistingDocuments(documents);
                    } catch (error) {
                      console.error('Failed to delete document:', error);
                    }
                  }}
                  onDownload={async (documentId) => {
                    // Download button - forces file download
                    try {
                      await orderApi.downloadOrderDocument(orderId, documentId);
                    } catch (error) {
                      console.error('Failed to download document:', error);
                    }
                  }}
                  onView={(document) => {
                    // Card click - opens file in browser for viewing
                    try {
                      orderApi.viewOrderDocument(orderId, document.id);
                    } catch (error) {
                      console.error('Failed to view document:', error);
                    }
                  }}
                  onEdit={async (documentId, title, documentType) => {
                    // Edit document metadata
                    try {
                      await orderApi.updateOrderDocument(orderId, documentId, {
                        title,
                        type: documentType
                      });
                      // Refresh the documents list
                      const documents = await orderApi.getOrderDocuments(orderId);
                      setExistingDocuments(documents);
                    } catch (error) {
                      console.error('Failed to update document:', error);
                      notify.error(`Failed to update document: ${error instanceof Error ? error.message : 'Unknown error'}`);
                      throw error;
                    }
                  }}
                />
              </ErrorBoundary>

            {/* Actions */}
            <Group justify="flex-end" mt="md" pt="md" style={{ borderTop: '1px solid var(--mantine-color-gray-3)' }}>
              <Button variant="default" onClick={onBack} size="md">
                Cancel
              </Button>
              
              <Button
                leftSection={<IconDeviceFloppy size={18} />}
                onClick={handleSave}
                size="md"
                loading={isSubmitting || isValidating}
                disabled={isSubmitting || isValidating}
              >
                {isSubmitting ? 'Updating...' : isValidating ? 'Validating...' : 'Update Order'}
              </Button>
            </Group>
            </Stack>
          </Paper>
        </Stack>
      </Box>
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

  // Initial form data with proper types
  const initialData: EditOrderFormData = {
    reference: '',
    service: null,
    priority: false,
    eta_date: null,
    eta_time: '',
    etd_date: null,
    etd_time: '',
    eta_driver_id: null,
    eta_driver: null,
    eta_driver_phone: null,
    eta_truck_id: null,
    eta_truck: null,
    eta_trailer_id: null,
    eta_trailer: null,
    etd_driver_id: null,
    etd_driver: null,
    etd_driver_phone: null,
    etd_truck_id: null,
    etd_truck: null,
    etd_trailer_id: null,
    etd_trailer: null,
    commodity: null,
    pallets: null,
    boxes: null,
    kilos: null,
    notes: null,
  };

  return (
    <FormProvider<EditOrderFormData> initialData={initialData}>
      <EditOrderFormContent 
        orderId={orderId}
        onBack={handleBack}
      />
    </FormProvider>
  );
};
