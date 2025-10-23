import { z } from 'zod';

/**
 * Helper: Convert Date to ISO date string (YYYY-MM-DD)
 */
const dateToISOString = (date: Date | null) =>
  date ? date.toISOString().split('T')[0] : null;

/**
 * Helper: Preprocess API string dates to Date objects
 */
const preprocessDate = z.preprocess(
  (val) => (typeof val === 'string' && val ? new Date(val) : val),
  z.date().nullable()
);

/**
 * Base schema for creating new orders (represents form state)
 */
const createOrderFormSchemaBase = z.object({
  reference: z.string().min(1, 'Reference is required'),
  service: z.coerce.number(), // Coerce string from select input to number
  terminal_id: z.string(),
  priority: z.boolean(),
  eta_date: z.date().nullable(),
  eta_time: z.string(),
  etd_date: z.date().nullable(),
  etd_time: z.string(),
  commodity: z.string().nullable(),
  pallets: z.number(),
  boxes: z.number(),
  kilos: z.number(),
  notes: z.string(),
});

/**
 * Schema with transform: Form data → API data
 * Automatically converts Date → ISO strings and removes empty values
 */
export const createOrderFormSchema = createOrderFormSchemaBase.transform((data) => {
  const result: Record<string, any> = {};

  Object.entries(data).forEach(([key, value]) => {
    // Skip empty strings and undefined
    if (value === '' || value === undefined) return;

    // Convert Date to ISO string
    if (value instanceof Date) {
      result[key] = dateToISOString(value);
    } else {
      result[key] = value;
    }
  });

  return result;
});

/**
 * Base schema for editing orders (represents form state)
 */
const editOrderFormSchemaBase = z.object({
  reference: z.string(),
  service: z.number().nullable(),
  priority: z.boolean(),
  eta_date: z.date().nullable(),
  eta_time: z.string(),
  etd_date: z.date().nullable(),
  etd_time: z.string(),
  eta_driver_id: z.string().nullable(),
  eta_driver: z.string().nullable(),
  eta_driver_phone: z.string().nullable(),
  eta_truck_id: z.string().nullable(),
  eta_truck: z.string().nullable(),
  eta_trailer_id: z.string().nullable(),
  eta_trailer: z.string().nullable(),
  etd_driver_id: z.string().nullable(),
  etd_driver: z.string().nullable(),
  etd_driver_phone: z.string().nullable(),
  etd_truck_id: z.string().nullable(),
  etd_truck: z.string().nullable(),
  etd_trailer_id: z.string().nullable(),
  etd_trailer: z.string().nullable(),
  commodity: z.string().nullable(),
  pallets: z.number().nullable(),
  boxes: z.number().nullable(),
  kilos: z.number().nullable(),
  notes: z.string().nullable(),
});

/**
 * Schema with transform: Form data → API data
 */
export const editOrderFormSchema = editOrderFormSchemaBase.transform((data) => {
  const result: Record<string, any> = {};

  Object.entries(data).forEach(([key, value]) => {
    // Skip empty strings and undefined
    if (value === '' || value === undefined) return;

    // Convert Date to ISO string
    if (value instanceof Date) {
      result[key] = dateToISOString(value);
    } else {
      result[key] = value;
    }
  });

  return result;
});

/**
 * Schema for loading API data into forms (API → Form)
 */
export const apiToFormSchema = z.object({
  reference: z.string(),
  service: z.number().nullable(),
  priority: z.boolean(),
  eta_date: preprocessDate,
  eta_time: z.string().nullable().transform(val => val || ''),
  etd_date: preprocessDate,
  etd_time: z.string().nullable().transform(val => val || ''),
  eta_driver_id: z.string().nullable(),
  eta_driver: z.string().nullable(),
  eta_driver_phone: z.string().nullable(),
  eta_truck_id: z.string().nullable(),
  eta_truck: z.string().nullable(),
  eta_trailer_id: z.string().nullable(),
  eta_trailer: z.string().nullable(),
  etd_driver_id: z.string().nullable(),
  etd_driver: z.string().nullable(),
  etd_driver_phone: z.string().nullable(),
  etd_truck_id: z.string().nullable(),
  etd_truck: z.string().nullable(),
  etd_trailer_id: z.string().nullable(),
  etd_trailer: z.string().nullable(),
  commodity: z.string().nullable(),
  pallets: z.number().nullable(),
  boxes: z.number().nullable(),
  kilos: z.number().nullable(),
  notes: z.string().nullable(),
});

/**
 * Type inference - automatically derived from schemas
 */
export type CreateOrderFormData = z.infer<typeof createOrderFormSchemaBase>;
export type EditOrderFormData = z.infer<typeof editOrderFormSchemaBase>;
