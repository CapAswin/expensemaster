import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    Grid,
    IconButton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    CircularProgress,
} from '@mui/material';
import {
    ArrowBackRounded,
    ArrowForwardRounded,
    AccountBalanceWalletRounded,
    HistoryRounded,
    PaymentsRounded,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { RootState } from '../redux/store';
import {
    apiGetRoom,
    apiListExpenses,
    APIRoom,
    APIRoomExpense,
    getApiErrorMessage,
} from '../_utils/roomsAPI';
import {
    settleUp,
    getUserSettlementSummary,
    getPaymentsYouOwe,
    getPaymentsYouReceive,
    buildUserExpenseHistory,
    computeBalancesFromExpenses,
    sumHistoryShares,
} from '../_utils/roomsMath';
import { showErrorSnackbar } from '../_components/snackbar/Snackbar';

const MoneyFormat = (n: number) =>
    `₹ ${new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)}`;

const formatDateTime = (s: string) => {
    const d = new Date(s);
    return d.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const RoomSettlementPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const username = useSelector((s: RootState) => s.auth.username);

    const [room, setRoom] = useState<APIRoom | null>(null);
    const [expenses, setExpenses] = useState<APIRoomExpense[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const [roomData, expensesData] = await Promise.all([
                apiGetRoom(id),
                apiListExpenses(id),
            ]);
            setRoom(roomData);
            setExpenses(expensesData);
        } catch (err) {
            setRoom(null);
            setExpenses([]);
            showErrorSnackbar(getApiErrorMessage(err, 'Failed to load settlement data'));
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const currentMember = useMemo(
        () => room?.members.find((m) => m.username === username),
        [room, username],
    );

    const computedBalances = useMemo(() => {
        if (!room) return [];
        return computeBalancesFromExpenses(expenses, room.members);
    }, [expenses, room]);

    const summary = useMemo(() => {
        if (!currentMember) return null;
        return getUserSettlementSummary(computedBalances, currentMember.id);
    }, [computedBalances, currentMember]);

    const balanceMap = useMemo(() => {
        const map: Record<string, number> = {};
        computedBalances.forEach((b) => {
            map[b.username] = b.net;
        });
        return map;
    }, [computedBalances]);

    const transfers = useMemo(() => settleUp(balanceMap), [balanceMap]);
    const youOweList = useMemo(
        () => (username ? getPaymentsYouOwe(username, transfers) : []),
        [username, transfers],
    );
    const youReceiveList = useMemo(
        () => (username ? getPaymentsYouReceive(username, transfers) : []),
        [username, transfers],
    );

    const history = useMemo(() => {
        if (!currentMember) return [];
        return buildUserExpenseHistory(expenses, currentMember.id);
    }, [expenses, currentMember]);

    const historyShareTotal = useMemo(() => sumHistoryShares(history), [history]);

    if (loading) {
        return (
            <Card>
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <CircularProgress />
                </CardContent>
            </Card>
        );
    }

    if (!id || !room || !username || !summary) {
        return (
            <Card>
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant='h6' sx={{ fontWeight: 800, mb: 1 }}>
                        Could not load your balance
                    </Typography>
                    <Button
                        variant='contained'
                        startIcon={<ArrowBackRounded />}
                        onClick={() => navigate(id ? `/rooms/${id}` : '/rooms')}
                    >
                        Back to room
                    </Button>
                </CardContent>
            </Card>
        );
    }

    const statusColor =
        summary.status === 'owe' ? '#fca5a5' : summary.status === 'owed' ? '#bef264' : '#7dd3fc';

    return (
        <Stack spacing={2.5}>
            <Stack direction='row' alignItems='center' spacing={1}>
                <IconButton onClick={() => navigate(`/rooms/${room.room_code}`)} size='small'>
                    <ArrowBackRounded fontSize='small' />
                </IconButton>
                <Box>
                    <Typography variant='h5' sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                        My balance & history
                    </Typography>
                    <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 600 }}>
                        {room.name} · {room.room_code}
                    </Typography>
                </Box>
            </Stack>

            {/* Amount to pay / receive */}
            <Card sx={{ border: '2px solid', borderColor: 'divider', overflow: 'hidden' }}>
                <Box sx={{ backgroundColor: statusColor, px: 2.5, py: 1.5, borderBottom: '2px solid #0a0a0a' }}>
                    <Stack direction='row' alignItems='center' spacing={1}>
                        <AccountBalanceWalletRounded />
                        <Typography variant='h6' sx={{ fontWeight: 800, color: '#0a0a0a' }}>
                            Your settlement summary
                        </Typography>
                    </Stack>
                </Box>
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                            <Typography variant='caption' sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                                Your share (total)
                            </Typography>
                            <Typography variant='h4' sx={{ fontWeight: 800 }}>
                                {MoneyFormat(summary.owed)}
                            </Typography>
                            <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 600 }}>
                                Sum of your splits in history: {MoneyFormat(historyShareTotal)}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Typography variant='caption' sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                                You paid upfront
                            </Typography>
                            <Typography variant='h4' sx={{ fontWeight: 800 }}>
                                {MoneyFormat(summary.paid)}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Typography variant='caption' sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                                Still to settle
                            </Typography>
                            {summary.status === 'owe' ? (
                                <Typography variant='h4' sx={{ fontWeight: 800, color: 'error.main' }}>
                                    Pay {MoneyFormat(summary.amountToPay)}
                                </Typography>
                            ) : summary.status === 'owed' ? (
                                <Typography variant='h4' sx={{ fontWeight: 800, color: 'success.dark' }}>
                                    Get {MoneyFormat(summary.amountToReceive)}
                                </Typography>
                            ) : (
                                <Typography variant='h4' sx={{ fontWeight: 800, color: 'text.secondary' }}>
                                    {MoneyFormat(0)}
                                </Typography>
                            )}
                            <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 600 }}>
                                Formula: |paid − share| = {MoneyFormat(Math.abs(summary.net))}
                            </Typography>
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 2 }} />

                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            {summary.status === 'settled' ? (
                                <Alert severity='success' sx={{ fontWeight: 600 }}>
                                    Settled. Your share ({MoneyFormat(summary.owed)}) matches what you paid (
                                    {MoneyFormat(summary.paid)}).
                                </Alert>
                            ) : summary.status === 'owe' ? (
                                <Alert severity='warning' sx={{ fontWeight: 600 }}>
                                    Your share is {MoneyFormat(summary.owed)} but you only paid{' '}
                                    {MoneyFormat(summary.paid)}. Pay {MoneyFormat(summary.amountToPay)} to balance
                                    with the group (see who below).
                                </Alert>
                            ) : (
                                <Alert severity='info' sx={{ fontWeight: 600 }}>
                                    You paid {MoneyFormat(summary.paid)} upfront; your share is only{' '}
                                    {MoneyFormat(summary.owed)}. Others should pay you{' '}
                                    {MoneyFormat(summary.amountToReceive)}.
                                </Alert>
                            )}
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Grid container spacing={2.5}>
                {/* Who to pay */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Stack direction='row' alignItems='center' spacing={1} sx={{ mb: 1.5 }}>
                                <PaymentsRounded fontSize='small' />
                                <Typography variant='subtitle1' sx={{ fontWeight: 800 }}>
                                    Who you should pay
                                </Typography>
                            </Stack>
                            {youOweList.length === 0 ? (
                                <Alert severity={summary.amountToPay > 0.01 ? 'warning' : 'success'} sx={{ fontWeight: 600 }}>
                                    {summary.amountToPay > 0.01
                                        ? `You still owe ${MoneyFormat(summary.amountToPay)} to the group. Add more expenses or ask members to settle with you directly.`
                                        : 'You do not owe anyone in this room.'}
                                </Alert>
                            ) : (
                                <Stack spacing={1}>
                                    {youOweList.map((t, i) => (
                                        <Stack
                                            key={i}
                                            direction='row'
                                            alignItems='center'
                                            spacing={1}
                                            sx={(theme) => ({
                                                p: 1.25,
                                                border: `2px solid ${theme.palette.divider}`,
                                                borderRadius: 1.5,
                                                backgroundColor: '#fca5a522',
                                            })}
                                        >
                                            <Typography sx={{ fontWeight: 700 }}>Pay</Typography>
                                            <Typography sx={{ fontWeight: 800, flex: 1 }}>{t.to}</Typography>
                                            <Chip label={MoneyFormat(t.amount)} color='error' sx={{ fontWeight: 800 }} />
                                        </Stack>
                                    ))}
                                </Stack>
                            )}

                            {youReceiveList.length > 0 && (
                                <>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant='subtitle2' sx={{ fontWeight: 800, mb: 1 }}>
                                        Who should pay you
                                    </Typography>
                                    <Stack spacing={1}>
                                        {youReceiveList.map((t, i) => (
                                            <Stack
                                                key={i}
                                                direction='row'
                                                alignItems='center'
                                                spacing={1}
                                                sx={(theme) => ({
                                                    p: 1.25,
                                                    border: `2px solid ${theme.palette.divider}`,
                                                    borderRadius: 1.5,
                                                    backgroundColor: '#bef26422',
                                                })}
                                            >
                                                <Typography sx={{ fontWeight: 700 }}>{t.from}</Typography>
                                                <ArrowForwardRounded fontSize='small' />
                                                <Typography sx={{ fontWeight: 800, flex: 1 }}>you</Typography>
                                                <Chip
                                                    label={MoneyFormat(t.amount)}
                                                    color='success'
                                                    sx={{ fontWeight: 800 }}
                                                />
                                            </Stack>
                                        ))}
                                    </Stack>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Personal history */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Stack direction='row' alignItems='center' justifyContent='space-between' sx={{ mb: 1.5 }}>
                                <Stack direction='row' alignItems='center' spacing={1}>
                                    <HistoryRounded fontSize='small' />
                                    <Typography variant='subtitle1' sx={{ fontWeight: 800 }}>
                                        Your expense history
                                    </Typography>
                                </Stack>
                                <Chip label={`${history.length} entries`} size='small' sx={{ fontWeight: 700 }} />
                            </Stack>

                            {history.length === 0 ? (
                                <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 600 }}>
                                    No expenses involving you yet in this room.
                                </Typography>
                            ) : (
                                <TableContainer
                                    sx={(t) => ({
                                        border: `2px solid ${t.palette.divider}`,
                                        borderRadius: 2,
                                        maxHeight: 420,
                                    })}
                                >
                                    <Table size='small' stickyHeader>
                                        <TableHead>
                                            <TableRow sx={{ backgroundColor: '#c4b5fd' }}>
                                                <TableCell sx={{ fontWeight: 800 }}>Date</TableCell>
                                                <TableCell sx={{ fontWeight: 800 }}>Description</TableCell>
                                                <TableCell sx={{ fontWeight: 800 }}>Paid by</TableCell>
                                                <TableCell align='right' sx={{ fontWeight: 800 }}>
                                                    Your share
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {history.map((row) => (
                                                <TableRow key={row.expenseId} hover>
                                                    <TableCell>
                                                        <Typography variant='caption' sx={{ fontWeight: 600 }}>
                                                            {formatDateTime(row.date)}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography sx={{ fontWeight: 700, fontSize: 13 }}>
                                                            {row.description}
                                                        </Typography>
                                                        {row.youPaid && (
                                                            <Chip
                                                                label='You paid'
                                                                size='small'
                                                                sx={{ mt: 0.5, height: 20, fontWeight: 700 }}
                                                            />
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant='body2' sx={{ fontWeight: 600 }}>
                                                            {row.paidByUsername}
                                                        </Typography>
                                                        <Typography variant='caption' color='text.secondary'>
                                                            Total {MoneyFormat(row.totalAmount)}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align='right'>
                                                        <Typography sx={{ fontWeight: 800, color: 'error.main' }}>
                                                            {MoneyFormat(row.yourShare)}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Stack direction='row' spacing={1.5} justifyContent='flex-end'>
                <Button variant='outlined' onClick={() => navigate(`/rooms/${room.room_code}`)}>
                    Back to room overview
                </Button>
            </Stack>
        </Stack>
    );
};

export default RoomSettlementPage;
