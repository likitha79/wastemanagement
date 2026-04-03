import { useState, useEffect } from 'react';
import BinTable from '../components/BinTable';

function Dashboard() {
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sample data for now (will connect to backend API later)
    const sampleBins = [
      { _id: '1', location: 'Canteen', fillLevel: 85, status: 'full', lastUpdated: new Date().toISOString() },
      { _id: '2', location: 'Library', fillLevel: 45, status: 'half', lastUpdated: new Date().toISOString() },
      { _id: '3', location: 'Hostel Block A', fillLevel: 20, status: 'empty', lastUpdated: new Date().toISOString() },
      { _id: '4', location: 'Academic Block 1', fillLevel: 92, status: 'full', lastUpdated: new Date().toISOString() },
      { _id: '5', location: 'Sports Complex', fillLevel: 60, status: 'half', lastUpdated: new Date().toISOString() },
    ];

    setTimeout(() => {
      setBins(sampleBins);
      setLoading(false);
    }, 500);
  }, []);

  const totalBins = bins.length;
  const fullBins = bins.filter(b => b.status === 'full').length;
  const alerts = bins.filter(b => b.fillLevel >= 80).length;

  return (
    <div>
      <h1>Smart Waste Dashboard</h1>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <div>
          <h3>Total Bins</h3>
          <p>{totalBins}</p>
        </div>
        <div>
          <h3>Full Bins</h3>
          <p>{fullBins}</p>
        </div>
        <div>
          <h3>Alerts</h3>
          <p>{alerts}</p>
        </div>
      </div>

      <h2>Bin Details</h2>
      {loading ? <p>Loading...</p> : <BinTable bins={bins} />}
    </div>
  );
}

export default Dashboard;
