import React, { useMemo, useState } from 'react';
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
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '../redux/store';
import {
    buildInviteLink,
    computeBalances,
    getRoom,
    removeExpense,
    settleUp,
} from '../_utils/roomsStore';
import { bumpRoomData, forgetJoinedRoom } from '../redux/roomSlice';
import { AddRoomExpenseModal } from '../_components/modals/roomModals';
import { showSuccessSnackbar } from '../_components/snackbar/Snackbar';

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

    // re-read on bump so we get latest after expense changes
    const bump = useSelector((s: RootState) => s.room.bump);
    const joined = useSelector((s: RootState) =>
        s.room.joinedRooms.find((j) => j.roomId === id),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `bump` is the re-read trigger after mutations
    const room = useMemo(() => (id ? getRoom(id) : undefined), [id, bump]);

    const [addOpen, setAddOpen] = useState(false);

    if (!id || !room) {
        return (
            <Card>
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant='h6' sx={{ fontWeight: 800, mb: 1 }}>
                        Room not found
                    </Typography>
                    <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                        It may have been deleted on this device.
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

    const currentMember = joined?.memberName ?? room.members[0]?.name ?? '';
    const balances = computeBalances(room);
    const transfers = settleUp(balances);
    const totalSpent = room.expenses.reduce((s, e) => s + e.amount, 0);

    const handleCopy = () => {
        navigator.clipboard.writeText(room.id);
        showSuccessSnackbar(`Room ID copied: ${room.id}`);
    };

    const handleCopyInvite = () => {
        navigator.clipboard.writeText(buildInviteLink(room));
        showSuccessSnackbar('Invite link copied — share it to add others');
    };

    const handleRemoveExpense = (expenseId: string) => {
        removeExpense(room.id, expenseId);
        dispatch(bumpRoomData());
        showSuccessSnackbar('Expense removed');
    };

    const handleLeave = () => {
        dispatch(forgetJoinedRoom(room.id));
        navigate('/rooms');
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
                                    label={room.id}
                                    size='small'
                                    sx={{ fontFamily: 'monospace', letterSpacing: '0.06em' }}
                                />
                                <Tooltip title='Copy ID — share with others to invite'>
                                    <IconButton size='small' onClick={handleCopy} sx={{ width: 28, height: 28 }}>
                                        <ContentCopyRounded sx={{ fontSize: 14 }} />
                                    </IconButton>
                                </Tooltip>
                            </Stack>
                        </Box>
                        <Stack direction='row' spacing={1} sx={{ flexShrink: 0 }}>
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
                                            <Avatar key={m.name}>{m.name.charAt(0).toUpperCase()}</Avatar>
                                        ))}
                                    </AvatarGroup>
                                    <Typography variant='body2' sx={{ fontWeight: 600 }}>
                                        {room.members.length}
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
                                {currentMember}
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
                                    const bal = balances[m.name] ?? 0;
                                    const positive = bal >= 0.01;
                                    const negative = bal <= -0.01;
                                    return (
                                        <Stack
                                            key={m.name}
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
                                                    {m.name.charAt(0).toUpperCase()}
                                                </Avatar>
                                                <Typography sx={{ fontWeight: 700 }}>
                                                    {m.name}
                                                    {m.name === currentMember && (
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
                                    label={`${room.expenses.length} total`}
                                    size='small'
                                    sx={{ fontWeight: 700 }}
                                />
                            </Stack>

                            {room.expenses.length === 0 ? (
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
                                            {room.expenses.map((e) => (
                                                <TableRow key={e.id} hover>
                                                    <TableCell>
                                                        <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
                                                            {e.description}
                                                        </Typography>
                                                        <Typography variant='caption' color='text.secondary'>
                                                            {formatDate(e.date)}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Stack direction='row' alignItems='center' spacing={0.75}>
                                                            <Avatar sx={{ width: 24, height: 24, fontSize: 11 }}>
                                                                {e.paidBy.charAt(0).toUpperCase()}
                                                            </Avatar>
                                                            <Typography sx={{ fontWeight: 600, fontSize: 13 }}>
                                                                {e.paidBy}
                                                            </Typography>
                                                        </Stack>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant='caption' sx={{ fontWeight: 600 }}>
                                                            {e.splitMode === 'equal' ? 'Equal' : 'Exact'} · {e.splitAmong.length}
                                                        </Typography>
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
                currentMember={currentMember}
                onAdded={() => dispatch(bumpRoomData())}
            />
        </Stack>
    );
};

export default RoomDetailPage;
