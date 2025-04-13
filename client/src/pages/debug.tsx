import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { auth, firestore, database, storage } from '../firebase/config';
import { getAuth, signInAnonymously, signOut } from 'firebase/auth';
import { query, collection, getDocs, limit } from 'firebase/firestore';
import { ref, set, get } from 'firebase/database';
import { ref as storageRef, uploadString, getDownloadURL } from 'firebase/storage';

const DebugPage = () => {
  const [authStatus, setAuthStatus] = useState<string>('Not tested');
  const [firestoreStatus, setFirestoreStatus] = useState<string>('Not tested');
  const [databaseStatus, setDatabaseStatus] = useState<string>('Not tested');
  const [storageStatus, setStorageStatus] = useState<string>('Not tested');
  const [configInfo, setConfigInfo] = useState<string>('Loading...');

  useEffect(() => {
    // Display Firebase config information (safely)
    const showConfig = () => {
      try {
        const config = {
          apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? '✓ Set' : '✗ Not set',
          projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ? '✓ Set' : '✗ Not set',
          appId: import.meta.env.VITE_FIREBASE_APP_ID ? '✓ Set' : '✗ Not set',
          databaseURL: `https://${import.meta.env.VITE_FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`
        };
        setConfigInfo(JSON.stringify(config, null, 2));
      } catch (error) {
        setConfigInfo(`Error checking config: ${error instanceof Error ? error.message : String(error)}`);
      }
    };
    
    showConfig();
  }, []);

  const testAuth = async () => {
    try {
      setAuthStatus('Testing...');
      // Try anonymous auth
      await signInAnonymously(auth);
      setAuthStatus('✅ Working - Anonymous auth successful');
      // Sign out after successful test
      await signOut(auth);
    } catch (error) {
      setAuthStatus(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const testFirestore = async () => {
    try {
      setFirestoreStatus('Testing...');
      // Try to query a collection
      const q = query(collection(firestore, 'debug_test'), limit(1));
      await getDocs(q);
      setFirestoreStatus('✅ Working - Firestore query successful');
    } catch (error) {
      setFirestoreStatus(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const testDatabase = async () => {
    try {
      setDatabaseStatus('Testing...');
      // Create a test reference
      const testRef = ref(database, 'debug_test');
      // Try to write and read
      await set(testRef, { timestamp: Date.now() });
      await get(testRef);
      setDatabaseStatus('✅ Working - Database write/read successful');
    } catch (error) {
      setDatabaseStatus(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const testStorage = async () => {
    try {
      setStorageStatus('Testing...');
      // Create a test file
      const testRef = storageRef(storage, `debug_test_${Date.now()}.txt`);
      // Upload a simple text file
      await uploadString(testRef, 'Test content');
      // Try to get the download URL
      await getDownloadURL(testRef);
      setStorageStatus('✅ Working - Storage upload/download successful');
    } catch (error) {
      setStorageStatus(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Firebase Connectivity Debug</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-2">Firebase Configuration</h3>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto text-sm">
              {configInfo}
            </pre>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Authentication</h3>
              <div className="flex items-center gap-2">
                <Button onClick={testAuth} variant="outline">Test Auth</Button>
                <span className={authStatus.includes('✅') ? 'text-green-500' : authStatus.includes('❌') ? 'text-red-500' : ''}>
                  {authStatus}
                </span>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Firestore</h3>
              <div className="flex items-center gap-2">
                <Button onClick={testFirestore} variant="outline">Test Firestore</Button>
                <span className={firestoreStatus.includes('✅') ? 'text-green-500' : firestoreStatus.includes('❌') ? 'text-red-500' : ''}>
                  {firestoreStatus}
                </span>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Realtime Database</h3>
              <div className="flex items-center gap-2">
                <Button onClick={testDatabase} variant="outline">Test Database</Button>
                <span className={databaseStatus.includes('✅') ? 'text-green-500' : databaseStatus.includes('❌') ? 'text-red-500' : ''}>
                  {databaseStatus}
                </span>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Storage</h3>
              <div className="flex items-center gap-2">
                <Button onClick={testStorage} variant="outline">Test Storage</Button>
                <span className={storageStatus.includes('✅') ? 'text-green-500' : storageStatus.includes('❌') ? 'text-red-500' : ''}>
                  {storageStatus}
                </span>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500 mt-4">
              If any tests are failing, check your Firebase configuration, security rules, and network connectivity.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DebugPage;