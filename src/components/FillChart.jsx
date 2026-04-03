import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function FillChart({ bins }) {
  const data = {
    labels: bins.map((bin) => bin.location),
    datasets: [
      {
        label: 'Fill Level (%)',
        data: bins.map((bin) => bin.fillLevel),
        backgroundColor: bins.map((bin) => {
          if (bin.fillLevel <= 30) return 'rgba(76, 175, 80, 0.75)';
          if (bin.fillLevel <= 79) return 'rgba(255, 152, 0, 0.75)';
          return 'rgba(244, 67, 54, 0.75)';
        }),
        borderColor: bins.map((bin) => {
          if (bin.fillLevel <= 30) return '#388e3c';
          if (bin.fillLevel <= 79) return '#f57c00';
          return '#d32f2f';
        }),
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: { color: 'rgba(0,0,0,.05)' },
        ticks: { font: { size: 12 } },
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 12 } },
      },
    },
  };

  return <Bar data={data} options={options} />;
}

export default FillChart;
