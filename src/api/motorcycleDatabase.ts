import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import { storage } from '@/services/storageService';
import type {
  MotorcycleEventRow,
  MotorcycleFuelLogRow,
  MotorcycleOdometerRow,
} from '@/types/database';

export type MotorcycleEventType =
  | 'service'
  | 'tyre_pressure_check'
  | 'wash'
  | 'check';

export const motorcycleDB = {
  isReady(): boolean {
    return isSupabaseConfigured();
  },

  async addOdometer(userId: string, km: number): Promise<MotorcycleOdometerRow> {
    if (!this.isReady()) {
      const row: MotorcycleOdometerRow = {
        id: crypto?.randomUUID?.() ?? `id-${Date.now()}`,
        user_id: userId,
        km,
        recorded_at: new Date().toISOString(),
      };
      const k = `life.motorcycle_odometers.${userId}`;
      const rows = storage.get<MotorcycleOdometerRow[]>(k) ?? [];
      storage.set(k, [row, ...rows]);
      return row;
    }
    const { data, error } = await supabase
      .from('motorcycle_odometers')
      .insert({ user_id: userId, km })
      .select('*')
      .single();
    if (error) {
      logger.error('addOdometer failed', error);
      throw error;
    }
    return data as MotorcycleOdometerRow;
  },

  async getLatestOdometer(userId: string): Promise<MotorcycleOdometerRow | null> {
    if (!this.isReady()) {
      const k = `life.motorcycle_odometers.${userId}`;
      const rows = storage.get<MotorcycleOdometerRow[]>(k) ?? [];
      return rows[0] ?? null;
    }
    const { data, error } = await supabase
      .from('motorcycle_odometers')
      .select('*')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) {
      logger.error('getLatestOdometer failed', error);
      throw error;
    }
    return (data as MotorcycleOdometerRow | null) ?? null;
  },

  async addFuelLog(params: {
    userId: string;
    liters?: number | null;
    totalCents?: number | null;
    priceCents?: number | null;
    kmAtFill?: number | null;
  }): Promise<MotorcycleFuelLogRow> {
    if (!this.isReady()) {
      const row: MotorcycleFuelLogRow = {
        id: crypto?.randomUUID?.() ?? `id-${Date.now()}`,
        user_id: params.userId,
        liters: params.liters ?? null,
        price_cents: params.priceCents ?? null,
        total_cents: params.totalCents ?? null,
        km_at_fill: params.kmAtFill ?? null,
        recorded_at: new Date().toISOString(),
      };
      const k = `life.motorcycle_fuel_logs.${params.userId}`;
      const rows = storage.get<MotorcycleFuelLogRow[]>(k) ?? [];
      storage.set(k, [row, ...rows]);
      return row;
    }
    const { data, error } = await supabase
      .from('motorcycle_fuel_logs')
      .insert({
        user_id: params.userId,
        liters: params.liters ?? null,
        total_cents: params.totalCents ?? null,
        price_cents: params.priceCents ?? null,
        km_at_fill: params.kmAtFill ?? null,
      })
      .select('*')
      .single();
    if (error) {
      logger.error('addFuelLog failed', error);
      throw error;
    }
    return data as MotorcycleFuelLogRow;
  },

  async listFuelLogs(userId: string, limit = 50): Promise<MotorcycleFuelLogRow[]> {
    if (!this.isReady()) {
      const k = `life.motorcycle_fuel_logs.${userId}`;
      const rows = storage.get<MotorcycleFuelLogRow[]>(k) ?? [];
      return rows.slice(0, limit);
    }
    const { data, error } = await supabase
      .from('motorcycle_fuel_logs')
      .select('*')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false })
      .limit(limit);
    if (error) {
      logger.error('listFuelLogs failed', error);
      throw error;
    }
    return (data ?? []) as MotorcycleFuelLogRow[];
  },

  async addEvent(userId: string, type: MotorcycleEventType): Promise<MotorcycleEventRow> {
    if (!this.isReady()) {
      const row: MotorcycleEventRow = {
        id: crypto?.randomUUID?.() ?? `id-${Date.now()}`,
        user_id: userId,
        type,
        recorded_at: new Date().toISOString(),
      };
      const k = `life.motorcycle_events.${userId}`;
      const rows = storage.get<MotorcycleEventRow[]>(k) ?? [];
      storage.set(k, [row, ...rows]);
      return row;
    }
    const { data, error } = await supabase
      .from('motorcycle_events')
      .insert({ user_id: userId, type })
      .select('*')
      .single();
    if (error) {
      logger.error('addEvent failed', error);
      throw error;
    }
    return data as MotorcycleEventRow;
  },

  async getLatestEvent(userId: string, type: MotorcycleEventType): Promise<MotorcycleEventRow | null> {
    if (!this.isReady()) {
      const k = `life.motorcycle_events.${userId}`;
      const rows = storage.get<MotorcycleEventRow[]>(k) ?? [];
      return rows.find((r) => r.type === type) ?? null;
    }
    const { data, error } = await supabase
      .from('motorcycle_events')
      .select('*')
      .eq('user_id', userId)
      .eq('type', type)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) {
      logger.error('getLatestEvent failed', error);
      throw error;
    }
    return (data as MotorcycleEventRow | null) ?? null;
  },
};

