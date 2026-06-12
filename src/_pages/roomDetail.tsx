import React, { useEffect, useState, useCallback } from 'react';
import {
    Alert,
    Avatar,
    AvatarGroup,
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
    Tooltip,
    Typography,
    CircularProgress,
} from '@mui/material';
import {
    AddRounded,
    ArrowBackRounded,
    ArrowForwardRounded,
    ContentCopyRounded,
    DeleteRounded,
    GroupRounded,
    LinkRounded,
    TaskAltRounded,
    AccountBalanceWalletRounded,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '../redux/store';
import {
    apiGetRoom,
    apiListExpenses,
    apiDeleteExpense,
    apiLeaveRoom,
    APIRoom,
    APIRoomExpense,
} from '../_utils/roomsAPI';
import { settleUp, SettleTransfer, computeBalancesFromExpenses } from '../_utils/roomsMath';
import { getApiErrorMessage } from '../_utils/roomsAPI';
import { bumpRoomData, forgetJoinedRoom } from '../redux/roomSlice';
import { AddRoomExpenseModal } from '../_components/modals/roomModals';
import { showErrorSnackbar, showSuccessSnackbar } from '../_components/snackbar/Snackbar';

const MoneyFormat = (n: number) =>
    `₹ ${new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)}`;

const formatDate = (s: string) => {
    const d = new Date(s);
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
};

const RoomDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const username = useSelector((s: RootState) => s.auth.username);

    const [room, setRoom] = useState<APIRoom | null>(null);
    const [expenses, setExpenses] = useState<APIRoomExpense[]>([]);
    const [loading, setLoading] = useState(true);
    const [addOpen, setAddOpen] = useState(false);

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
            showErrorSnackbar(getApiErrorMessage(err, 'Failed to load room'));
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) {
        return (
            <Card>
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <CircularProgress />
                </CardContent>
            </Card>
        );
    }

    if (!id || !room) {
        return (
            <Card>
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant='h6' sx={{ fontWeight: 800, mb: 1 }}>
                        Room not found
                    </Typography>
                    <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                        It may have been deleted or you may not be a member.
                    </Typography>
                    <Button
                        variant='contained'
                        color='primary'
                        startIcon={<ArrowBackRounded />}
                        onClick={() => navigate('/rooms')}
                    >
                        Back to rooms
                    </Button>
                </CardContent>
            </Card>
        );
    }

    const currentUsername = username ?? room.members[0]?.username ?? '';

    const computedBalances = computeBalancesFromExpenses(expenses, room.members);
    const balanceMap: Record<string, number> = {};
    computedBalances.forEach((b) => {
        balanceMap[b.username] = b.net;
    });
    const transfers: SettleTransfer[] = settleUp(balanceMap);
    const totalSpent =
        Math.round(expenses.reduce((s, e) => s + e.amount, 0) * 100) / 100;

    const handleCopy = () => {
        navigator.clipboard.writeText(room.room_code);
        showSuccessSnackbar(`Room code copied: ${room.room_code}`);
    };

    const handleCopyInvite = () => {
        const link = `${window.location.origin}/rooms?invite=${room.room_code}`;
        navigator.clipboard.writeText(link);
        showSuccessSnackbar('Invite link copied — share it to add others');
    };

    const handleRemoveExpense = async (expenseId: number) => {
        try {
            await apiDeleteExpense(room.room_code, expenseId);
            showSuccessSnackbar('Expense removed');
            fetchData();
        } catch (err) {
            showErrorSnackbar(getApiErrorMessage(err, 'Failed to remove expense'));
        }
    };

    const handleLeave = async () => {
        try {
            await apiLeaveRoom(room.room_code);
            dispatch(forgetJoinedRoom(room.room_code));
            navigate('/rooms');
        } catch (err) {
            showErrorSnackbar(getApiErrorMessage(err, 'Failed to leave room'));
        }
    };

    const handleExpenseAdded = () => {
        dispatch(bumpRoomData());
        fetchData();
    };

    return (
        <Stack spacing={2.5}>
            {/* Header card */}
            <Card>
                <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                    <Stack direction='row' alignItems='flex-start' spacing={1} sx={{ mb: 1.5 }}>
                        <IconButton onClick={() => navigate('/rooms')} size='small' sx={{ width: 36, height: 36 }}>
                            <ArrowBackRounded fontSize='small' />
                        </IconButton>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant='h5' sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                                {room.name}
                            </Typography>
                            <Stack direction='row' alignItems='center' spacing={0.5} sx={{ mt: 0.75 }}>
                                <Chip
                                    label={room.room_code}
                                    size='small'
                                    sx={{ fontFamily: 'monospace', letterSpacing: '0.06em' }}
                                />
                                <Tooltip title='Copy code — share with others to invite'>
                                    <IconButton size='small' onClick={handleCopy} sx={{ width: 28, height: 28 }}>
                                        <ContentCopyRounded sx={{ fontSize: 14 }} />
                                    </IconButton>
                                </Tooltip>
                            </Stack>
                        </Box>
                        <Stack direction='row' spacing={1} sx={{ flexShrink: 0, flexWrap: 'wrap' }}>
                            <Button
                                variant='contained'
                                color='secondary'
                                startIcon={<AccountBalanceWalletRounded />}
                                onClick={() => navigate(`/rooms/${room.room_code}/settlement`)}
                            >
                                My balance
                            </Button>
                            <Button
                                variant='outlined'
                                startIcon={<LinkRounded />}
                                onClick={handleCopyInvite}
                            >
                                Invite
                            </Button>
                            <Button variant='outlined' onClick={handleLeave}>
                                Leave
                            </Button>
                            <Button
                                variant='contained'
                                color='primary'
                                startIcon={<AddRounded />}
                                onClick={() => setAddOpen(true)}
                            >
                                Add expense
                            </Button>
                        </Stack>
                    </Stack>

                    <Divider sx={{ my: 1.5 }} />

                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={{ xs: 1.5, sm: 4 }}
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                    >
                        <Stack direction='row' alignItems='center' spacing={1.5}>
                            <GroupRounded fontSize='small' />
                            <Box>
                                <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                    Members
                                </Typography>
                                <Stack direction='row' alignItems='center' spacing={1}>
                                    <AvatarGroup max={6} sx={{ '& .MuiAvatar-root': { width: 30, height: 30, fontSize: 12 } }}>
                                        {room.members.map((m) => (
                                            <Avatar key={m.id}>{m.username.charAt(0).toUpperCase()}</Avatar>
                                        ))}
                                    </AvatarGroup>
                                    <Typography variant='body2' sx={{ fontWeight: 600 }}>
                                        {room.member_count}
                                    </Typography>
                                </Stack>
                            </Box>
                        </Stack>
                        <Box>
                            <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                Total spent
                            </Typography>
                            <Typography variant='h6' sx={{ fontWeight: 800 }}>
                                {MoneyFormat(totalSpent)}
                            </Typography>
                        </Box>
                        <Box>
                            <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                You are
                            </Typography>
                            <Typography variant='h6' sx={{ fontWeight: 800 }}>
                                {currentUsername}
                            </Typography>
                        </Box>
                    </Stack>
                </CardContent>
            </Card>

            <Grid container spacing={2.5}>
                {/* Balances */}
                <Grid item xs={12} md={5}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant='subtitle1' sx={{ fontWeight: 800, mb: 1.5 }}>
                                Net balances
                            </Typography>
                            <Stack spacing={1}>
                                {room.members.map((m) => {
                                    const bal = balanceMap[m.username] ?? 0;
                                    const positive = bal >= 0.01;
                                    const negative = bal <= -0.01;
                                    return (
                                        <Stack
                                            key={m.id}
                                            direction='row'
                                            alignItems='center'
                                            justifyContent='space-between'
                                            sx={(t) => ({
                                                p: 1.25,
                                                border: `2px solid ${t.palette.divider}`,
                                                borderRadius: 1.5,
                                                backgroundColor: positive
                                                    ? '#bef26433'
                                                    : negative
                                                    ? '#fca5a533'
                                                    : 'transparent',
                                            })}
                                        >
                                            <Stack direction='row' alignItems='center' spacing={1.25}>
                                                <Avatar sx={{ width: 30, height: 30, fontSize: 12 }}>
                                                    {m.username.charAt(0).toUpperCase()}
                                                </Avatar>
                                                <Typography sx={{ fontWeight: 700 }}>
                                                    {m.username}
                                                    {m.username === currentUsername && (
                                                        <Typography component='span' variant='caption' color='text.secondary' sx={{ ml: 0.5, fontWeight: 600 }}>
                                                            (you)
                                                        </Typography>
                                                    )}
                                                </Typography>
                                            </Stack>
                                            <Typography
                                                sx={{
                                                    fontWeight: 800,
                                                    color: positive ? 'success.dark' : negative ? 'error.main' : 'text.secondary',
                                                }}
                                            >
                                                {positive ? '+' : ''}
                                                {MoneyFormat(bal)}
                                            </Typography>
                                        </Stack>
                                    );
                                })}
                            </Stack>

                            <Divider sx={{ my: 2 }} />
                            <Stack direction='row' alignItems='center' spacing={1} sx={{ mb: 1.5 }}>
                                <TaskAltRounded fontSize='small' />
                                <Typography variant='subtitle1' sx={{ fontWeight: 800 }}>
                                    Settle up
                                </Typography>
                            </Stack>
                            {transfers.length === 0 ? (
                                <Alert severity='success' sx={{ fontWeight: 600 }}>
                                    All settled! Nobody owes anyone.
                                </Alert>
                            ) : (
                                <Stack spacing={1}>
                                    {transfers.map((t, i) => (
                                        <Stack
                                            key={i}
                                            direction='row'
                                            alignItems='center'
                                            spacing={1}
                                            sx={(theme) => ({
                                                p: 1.25,
                                                border: `2px solid ${theme.palette.divider}`,
                                                borderRadius: 1.5,
                                                backgroundColor: '#fcd34d22',
                                            })}
                                        >
                                            <Avatar sx={{ width: 28, height: 28, fontSize: 12, backgroundColor: '#fca5a5' }}>
                                                {t.from.charAt(0).toUpperCase()}
                                            </Avatar>
                                            <Typography sx={{ fontWeight: 700 }}>{t.from}</Typography>
                                            <ArrowForwardRounded fontSize='small' />
                                            <Avatar sx={{ width: 28, height: 28, fontSize: 12, backgroundColor: '#bef264' }}>
                                                {t.to.charAt(0).toUpperCase()}
                                            </Avatar>
                                            <Typography sx={{ fontWeight: 700, flex: 1 }}>{t.to}</Typography>
                                            <Chip
                                                label={MoneyFormat(t.amount)}
                                                color='primary'
                                                sx={{ fontWeight: 800 }}
                                            />
                                        </Stack>
                                    ))}
                                </Stack>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Expenses */}
                <Grid item xs={12} md={7}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Stack direction='row' alignItems='center' justifyContent='space-between' sx={{ mb: 1.5 }}>
                                <Typography variant='subtitle1' sx={{ fontWeight: 800 }}>
                                    Expenses
                                </Typography>
                                <Chip
                                    label={`${expenses.length} total`}
                                    size='small'
                                    sx={{ fontWeight: 700 }}
                                />
                            </Stack>

                            {expenses.length === 0 ? (
                                <Box
                                    sx={(t) => ({
                                        textAlign: 'center',
                                        py: 5,
                                        px: 2,
                                        border: `2px dashed ${t.palette.divider}`,
                                        borderRadius: 2,
                                    })}
                                >
                                    <Typography variant='subtitle1' sx={{ fontWeight: 800, mb: 0.5 }}>
                                        No expenses yet
                                    </Typography>
                                    <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                                        Add the first expense to start tracking.
                                    </Typography>
                                    <Button
                                        variant='contained'
                                        color='primary'
                                        startIcon={<AddRounded />}
                                        onClick={() => setAddOpen(true)}
                                    >
                                        Add expense
                                    </Button>
                                </Box>
                            ) : (
                                <TableContainer
                                    sx={(t) => ({
                                        border: `2px solid ${t.palette.divider}`,
                                        borderRadius: 2,
                                        boxShadow: `3px 3px 0 0 ${t.palette.divider}`,
                                        overflow: 'hidden',
                                    })}
                                >
                                    <Table size='small'>
                                        <TableHead>
                                            <TableRow sx={{ backgroundColor: '#fcd34d' }}>
                                                <TableCell sx={{ fontWeight: 800, color: '#0a0a0a' }}>Description</TableCell>
                                                <TableCell sx={{ fontWeight: 800, color: '#0a0a0a' }}>Paid by</TableCell>
                                                <TableCell sx={{ fontWeight: 800, color: '#0a0a0a' }}>Split</TableCell>
                                                <TableCell align='right' sx={{ fontWeight: 800, color: '#0a0a0a' }}>Amount</TableCell>
                                                <TableCell sx={{ fontWeight: 800, color: '#0a0a0a' }}></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {expenses.map((e) => (
                                                <TableRow key={e.id} hover>
                                                    <TableCell>
                                                        <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
                                                            {e.description}
                                                        </Typography>
                                                        <Typography variant='caption' color='text.secondary'>
                                                            {formatDate(e.created_at)}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Stack direction='row' alignItems='center' spacing={0.75}>
                                                            <Avatar sx={{ width: 24, height: 24, fontSize: 11 }}>
                                                                {e.paid_by_username.charAt(0).toUpperCase()}
                                                            </Avatar>
                                                            <Typography sx={{ fontWeight: 600, fontSize: 13 }}>
                                                                {e.paid_by_username}
                                                            </Typography>
                                                        </Stack>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant='caption' sx={{ fontWeight: 600 }}>
                                                            {e.shares.length} share{e.shares.length === 1 ? '' : 's'}
                                                        </Typography>
                                                        <Stack spacing={0.25} sx={{ mt: 0.25 }}>
                                                            {e.shares.map((s) => (
                                                                <Typography key={s.user_id} variant='caption' color='text.secondary'>
                                                                    {s.username}: {MoneyFormat(s.share_amount)}
                                                                </Typography>
                                                            ))}
                                                        </Stack>
                                                    </TableCell>
                                                    <TableCell align='right'>
                                                        <Typography sx={{ fontWeight: 800 }}>
                                                            {MoneyFormat(e.amount)}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align='right'>
                                                        <Tooltip title='Delete'>
                                                            <IconButton
                                                                size='small'
                                                                onClick={() => handleRemoveExpense(e.id)}
                                                                sx={{ width: 28, height: 28, color: '#ef4444' }}
                                                            >
                                                                <DeleteRounded sx={{ fontSize: 16 }} />
                                                            </IconButton>
                                                        </Tooltip>
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

            <AddRoomExpenseModal
                open={addOpen}
                onClose={() => setAddOpen(false)}
                room={room}
                currentUsername={currentUsername}
                onAdded={handleExpenseAdded}
            />
        </Stack>
    );
};

export default RoomDetailPage;
