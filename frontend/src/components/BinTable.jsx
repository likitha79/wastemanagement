function BinTable({ bins }) {
  if (!bins || bins.length === 0) {
    return <p>No bins found.</p>;
  }

  const statusColor = {
    empty: 'green',
    half: 'orange',
    full: 'red',
  };

  return (
    <table className="bin-table">
      <thead>
        <tr>
          <th>Location</th>
          <th>Fill Level</th>
          <th>Status</th>
          <th>Last Updated</th>
        </tr>
      </thead>
      <tbody>
        {bins.map((bin) => (
          <tr key={bin._id}>
            <td>{bin.location}</td>
            <td>{bin.fillLevel}%</td>
            <td>
              <span
                className="status-badge"
                style={{ backgroundColor: statusColor[bin.status] }}
              >
                {bin.status}
              </span>
            </td>
            <td>{new Date(bin.lastUpdated).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default BinTable;
