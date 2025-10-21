/**
 * Validation schemas for Order forms using Zod
 */

import { z } from 'zod';
import { OrderService, CommodityType } from '../types/order';
import { VALIDATION } from '../../../shared/constants';

/**
 * Create Order validation schema
 */
export const createOrderSchema = z.object({
  reference: z
    .string()
    .min(VALIDATION.MIN_REFERENCE_LENGTH, 'Reference is required')
    .max(VALIDATION.MAX_REFERENCE_LENGTH, `Reference must be less than ${VALIDATION.MAX_REFERENCE_LENGTH} characters`),

  service: z.nativeEnum(OrderService, {
    message: 'Service type is required',
  }),

  terminal_id: z.string().uuid('Valid terminal is required'),

  eta_date: z.string().nullable().optional(),
  eta_time: z.string().nullable().optional(),
  etd_date: z.string().nullable().optional(),
  etd_time: z.string().nullable().optional(),

  commodity: z.nativeEnum(CommodityType).nullable().optional(),

  pallets: z
    .number()
    .int('Pallets must be a whole number')
    .min(0, 'Pallets cannot be negative')
    .nullable()
    .optional(),

  boxes: z
    .number()
    .int('Boxes must be a whole number')
    .min(0, 'Boxes cannot be negative')
    .nullable()
    .optional(),

  kilos: z
    .number()
    .min(0, 'Kilos cannot be negative')
    .nullable()
    .optional(),

  notes: z
    .string()
    .max(VALIDATION.MAX_NOTES_LENGTH, `Notes must be less than ${VALIDATION.MAX_NOTES_LENGTH} characters`)
    .nullable()
    .optional(),

  priority: z.boolean().optional().default(false),

  // ETA vehicle assignments
  eta_driver_id: z.string().uuid().nullable().optional(),
  eta_truck_id: z.string().uuid().nullable().optional(),
  eta_trailer_id: z.string().uuid().nullable().optional(),

  // ETD vehicle assignments
  etd_driver_id: z.string().uuid().nullable().optional(),
  etd_truck_id: z.string().uuid().nullable().optional(),
  etd_trailer_id: z.string().uuid().nullable().optional(),

  // Manual entry fields (alternative to IDs)
  eta_driver: z.string().nullable().optional(),
  eta_driver_phone: z.string().nullable().optional(),
  eta_truck: z.string().nullable().optional(),
  eta_trailer: z.string().nullable().optional(),
  etd_driver: z.string().nullable().optional(),
  etd_driver_phone: z.string().nullable().optional(),
  etd_truck: z.string().nullable().optional(),
  etd_trailer: z.string().nullable().optional(),
});

/**
 * Update Order validation schema (all fields optional except ID)
 */
export const updateOrderSchema = createOrderSchema.partial();

/**
 * Driver validation schema
 */
export const driverSchema = z.object({
  name: z
    .string()
    .min(VALIDATION.MIN_NAME_LENGTH, `Name must be at least ${VALIDATION.MIN_NAME_LENGTH} characters`)
    .max(VALIDATION.MAX_NAME_LENGTH, `Name must be less than ${VALIDATION.MAX_NAME_LENGTH} characters`),

  email: z
    .string()
    .email('Invalid email address')
    .nullable()
    .optional(),

  phone: z
    .string()
    .nullable()
    .optional(),

  license_number: z
    .string()
    .nullable()
    .optional(),

  license_expiry: z
    .string()
    .nullable()
    .optional(),
});

/**
 * Terminal validation schema
 */
export const terminalSchema = z.object({
  name: z
    .string()
    .min(VALIDATION.MIN_NAME_LENGTH, `Name must be at least ${VALIDATION.MIN_NAME_LENGTH} characters`)
    .max(VALIDATION.MAX_NAME_LENGTH, `Name must be less than ${VALIDATION.MAX_NAME_LENGTH} characters`),

  code: z
    .string()
    .min(1, 'Code is required')
    .max(50, 'Code must be less than 50 characters'),

  address: z
    .string()
    .nullable()
    .optional(),

  phone: z
    .string()
    .nullable()
    .optional(),

  email: z
    .string()
    .email('Invalid email address')
    .nullable()
    .optional(),
});

/**
 * Truck validation schema
 */
export const truckSchema = z.object({
  truck_number: z
    .string()
    .min(1, 'Truck number is required')
    .max(50, 'Truck number must be less than 50 characters'),

  make: z
    .string()
    .nullable()
    .optional(),

  model: z
    .string()
    .nullable()
    .optional(),

  year: z
    .number()
    .int('Year must be a whole number')
    .min(1900, 'Invalid year')
    .max(new Date().getFullYear() + 1, 'Invalid year')
    .nullable()
    .optional(),

  license_plate: z
    .string()
    .nullable()
    .optional(),
});

/**
 * Trailer validation schema
 */
export const trailerSchema = z.object({
  license_plate: z
    .string()
    .min(1, 'License plate is required')
    .max(50, 'License plate must be less than 50 characters'),

  type: z
    .string()
    .nullable()
    .optional(),

  capacity: z
    .number()
    .min(0, 'Capacity cannot be negative')
    .nullable()
    .optional(),
});

// Type inference for TypeScript
export type CreateOrderFormData = z.infer<typeof createOrderSchema>;
export type UpdateOrderFormData = z.infer<typeof updateOrderSchema>;
export type DriverFormData = z.infer<typeof driverSchema>;
export type TerminalFormData = z.infer<typeof terminalSchema>;
export type TruckFormData = z.infer<typeof truckSchema>;
export type TrailerFormData = z.infer<typeof trailerSchema>;
