import React, { useState, useEffect } from 'react';

interface DatabaseConfig {
  dbType: string;
  dbHost: string;
  dbPort: string;
  dbUser: string;
  dbPassword: string;
  dbName: string;
}

export default function InstallWizard() {
  const [currentStep, setCurrentStep] = useState(1); // Start at step 1
  const [databaseConfig, setDatabaseConfig] = useState<DatabaseConfig>({
    dbType: 'mysql',
    dbHost: '5.181.218.15',
    dbPort: '3306',
    dbUser: 'ledbpt_optie',
    dbPassword: 'g79h94LAP',
    dbName: 'opticpro'
  });
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [connectionMessage, setConnectionMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('✅ InstallWizard component mounted');
    console.log('📊 Current step:', currentStep);
    console.log('🔧 Database config:', databaseConfig);
  }, [currentStep, databaseConfig]);

  const testDatabaseConnection = async () => {
    console.log('🚀 testDatabaseConnection called');
    setIsLoading(true);
    setConnectionStatus('testing');
    setConnectionMessage('Testing connection...');
    
    try {
      console.log('📤 Sending request with config:', databaseConfig);
      
      const response = await fetch('/api/install/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(databaseConfig)
      });
      
      console.log('📨 Response received:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText,
        url: response.url
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response text:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('✅ Success result:', result);
      
      if (result.success) {
        setConnectionStatus('success');
        setConnectionMessage(`Database connection successful! ${result.connectionString || ''}`);
        console.log('🎉 Connection test successful');
      } else {
        throw new Error(result.error || result.message || 'Connection test failed');
      }
      
    } catch (error: any) {
      console.error('💥 Connection test error:', {
        message: error.message,
        stack: error.stack,
        type: error.constructor.name
      });
      setConnectionStatus('error');
      setConnectionMessage(`Connection failed: ${error.message}`);
    } finally {
      setIsLoading(false);
      console.log('🏁 testDatabaseConnection completed');
    }
  };

  const nextStep = () => {
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome to OptiPro</h2>
            <p className="text-gray-600 mb-8">
              Let's set up your optical practice management system
            </p>
            <button 
              onClick={nextStep}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Start Installation
            </button>
          </div>
        );

      case 2:
        return (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Database Configuration</h2>
            <p className="text-gray-600 mb-8">Configure your database connection details</p>
            
            <div className="space-y-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">Database Type</label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      name="dbType" 
                      value="postgresql" 
                      checked={databaseConfig.dbType === 'postgresql'}
                      onChange={(e) => setDatabaseConfig({...databaseConfig, dbType: e.target.value})}
                      className="mr-2 w-4 h-4 text-blue-600" 
                    />
                    <span className="text-sm font-medium text-gray-700">PostgreSQL</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      name="dbType" 
                      value="mysql" 
                      checked={databaseConfig.dbType === 'mysql'}
                      onChange={(e) => setDatabaseConfig({...databaseConfig, dbType: e.target.value})}
                      className="mr-2 w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm font-medium text-gray-700">MySQL</span>
                  </label>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Database Host</label>
                  <input 
                    type="text" 
                    value={databaseConfig.dbHost}
                    onChange={(e) => setDatabaseConfig({...databaseConfig, dbHost: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="localhost" 
                    required 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Database Port</label>
                  <input 
                    type="number" 
                    value={databaseConfig.dbPort}
                    onChange={(e) => setDatabaseConfig({...databaseConfig, dbPort: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="5432" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Database Name</label>
                  <input 
                    type="text" 
                    value={databaseConfig.dbName}
                    onChange={(e) => setDatabaseConfig({...databaseConfig, dbName: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="ieopt" 
                    required 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Database Username</label>
                  <input 
                    type="text" 
                    value={databaseConfig.dbUser}
                    onChange={(e) => setDatabaseConfig({...databaseConfig, dbUser: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="ledbpt_opt" 
                    required 
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Database Password</label>
                  <input 
                    type="password" 
                    value={databaseConfig.dbPassword}
                    onChange={(e) => setDatabaseConfig({...databaseConfig, dbPassword: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your database password" 
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-between mt-8">
              <button 
                onClick={prevStep}
                className="bg-gray-500 text-white px-8 py-3 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Previous
              </button>
              <button 
                onClick={nextStep}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Next: Test Connection
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Database Connection Testing</h2>
            <p className="text-gray-600 mb-8">Verify your database connection is working</p>
            
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Connection Status</h3>
                  <div className={`font-medium ${
                    connectionStatus === 'idle' ? 'text-gray-500' :
                    connectionStatus === 'testing' ? 'text-yellow-600' :
                    connectionStatus === 'success' ? 'text-green-600' :
                    'text-red-600'
                  }`}>
                    {connectionStatus === 'idle' ? 'Not tested' :
                     connectionStatus === 'testing' ? 'Testing...' :
                     connectionStatus === 'success' ? 'Connection Successful' :
                     'Connection Failed'}
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  {connectionStatus === 'idle' ? (
                    <p className="text-gray-600">Click "Test Connection" to verify your database settings</p>
                  ) : connectionStatus === 'success' ? (
                    <div className="text-green-600">
                      <p>✅ Database connection verified</p>
                      <p className="text-gray-600 mt-2">Host: {databaseConfig.dbHost}:{databaseConfig.dbPort}</p>
                      <p className="text-gray-600">Database: {databaseConfig.dbName}</p>
                      <p className="text-gray-600">Type: {databaseConfig.dbType}</p>
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
                  onClick={testDatabaseConnection}
                  disabled={isLoading}
                  className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Testing...' : 'Test Database Connection'}
                </button>
              </div>
            </div>
            
            <div className="flex justify-between mt-8">
              <button 
                onClick={prevStep}
                className="bg-gray-500 text-white px-8 py-3 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Previous
              </button>
              <button 
                onClick={nextStep}
                disabled={connectionStatus !== 'success'}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next: Complete Installation
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Installation Complete</h2>
            <p className="text-gray-600 mb-8">
              Your OptiPro system has been successfully configured!
            </p>
            <button 
              onClick={() => window.location.href = '/'}
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Go to Application
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">OptiPro Installation Wizard</h1>
          <p className="text-lg text-gray-600">Complete 7-stage setup for your optical practice management system</p>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Installation Progress</span>
            <span className="text-sm font-medium text-blue-600">Step {currentStep} of 7</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 7) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-500">Start</span>
            <span className="text-xs text-gray-500">Complete</span>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {renderStep()}
        </div>
      </div>
    </div>
  );
}