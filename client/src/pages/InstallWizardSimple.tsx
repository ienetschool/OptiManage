import React, { useState } from 'react';

export default function InstallWizardSimple() {
  const [connectionStatus, setConnectionStatus] = useState('idle');
  const [connectionMessage, setConnectionMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const testConnection = async () => {
    setIsLoading(true);
    setConnectionStatus('testing');
    setConnectionMessage('Testing connection...');

    try {
      const response = await fetch('/api/install/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dbType: 'postgresql',
          dbHost: 'localhost',
          dbPort: '5432',
          dbUser: 'ledbpt_opt',
          dbPassword: '',
          dbName: 'ieopt'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setConnectionStatus('success');
        setConnectionMessage('Database connection successful!');
      } else {
        throw new Error(result.error || 'Connection failed');
      }
    } catch (error) {
      setConnectionStatus('error');
      setConnectionMessage(`Connection failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            OptiStore Pro Installation Wizard
          </h1>
          <p className="text-gray-600">Database Connection Testing</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Connection Status</h3>
                <div className={`font-medium ${
                  connectionStatus === 'idle' ? 'text-gray-500' :
                  connectionStatus === 'testing' ? 'text-yellow-600' :
                  connectionStatus === 'success' ? 'text-green-600' :
                  'text-red-600'
                }`}>
                  {connectionStatus === 'idle' ? 'Ready to test' :
                   connectionStatus === 'testing' ? 'Testing...' :
                   connectionStatus === 'success' ? 'Success' :
                   'Failed'}
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                {connectionStatus === 'idle' ? (
                  <p className="text-gray-600">
                    Click "Test Database Connection" to verify settings
                  </p>
                ) : connectionStatus === 'success' ? (
                  <div className="text-green-600">
                    <p>✅ Database connection verified</p>
                    <p className="text-gray-600 mt-1">PostgreSQL localhost:5432/ieopt</p>
                  </div>
                ) : connectionStatus === 'error' ? (
                  <div className="text-red-600">
                    <p>❌ {connectionMessage}</p>
                  </div>
                ) : (
                  <p className="text-yellow-600">{connectionMessage}</p>
                )}
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={testConnection}
                disabled={isLoading}
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Testing...' : 'Test Database Connection'}
              </button>
            </div>

            {connectionStatus === 'success' && (
              <div className="text-center mt-6">
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Continue to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}