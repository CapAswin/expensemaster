import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useTheme } from '@mui/material';
import { Transaction } from '../../_pages/transactionGrid';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Props {
    transactions: Transaction[];
    TransactionType: string;
}

const HorizontalBarChart: React.FC<Props> = ({ transactions, TransactionType }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const ink = theme.palette.text.primary;
    const gridColor = isDark ? 'rgba(254,246,228,0.12)' : 'rgba(10,10,10,0.1)';

    const isIncome = TransactionType === 'Income';
    const fillColor = isIncome ? '#bef264' : '#fca5a5';
    const borderColor = '#0a0a0a';

    const typeTxs = transactions.filter((tx) => tx.TransactionType === TransactionType);
    const totalType = typeTxs.reduce((sum, tx) => sum + tx.Amount, 0);

    const categoryMap = new Map<number, { name: string; amount: number }>();
    typeTxs.forEach((tx) => {
        const id = tx.CategoryID.id;
        const name = tx.CategoryID.Name;
        if (!categoryMap.has(id)) categoryMap.set(id, { name, amount: 0 });
        const entry = categoryMap.get(id)!;
        entry.amount += tx.Amount;
    });

    const allCategories = Array.from(new Set(transactions.map((tx) => tx.CategoryID.id))).map((id) => ({
        id,
        name: transactions.find((tx) => tx.CategoryID.id === id)?.CategoryID.Name || 'Unknown',
    }));
    allCategories.forEach((c) => {
        if (!categoryMap.has(c.id)) categoryMap.set(c.id, { name: c.name, amount: 0 });
    });

    const entries = Array.from(categoryMap.values());
    const labels = entries.map((e) => e.name);
    const data = entries.map((e) => (totalType > 0 ? (e.amount / totalType) * 100 : 0));

    const chartData = {
        labels,
        datasets: [
            {
                label: `% of ${TransactionType.toLowerCase()}`,
                data,
                backgroundColor: fillColor,
                borderColor: borderColor,
                borderWidth: 2,
                borderRadius: 4,
                borderSkipped: false as const,
            },
        ],
    };

    const options = {
        indexAxis: 'y' as const,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: ink,
                titleColor: isDark ? '#0a0a0a' : '#fff',
                bodyColor: isDark ? '#0a0a0a' : '#fff',
                borderColor: ink,
                borderWidth: 2,
                padding: 10,
                cornerRadius: 6,
                titleFont: { weight: 'bold' as const },
                callbacks: {
                    label: (ctx: any) => ` ${ctx.parsed.x.toFixed(1)}%`,
                },
            },
        },
        layout: { padding: { top: 4, bottom: 4 } },
        scales: {
            y: {
                grid: { display: false },
                ticks: { color: ink, font: { weight: 600 as any } },
                border: { color: ink, width: 2 },
            },
            x: {
                grid: { color: gridColor, drawTicks: false },
                ticks: {
                    color: ink,
                    font: { weight: 600 as any },
                    callback: (v: any) => `${v}%`,
                },
                border: { color: ink, width: 2 },
                beginAtZero: true,
            },
        },
    };

    return (
        <div style={{ height: 260 }}>
            <Bar data={chartData} options={options} />
        </div>
    );
};

export default HorizontalBarChart;
