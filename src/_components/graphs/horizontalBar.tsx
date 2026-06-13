import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { Box, Typography, useTheme } from '@mui/material';
import { Transaction } from '../../_pages/transactionGrid';
import { aggregateByCategory, formatInr } from '../../_utils/dashboardCharts';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface Props {
    transactions: Transaction[];
    TransactionType: 'Income' | 'Expense';
}

const HorizontalBarChart: React.FC<Props> = ({ transactions, TransactionType }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const ink = theme.palette.text.primary;
    const gridColor = isDark ? 'rgba(254,246,228,0.12)' : 'rgba(10,10,10,0.1)';

    const isIncome = TransactionType === 'Income';
    const fillColor = isIncome ? '#bef264' : '#fca5a5';
    const borderColor = '#0a0a0a';

    const entries = useMemo(
        () => aggregateByCategory(transactions, TransactionType),
        [transactions, TransactionType],
    );

    const totalType = useMemo(
        () => entries.reduce((s, e) => s + e.amount, 0),
        [entries],
    );

    if (entries.length === 0) {
        return (
            <Box
                sx={(t) => ({
                    height: 260,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `2px dashed ${t.palette.divider}`,
                    borderRadius: 2,
                })}
            >
                <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 600 }}>
                    No {TransactionType.toLowerCase()} in this period
                </Typography>
            </Box>
        );
    }

    const chartData = {
        labels: entries.map((e) => e.name),
        datasets: [
            {
                label: TransactionType,
                data: entries.map((e) => e.amount),
                backgroundColor: fillColor,
                borderColor,
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
                    label: (ctx: { parsed: { x: number } }) => {
                        const amount = ctx.parsed.x || 0;
                        const pct = totalType > 0 ? ((amount / totalType) * 100).toFixed(1) : '0';
                        return ` ${formatInr(amount)} (${pct}%)`;
                    },
                },
            },
        },
        layout: { padding: { top: 4, bottom: 4, right: 8 } },
        scales: {
            y: {
                grid: { display: false },
                ticks: { color: ink, font: { weight: 600 as const, size: 11 } },
                border: { color: ink, width: 2 },
            },
            x: {
                grid: { color: gridColor, drawTicks: false },
                ticks: {
                    color: ink,
                    font: { weight: 600 as const, size: 11 },
                    callback: (v: string | number) => formatInr(Number(v)),
                },
                border: { color: ink, width: 2 },
                beginAtZero: true,
            },
        },
    };

    return (
        <div style={{ height: Math.max(160, entries.length * 44) }}>
            <Bar data={chartData} options={options} />
        </div>
    );
};

export default HorizontalBarChart;
