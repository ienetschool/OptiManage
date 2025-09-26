export default function TestPage() {
  return (
    <div style={{padding: '20px', fontFamily: 'Arial', maxWidth: '800px', margin: '0 auto'}}>
      <h1 style={{color: '#333', marginBottom: '20px'}}>IeOMS Installation Test</h1>
      
      <div style={{backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px'}}>
        <h2 style={{color: '#666', marginBottom: '10px'}}>Database Connection Test</h2>
        <p>This is a test page to verify React routing is working.</p>
        
        <button 
          onClick={async () => {
            try {
              const response = await fetch('/api/install/test-connection', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  dbType: 'postgresql',
                  dbHost: '5.181.218.15',
                  dbPort: '5432',
                  dbUser: 'ledbpt_opt',
                  dbPassword: 'Ra4#PdaqW0c^pa8c',
                  dbName: 'ieopt'
                })
              });
              
              const result = await response.json();
              alert(result.success ? 'Database connection successful!' : 'Connection failed: ' + result.message);
            } catch (error: any) {
              alert('Error: ' + error.message);
            }
          }}
          style={{
            backgroundColor: '#28a745', 
            color: 'white', 
            padding: '10px 20px', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Test Database Connection
        </button>
      </div>
      
      <div style={{backgroundColor: '#e7f3ff', padding: '20px', borderRadius: '8px'}}>
        <h3>Database Configuration</h3>
        <ul style={{margin: '10px 0', paddingLeft: '20px'}}>
          <li>Host: 5.181.218.15</li>
          <li>Port: 5432</li>
          <li>Database: ieopt</li>
          <li>User: ledbpt_opt</li>
          <li>Type: PostgreSQL</li>
        </ul>
      </div>
    </div>
  );
}