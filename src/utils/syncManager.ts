import { useEffect, useRef } from 'react';
import { collection, onSnapshot, doc, writeBatch, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { ServiceItem, Customer, Appointment } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

/**
 * Compliance-ready error handler for Firestore as specified in the Firebase integration skill.
 */
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
    },
    operationType,
    path
  };
  console.error('Firestore Sync Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface CentralSyncProps {
  services: ServiceItem[];
  setServices: (data: ServiceItem[]) => void;
  initialServices: ServiceItem[];

  customers: Customer[];
  setCustomers: (data: Customer[]) => void;
  initialCustomers: Customer[];

  appointments: Appointment[];
  setAppointments: (data: Appointment[]) => void;
  initialAppointments: Appointment[];

  onSyncUpdate?: (
    currentServices: ServiceItem[],
    currentAppointments: Appointment[],
    currentCustomers: Customer[]
  ) => void;
}

/**
 * useCentralSyncManager
 * Focuses all onSnapshot real-time listener logic for services, customers, and appointments.
 * Guarantees that any price list or data updates immediately propagate and trigger financial recalculations.
 */
export function useCentralSyncManager({
  services,
  setServices,
  initialServices,
  customers,
  setCustomers,
  initialCustomers,
  appointments,
  setAppointments,
  initialAppointments,
  onSyncUpdate
}: CentralSyncProps) {
  
  const firstLoadRef = useRef({
    services: true,
    customers: true,
    appointments: true
  });

  const firestoreDataRef = useRef({
    services: '',
    customers: '',
    appointments: ''
  });

  // Store the latest live states inside a mutable ref to safely read them inside callback triggers
  const latestStatesRef = useRef({
    services,
    customers,
    appointments
  });

  useEffect(() => {
    latestStatesRef.current = { services, customers, appointments };
  }, [services, customers, appointments]);

  // Safe wrapper to trigger update notification when data changes
  const triggerUpdateNotification = (
    updatedCol?: 'services' | 'customers' | 'appointments',
    updatedData?: any
  ) => {
    if (!onSyncUpdate) return;
    
    const currentServices = updatedCol === 'services' ? updatedData : latestStatesRef.current.services;
    const currentAppointments = updatedCol === 'appointments' ? updatedData : latestStatesRef.current.appointments;
    const currentCustomers = updatedCol === 'customers' ? updatedData : latestStatesRef.current.customers;

    onSyncUpdate(currentServices, currentAppointments, currentCustomers);
  };

  // 1. Listeners setup (Incoming Firestore snapshot changes)
  useEffect(() => {
    // Setup listener for Services
    const unsubServices = onSnapshot(collection(db, 'services'), async (snapshot) => {
      const items: ServiceItem[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ ...docSnap.data() } as unknown as ServiceItem);
      });

      if (items.length === 0 && firstLoadRef.current.services) {
        firstLoadRef.current.services = false;
        const seedData = services.length > 0 ? services : initialServices;
        const batch = writeBatch(db);
        seedData.forEach((item) => {
          batch.set(doc(db, 'services', item.id), item);
        });
        await batch.commit();
        setServices(seedData);
        firestoreDataRef.current.services = JSON.stringify([...seedData].sort((a, b) => a.id.localeCompare(b.id)));
        triggerUpdateNotification('services', seedData);
        return;
      }

      firstLoadRef.current.services = false;
      const sortedItems = [...items].sort((a, b) => a.id.localeCompare(b.id));
      const stringified = JSON.stringify(sortedItems);

      if (stringified !== firestoreDataRef.current.services) {
        firestoreDataRef.current.services = stringified;
        setServices(items);
        triggerUpdateNotification('services', items);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'services');
    });

    // Setup listener for Customers
    const unsubCustomers = onSnapshot(collection(db, 'customers'), async (snapshot) => {
      const items: Customer[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ ...docSnap.data() } as unknown as Customer);
      });

      if (items.length === 0 && firstLoadRef.current.customers) {
        firstLoadRef.current.customers = false;
        const seedData = customers.length > 0 ? customers : initialCustomers;
        const batch = writeBatch(db);
        seedData.forEach((item) => {
          batch.set(doc(db, 'customers', item.id), item);
        });
        await batch.commit();
        setCustomers(seedData);
        firestoreDataRef.current.customers = JSON.stringify([...seedData].sort((a, b) => a.id.localeCompare(b.id)));
        triggerUpdateNotification('customers', seedData);
        return;
      }

      firstLoadRef.current.customers = false;
      const sortedItems = [...items].sort((a, b) => a.id.localeCompare(b.id));
      const stringified = JSON.stringify(sortedItems);

      if (stringified !== firestoreDataRef.current.customers) {
        firestoreDataRef.current.customers = stringified;
        setCustomers(items);
        triggerUpdateNotification('customers', items);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'customers');
    });

    // Setup listener for Appointments
    const unsubAppointments = onSnapshot(collection(db, 'appointments'), async (snapshot) => {
      const items: Appointment[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ ...docSnap.data() } as unknown as Appointment);
      });

      if (items.length === 0 && firstLoadRef.current.appointments) {
        firstLoadRef.current.appointments = false;
        const seedData = appointments.length > 0 ? appointments : initialAppointments;
        const batch = writeBatch(db);
        seedData.forEach((item) => {
          batch.set(doc(db, 'appointments', item.id), item);
        });
        await batch.commit();
        setAppointments(seedData);
        firestoreDataRef.current.appointments = JSON.stringify([...seedData].sort((a, b) => a.id.localeCompare(b.id)));
        triggerUpdateNotification('appointments', seedData);
        return;
      }

      firstLoadRef.current.appointments = false;
      const sortedItems = [...items].sort((a, b) => a.id.localeCompare(b.id));
      const stringified = JSON.stringify(sortedItems);

      if (stringified !== firestoreDataRef.current.appointments) {
        firestoreDataRef.current.appointments = stringified;
        setAppointments(items);
        triggerUpdateNotification('appointments', items);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'appointments');
    });

    return () => {
      unsubServices();
      unsubCustomers();
      unsubAppointments();
    };
  }, []);

  // Helper for outgoing updates to Firestore
  const syncLocalToFirestore = async <T extends { id: string }>(
    colName: 'services' | 'customers' | 'appointments',
    localState: T[]
  ) => {
    if (firstLoadRef.current[colName]) return;

    const sortedLocal = [...localState].sort((a, b) => a.id.localeCompare(b.id));
    const stringified = JSON.stringify(sortedLocal);

    if (stringified !== firestoreDataRef.current[colName]) {
      firestoreDataRef.current[colName] = stringified;

      try {
        const colRef = collection(db, colName);
        const snapshot = await getDocs(colRef);
        const firestoreIds = new Set<string>();
        snapshot.forEach(docSnap => firestoreIds.add(docSnap.id));

        const localIds = new Set(localState.map(item => item.id));
        const batch = writeBatch(db);

        // Delete documents no longer in local state
        firestoreIds.forEach(id => {
          if (!localIds.has(id)) {
            batch.delete(doc(db, colName, id));
          }
        });

        // Add or update documents
        localState.forEach(item => {
          batch.set(doc(db, colName, item.id), item);
        });

        await batch.commit();
        triggerUpdateNotification();
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, colName);
      }
    }
  };

  // 2. Sync local changes to Firestore (Outgoing updates)
  useEffect(() => {
    syncLocalToFirestore('services', services);
  }, [services]);

  useEffect(() => {
    syncLocalToFirestore('customers', customers);
  }, [customers]);

  useEffect(() => {
    syncLocalToFirestore('appointments', appointments);
  }, [appointments]);
}
