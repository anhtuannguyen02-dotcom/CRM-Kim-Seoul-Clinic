import { useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { initializeFirestore, collection, onSnapshot, doc, writeBatch, setDoc, getDocs } from 'firebase/firestore';

// Hardcoded Firebase Config from firebase-applet-config.json
const firebaseConfig = {
  apiKey: "AIzaSyA7Q2G_jMAYlGh9uXqxnyBrrU-0zYmizcU",
  authDomain: "tu-dong-bao-cao-kinh-doanh.firebaseapp.com",
  projectId: "tu-dong-bao-cao-kinh-doanh",
  storageBucket: "tu-dong-bao-cao-kinh-doanh.firebasestorage.app",
  messagingSenderId: "201577900884",
  appId: "1:201577900884:web:cd2a1809ff5cb3df8736c1"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with custom databaseId
export const db = initializeFirestore(app, {}, "ai-studio-kimseoulpremiumc-7ece1ee8-9a19-46c6-8243-4a8875c146d9");

/**
 * Custom Hook to synchronize a client-side React array state with a Firestore collection in real-time.
 * If Firestore is empty on the very first load, it seeds Firestore with the current state (or initialData).
 * Otherwise, it fetches and listens to the Firestore collection and updates the React state.
 * Any local changes made to the React state are automatically written back to Firestore.
 */
export function useSyncCollection<T extends { id: string }>(
  collectionName: string,
  state: T[],
  setState: (data: T[]) => void,
  initialData: T[]
) {
  const isFirstLoad = useRef(true);
  const firestoreDataRef = useRef<string>('');

  // 1. Listen to Firestore changes (Incoming)
  useEffect(() => {
    const colRef = collection(db, collectionName);
    const unsubscribe = onSnapshot(colRef, async (snapshot) => {
      const items: T[] = [];
      snapshot.forEach((doc) => {
        items.push({ ...doc.data() } as unknown as T);
      });

      // If Firestore is empty and it's the first load, seed it
      if (items.length === 0 && isFirstLoad.current) {
        isFirstLoad.current = false;
        const seedData = state.length > 0 ? state : initialData;
        const batch = writeBatch(db);
        seedData.forEach((item) => {
          const docRef = doc(db, collectionName, item.id);
          batch.set(docRef, item);
        });
        await batch.commit();
        setState(seedData);
        firestoreDataRef.current = JSON.stringify(seedData);
        return;
      }

      isFirstLoad.current = false;

      // Ensure stable stringified comparison
      // Sort elements by id to maintain consistency regardless of fetch order
      const sortedItems = [...items].sort((a, b) => a.id.localeCompare(b.id));
      const stringified = JSON.stringify(sortedItems);

      if (stringified !== firestoreDataRef.current) {
        firestoreDataRef.current = stringified;
        setState(items);
      }
    });

    return () => unsubscribe();
  }, [collectionName]);

  // 2. Sync local updates to Firestore (Outgoing)
  useEffect(() => {
    if (isFirstLoad.current) return;

    const sortedLocal = [...state].sort((a, b) => a.id.localeCompare(b.id));
    const stringified = JSON.stringify(sortedLocal);

    if (stringified !== firestoreDataRef.current) {
      firestoreDataRef.current = stringified;

      const syncLocalToFirestore = async () => {
        try {
          const colRef = collection(db, collectionName);
          const snapshot = await getDocs(colRef);
          const firestoreIds = new Set<string>();
          snapshot.forEach(docSnap => firestoreIds.add(docSnap.id));

          const localIds = new Set(state.map(item => item.id));
          const batch = writeBatch(db);

          // Delete documents that are no longer in the local state
          firestoreIds.forEach(id => {
            if (!localIds.has(id)) {
              batch.delete(doc(db, collectionName, id));
            }
          });

          // Create or update documents that exist in the local state
          state.forEach(item => {
            batch.set(doc(db, collectionName, item.id), item);
          });

          await batch.commit();
        } catch (error) {
          console.error(`Error syncing collection ${collectionName} to Firestore:`, error);
        }
      };

      syncLocalToFirestore();
    }
  }, [state, collectionName]);
}

/**
 * Custom Hook to synchronize a client-side React object state with a single Firestore document.
 * If the document is missing on first load, it seeds Firestore with the current state (or initialData).
 * Otherwise, it listens to updates and keeps them in sync.
 */
export function useSyncDocument<T>(
  collectionName: string,
  docId: string,
  state: T,
  setState: (data: T) => void,
  initialData: T
) {
  const isFirstLoad = useRef(true);
  const firestoreDataRef = useRef<string>('');

  // 1. Listen to Firestore document changes (Incoming)
  useEffect(() => {
    const docRef = doc(db, collectionName, docId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as T;
        const stringified = JSON.stringify(data);
        if (stringified !== firestoreDataRef.current) {
          firestoreDataRef.current = stringified;
          setState(data);
        }
        isFirstLoad.current = false;
      } else if (isFirstLoad.current) {
        isFirstLoad.current = false;
        const seedData = state || initialData;
        setDoc(docRef, seedData as any);
        setState(seedData);
        firestoreDataRef.current = JSON.stringify(seedData);
      }
    });

    return () => unsubscribe();
  }, [collectionName, docId]);

  // 2. Sync local updates to Firestore (Outgoing)
  useEffect(() => {
    if (isFirstLoad.current) return;

    const stringified = JSON.stringify(state);
    if (stringified !== firestoreDataRef.current) {
      firestoreDataRef.current = stringified;
      const docRef = doc(db, collectionName, docId);
      setDoc(docRef, state as any).catch(err => {
        console.error(`Error syncing document ${collectionName}/${docId} to Firestore:`, err);
      });
    }
  }, [state, collectionName, docId]);
}
