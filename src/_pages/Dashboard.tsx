import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../_utils/axios';
import {
    Box,
    Typography,
    MenuItem,
    FormControl,
    Select,
    InputLabel,
    Card,
    CardContent,
    Grid,
    Stack,
    Skeleton,
    Alert,
    useTheme,
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { Line, Bar } from 'react-chartjs-2';
import {
    Chart,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { DateRange } from '@mui/x-date-pickers-pro/models';
import {
    AccountBalanceWalletRounded,
    TrendingDownRounded,
    TrendingUpRounded,
} from '@mui/icons-material';
import HorizontalBarChart from '../_components/graphs/horizontalBar';
import { Transaction } from './transactionGrid';
import { loginv2 } from '../redux/authSlice';
import { useDispatch } from 'react-redux';

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

export const MoneyFormat = (number: string) =>
    new Intl.NumberFormat('en-IN').format(parseFloat(number?.toString()));

interface Category {
    id: number;
    Name: string;
    Description: string;
    UserID: string;
    TransactionDate: string;
}

interface User {
    username: string;
    email: string;
}

const fetchTransactions = async (): Promise<Transaction[]> => {
    const response = await axiosInstance.get('api/transactions/');
    return response.data;
};

const fetchCategories = async (): Promise<Category[]> => {
    const response = await axiosInstance.get('api/categories/');
    return response.data;
};

const fetchUser = async (): Promise<User> => {
    const response = await axiosInstance.get('/api/user');
    return response.data;
};

interface StatCardProps {
    label: string;
    value: number;
    color: string;
    icon: React.ReactNode;
    accent?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, color, icon }) => (
    <Card sx={{ height: '100%' }}>
        <CardContent sx={{ p: 2.5 }}>
            <Stack direction='row' alignItems='center' spacing={2}>
                <Box
                    sx={(t) => ({
                        width: 56,
                        height: 56,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: color,
                        color: '#0a0a0a',
                        border: `2px solid ${t.palette.divider}`,
                        boxShadow: `3px 3px 0 0 ${t.palette.divider}`,
                        flexShrink: 0,
                    })}
                >
                    {icon}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                    <Typography
                        variant='caption'
                        sx={{
                            fontWeight: 700,
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
                            color: 'text.secondary',
                        }}
                    >
                        {label}
                    </Typography>
                    <Typography variant='h5' sx={{ fontWeight: 800, lineHeight: 1.15, mt: 0.5 }}>
                        ₹ {MoneyFormat((value ?? 0).toString())}
                    </Typography>
                </Box>
            </Stack>
        </CardContent>
    </Card>
);

const DashBoard: React.FC = () => {
    const dispatch = useDispatch();
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const ink = theme.palette.text.primary;
    const gridColor = isDark ? 'rgba(254,246,228,0.12)' : 'rgba(10,10,10,0.1)';

    const chartJsOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    color: ink,
                    font: { weight: 700 as any, size: 12 },
                    boxWidth: 14,
                    boxHeight: 14,
                    padding: 14,
                    usePointStyle: false,
                },
            },
            tooltip: {
                backgroundColor: ink,
                titleColor: isDark ? '#0a0a0a' : '#fff',
                bodyColor: isDark ? '#0a0a0a' : '#fff',
                borderColor: ink,
                borderWidth: 2,
                padding: 10,
                cornerRadius: 6,
                titleFont: { weight: 'bold' as const },
            },
        },
        scales: {
            x: {
                grid: { color: gridColor, drawTicks: false },
                ticks: { color: ink, font: { weight: 600 as any } },
                border: { color: ink, width: 2 },
            },
            y: {
                grid: { color: gridColor, drawTicks: false },
                ticks: { color: ink, font: { weight: 600 as any } },
                border: { color: ink, width: 2 },
                beginAtZero: true,
            },
        },
    };

    const { data: transactions, error: transactionsError, isLoading: isLoadingTransactions } = useQuery<Transaction[]>({
        queryKey: ['transactions'],
        queryFn: fetchTransactions,
    });

    const { data: categories, error: categoriesError, isLoading: isLoadingCategories } = useQuery<Category[]>({
        queryKey: ['categories'],
        queryFn: fetchCategories,
    });

    const { data: user } = useQuery<User, Error>({
        queryKey: ['user'],
        queryFn: fetchUser,
    });

    useEffect(() => {
        dispatch(loginv2({ username: user?.username ?? '' }));
    }, [user, dispatch]);

    const [data, setData] = useState({ income: 0, expense: 0, balance: 0 });

    const incomeDataset = (data: number[]) => ({
        label: 'Income',
        data,
        borderColor: '#0a0a0a',
        backgroundColor: '#bef264',
        pointBackgroundColor: '#bef264',
        pointBorderColor: '#0a0a0a',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 3,
        tension: 0.25,
        fill: false,
    });
    const expenseDataset = (data: number[]) => ({
        label: 'Expense',
        data,
        borderColor: '#0a0a0a',
        backgroundColor: '#fca5a5',
        pointBackgroundColor: '#fca5a5',
        pointBorderColor: '#0a0a0a',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 3,
        tension: 0.25,
        fill: false,
    });

    const [chartData, setChartData] = useState({
        labels: [] as string[],
        datasets: [incomeDataset([]), expenseDataset([])],
    });

    const [dateRange, setDateRange] = useState<DateRange<Dayjs>>([dayjs().startOf('month'), dayjs().endOf('month')]);
    const [chartType, setChartType] = useState<string>('line');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const chartOptions = [
        { value: 'line', label: 'Line Chart' },
        { value: 'bar', label: 'Bar Chart' },
    ];

    const filterTransactions = (txs: Transaction[]) => {
        if (!dateRange[0] && !dateRange[1]) return txs;
        return txs.filter((t) => {
            const td = dayjs(t.TransactionDate);
            if (dateRange[0] && dateRange[1]) return td.isAfter(dateRange[0]) && td.isBefore(dateRange[1]);
            if (dateRange[0]) return td.isAfter(dateRange[0]);
            if (dateRange[1]) return td.isBefore(dateRange[1]);
            return true;
        });
    };

    useEffect(() => {
        if (!transactions) return;
        let filtered = filterTransactions(transactions);
        if (selectedCategory !== 'all') {
            filtered = filtered.filter((t) => t.CategoryID.id === parseInt(selectedCategory));
        }

        let totalIncome = 0;
        let totalExpense = 0;
        const incomeData: Record<string, number> = {};
        const expenseData: Record<string, number> = {};

        filtered.forEach((t) => {
            const date = t.TransactionDate.split('T')[0];
            if (t.TransactionType === 'Income') {
                totalIncome += t.Amount;
                incomeData[date] = (incomeData[date] || 0) + t.Amount;
            } else if (t.TransactionType === 'Expense') {
                totalExpense += t.Amount;
                expenseData[date] = (expenseData[date] || 0) + t.Amount;
            }
        });

        setData({ income: totalIncome, expense: totalExpense, balance: totalIncome - totalExpense });

        const labels = Object.keys({ ...incomeData, ...expenseData }).sort();
        setChartData({
            labels,
            datasets: [
                incomeDataset(labels.map((l) => incomeData[l] || 0)),
                expenseDataset(labels.map((l) => expenseData[l] || 0)),
            ],
        });
    }, [transactions, dateRange, selectedCategory]);

    if (transactionsError || categoriesError) {
        return (
            <Alert severity='error' sx={{ border: 2, borderColor: 'divider' }}>
                Couldn't load your dashboard data. Check that the API is reachable.
            </Alert>
        );
    }

    const isLoading = isLoadingTransactions || isLoadingCategories;

    return (
        <Stack spacing={2.5}>
            {/* Summary cards */}
            <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                    {isLoading ? (
                        <Skeleton variant='rounded' height={108} />
                    ) : (
                        <StatCard
                            label='Income'
                            value={data.income}
                            color='#bef264'
                            icon={<TrendingUpRounded sx={{ fontSize: 32 }} />}
                        />
                    )}
                </Grid>
                <Grid item xs={12} sm={4}>
                    {isLoading ? (
                        <Skeleton variant='rounded' height={108} />
                    ) : (
                        <StatCard
                            label='Expense'
                            value={data.expense}
                            color='#fca5a5'
                            icon={<TrendingDownRounded sx={{ fontSize: 32 }} />}
                        />
                    )}
                </Grid>
                <Grid item xs={12} sm={4}>
                    {isLoading ? (
                        <Skeleton variant='rounded' height={108} />
                    ) : (
                        <StatCard
                            label='Balance'
                            value={data.balance}
                            color={data.balance < 0 ? '#fca5a5' : '#fcd34d'}
                            icon={<AccountBalanceWalletRounded sx={{ fontSize: 32 }} />}
                        />
                    )}
                </Grid>
            </Grid>

            {/* Category breakdowns */}
            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant='subtitle1' sx={{ fontWeight: 800, mb: 1 }}>
                                Income by Category
                            </Typography>
                            {isLoading ? (
                                <Skeleton variant='rounded' height={240} />
                            ) : transactions ? (
                                <HorizontalBarChart transactions={transactions} TransactionType='Income' />
                            ) : (
                                <Typography color='text.secondary'>No transactions available</Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant='subtitle1' sx={{ fontWeight: 800, mb: 1 }}>
                                Expense by Category
                            </Typography>
                            {isLoading ? (
                                <Skeleton variant='rounded' height={240} />
                            ) : transactions ? (
                                <HorizontalBarChart transactions={transactions} TransactionType='Expense' />
                            ) : (
                                <Typography color='text.secondary'>No transactions available</Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Trend over time */}
            <Card>
                <CardContent>
                    <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        spacing={1.5}
                        alignItems={{ xs: 'stretch', md: 'center' }}
                        justifyContent='space-between'
                        sx={{ mb: 2 }}
                    >
                        <Typography variant='subtitle1' sx={{ fontWeight: 800 }}>
                            Income & Expense Over Time
                        </Typography>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DateRangePicker
                                    value={dateRange}
                                    onChange={(v) => setDateRange(v)}
                                    slotProps={{ textField: { size: 'small' } }}
                                />
                            </LocalizationProvider>
                            <FormControl size='small' sx={{ minWidth: 140 }}>
                                <InputLabel id='chart-type-label'>Chart</InputLabel>
                                <Select
                                    labelId='chart-type-label'
                                    value={chartType}
                                    label='Chart'
                                    onChange={(e: SelectChangeEvent) => setChartType(e.target.value)}
                                >
                                    {chartOptions.map((o) => (
                                        <MenuItem key={o.value} value={o.value}>
                                            {o.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl size='small' sx={{ minWidth: 160 }}>
                                <InputLabel id='category-label'>Category</InputLabel>
                                <Select
                                    labelId='category-label'
                                    value={selectedCategory}
                                    label='Category'
                                    onChange={(e: SelectChangeEvent) => setSelectedCategory(e.target.value)}
                                >
                                    <MenuItem value='all'>All categories</MenuItem>
                                    {Array.isArray(categories)
                                        ? categories.map((c) => (
                                              <MenuItem key={c.id} value={c.id.toString()}>
                                                  {c.Name}
                                              </MenuItem>
                                          ))
                                        : null}
                                </Select>
                            </FormControl>
                        </Stack>
                    </Stack>
                    <Box sx={{ height: 320 }}>
                        {isLoading ? (
                            <Skeleton variant='rounded' height={320} />
                        ) : chartType === 'line' ? (
                            <Line data={chartData} options={chartJsOptions} />
                        ) : (
                            <Bar data={chartData} options={chartJsOptions} />
                        )}
                    </Box>
                </CardContent>
            </Card>
        </Stack>
    );
};

export default DashBoard;
