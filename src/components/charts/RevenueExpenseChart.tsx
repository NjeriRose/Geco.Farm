import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface RevenueExpenseChartProps {
  revenue: number[];
  expenses: number[];
  labels: string[];
}

export function RevenueExpenseChart({ revenue, expenses, labels }: RevenueExpenseChartProps) {
  return (
    <Bar
      data={{
        labels,
        datasets: [
          {
            label: 'Revenue (KSh)',
            data: revenue,
            backgroundColor: 'rgba(22, 163, 74, 0.7)',
            borderRadius: 4,
          },
          {
            label: 'Expenses (KSh)',
            data: expenses,
            backgroundColor: 'rgba(239, 68, 68, 0.7)',
            borderRadius: 4,
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 8 } },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.dataset.label}: KSh ${ctx.parsed.y.toLocaleString()}`,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { callback: (v) => `KSh ${Number(v).toLocaleString()}` },
          },
        },
      }}
    />
  );
}
