import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import ApiService from '../services/apiService';

type Driver = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  license_number: string | null;
  license_expiry: string | null;
};

type Terminal = {
  id: string;
  name: string;
  code: string;
  address: string | null;
  phone: string | null;
  email: string | null;
};

type Trailer = {
  id: string;
  license_plate: string;
  type: string | null;
  capacity: number | null;
};

type Truck = {
  id: string;
  truck_number: string;
  make: string | null;
  model: string | null;
  year: number | null;
  license_plate: string | null;
};

type ReferenceDataContextType = {
  drivers: Driver[] | null;
  terminals: Terminal[] | null;
  trucks: Truck[] | null;
  trailers: Trailer[] | null;
  loading: {
    drivers: boolean;
    terminals: boolean;
    trucks: boolean;
    trailers: boolean;
  };
};

const ReferenceDataContext = createContext<ReferenceDataContextType | undefined>(undefined);

export const ReferenceDataProvider = ({ children }: { children: ReactNode }) => {
  const [drivers, setDrivers] = useState<Driver[] | null>(null);
  const [terminals, setTerminals] = useState<Terminal[] | null>(null);
  const [trucks, setTrucks] = useState<Truck[] | null>(null);
  const [trailers, setTrailers] = useState<Trailer[] | null>(null);
  const [loading, setLoading] = useState({ drivers: false, terminals: false, trucks: false, trailers: false });

  useEffect(() => {
    setLoading(l => ({ ...l, drivers: true }));
    ApiService.getDrivers().then(setDrivers).finally(() => setLoading(l => ({ ...l, drivers: false })));
    setLoading(l => ({ ...l, terminals: true }));
    ApiService.getTerminals().then(setTerminals).finally(() => setLoading(l => ({ ...l, terminals: false })));
    setLoading(l => ({ ...l, trucks: true }));
    ApiService.getTrucks().then(setTrucks).finally(() => setLoading(l => ({ ...l, trucks: false })));
    setLoading(l => ({ ...l, trailers: true }));
    ApiService.getTrailers().then(setTrailers).finally(() => setLoading(l => ({ ...l, trailers: false })));
  }, []);

  return (
    <ReferenceDataContext.Provider value={{ drivers, terminals, trucks, trailers, loading }}>
      {children}
    </ReferenceDataContext.Provider>
  );
};

export const useReferenceData = () => {
  const ctx = useContext(ReferenceDataContext);
  if (!ctx) throw new Error('useReferenceData must be used within ReferenceDataProvider');
  return ctx;
};
