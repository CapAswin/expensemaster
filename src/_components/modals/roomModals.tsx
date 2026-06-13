import React, { useEffect, useMemo, useState } from 'react';
import {
    Box,
    Button,
    Card,
    Divider,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Modal,
    Select,
    Stack,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
    Alert,
    Checkbox,
    FormControlLabel,
    CircularProgress,
} from '@mui/material';
import { CloseRounded } from '@mui/icons-material';
import {
    apiCreateRoom,
    apiJoinRoom,
    apiAddExpense,
    APIRoom,
    getApiErrorMessage,
} from '../../_utils/roomsAPI';
import { showErrorSnackbar, showSuccessSnackbar } from '../snackbar/Snackbar';

const headerSx = (color: string) => ({
    px: 2.5,
    py: 1.5,
    backgroundColor: color,
    borderBottom: '2px solid #0a0a0a',
});

const closeBtnSx = {
    bgcolor: '#fff',
    color: '#0a0a0a',
    border: '2px solid #0a0a0a',
    boxShadow: '2px 2px 0 0 #0a0a0a',
    '&:hover': { bgcolor: '#ef4444', color: '#fff' },
} as const;

const wrapperSx = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: 'calc(100% - 32px)', sm: 480 },
    maxWidth: '100%',
    maxHeight: '90vh',
    overflow: 'auto' as const,
};

// ---------------- Create Room ----------------

interface CreateRoomModalProps {
    open: boolean;
    onClose: () => void;
    onCreated: (room: APIRoom) => void;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
    open,
    onClose,
    onCreated,
}) => {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            setName('');
            setPassword('');
            setLoading(false);
        }
    }, [open]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return showErrorSnackbar('Enter a room name');
        if (password.length < 4) return showErrorSnackbar('Password must be at least 4 characters');
        setLoading(true);
        try {
            const room = await apiCreateRoom({ name: name.trim(), password });
            showSuccessSnackbar(`Room "${room.name}" created!`);
            onCreated(room);
            onClose();
        } catch (err) {
            showErrorSnackbar(getApiErrorMessage(err, 'Failed to create room'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={wrapperSx}>
                <Card sx={{ p: 0 }}>
                    <Stack direction='row' justifyContent='space-between' alignItems='center' sx={headerSx('#fcd34d')}>
                        <Typography variant='h6' sx={{ fontWeight: 800, color: '#0a0a0a' }}>
                            Create a Room
                        </Typography>
                        <IconButton onClick={onClose} size='small' sx={closeBtnSx}>
                            <CloseRounded fontSize='small' />
                        </IconButton>
                    </Stack>
                    <Box component='form' onSubmit={handleCreate} sx={{ p: 2.5 }}>
                        <Stack spacing={2}>
                            <TextField
                                label='Room name'
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder='e.g. Goa Trip 2026'
                                fullWidth
                                required
                            />
                            <TextField
                                label='Password'
                                type='password'
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder='Share this with members to join'
                                fullWidth
                                required
                                helperText='Minimum 4 characters'
                            />
                            <Divider sx={{ my: 0.5 }} />
                            <Stack direction='row' spacing={1.25} justifyContent='flex-end'>
                                <Button variant='outlined' onClick={onClose} disabled={loading}>
                                    Cancel
                                </Button>
                                <Button type='submit' variant='contained' color='primary' disabled={loading}>
                                    {loading ? <CircularProgress size={20} /> : 'Create room'}
                                </Button>
                            </Stack>
                        </Stack>
                    </Box>
                </Card>
            </Box>
        </Modal>
    );
};

// ---------------- Join Room ----------------

interface JoinRoomModalProps {
    open: boolean;
    onClose: () => void;
    defaultRoomCode?: string;
    onJoined: (room: APIRoom) => void;
}

export const JoinRoomModal: React.FC<JoinRoomModalProps> = ({
    open,
    onClose,
    defaultRoomCode,
    onJoined,
}) => {
    const [roomCode, setRoomCode] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            setRoomCode(defaultRoomCode?.toUpperCase() ?? '');
            setPassword('');
            setError(null);
            setLoading(false);
        }
    }, [open, defaultRoomCode]);

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!roomCode.trim()) return setError('Enter the room code');
        if (!password) return setError('Enter the room password');
        setLoading(true);
        try {
            const room = await apiJoinRoom({ room_code: roomCode.trim(), password });
            showSuccessSnackbar(`Joined "${room.name}"`);
            onJoined(room);
            onClose();
        } catch (err) {
            setError(getApiErrorMessage(err, 'Failed to join room. Check code and password.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={wrapperSx}>
                <Card sx={{ p: 0 }}>
                    <Stack direction='row' justifyContent='space-between' alignItems='center' sx={headerSx('#bef264')}>
                        <Typography variant='h6' sx={{ fontWeight: 800, color: '#0a0a0a' }}>
                            Join a Room
                        </Typography>
                        <IconButton onClick={onClose} size='small' sx={closeBtnSx}>
                            <CloseRounded fontSize='small' />
                        </IconButton>
                    </Stack>
                    <Box component='form' onSubmit={handleJoin} sx={{ p: 2.5 }}>
                        <Stack spacing={2}>
                            <TextField
                                label='Room code'
                                value={roomCode}
                                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                                placeholder='e.g. ABC123'
                                fullWidth
                                required
                                inputProps={{ style: { fontFamily: 'monospace', letterSpacing: '0.08em' } }}
                            />
                            <TextField
                                label='Password'
                                type='password'
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                fullWidth
                                required
                            />
                            {error && <Alert severity='error'>{error}</Alert>}
                            <Divider sx={{ my: 0.5 }} />
                            <Stack direction='row' spacing={1.25} justifyContent='flex-end'>
                                <Button variant='outlined' onClick={onClose} disabled={loading}>
                                    Cancel
                                </Button>
                                <Button type='submit' variant='contained' color='primary' disabled={loading}>
                                    {loading ? <CircularProgress size={20} /> : 'Join room'}
                                </Button>
                            </Stack>
                        </Stack>
                    </Box>
                </Card>
            </Box>
        </Modal>
    );
};

// ---------------- Add Expense ----------------

interface AddExpenseModalProps {
    open: boolean;
    onClose: () => void;
    room: APIRoom;
    currentUsername: string;
    onAdded: () => void;
}

type SplitMode = 'equal' | 'exact';

const roundMoney = (n: number) => Math.round(n * 100) / 100;

/** Stable order: room member list, filtered to selected splitters. Last entry = auto remainder. */
const orderedSplitMembers = (room: APIRoom, splitAmong: string[]) =>
    room.members.map((m) => m.username).filter((u) => splitAmong.includes(u));

export const AddRoomExpenseModal: React.FC<AddExpenseModalProps> = ({
    open,
    onClose,
    room,
    currentUsername,
    onAdded,
}) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState<string>('');
    const [paidBy, setPaidBy] = useState(currentUsername);
    const [splitAmong, setSplitAmong] = useState<string[]>(
        room.members.map((m) => m.username),
    );
    const [splitMode, setSplitMode] = useState<SplitMode>('equal');
    const [exactSplits, setExactSplits] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            setDescription('');
            setAmount('');
            setPaidBy(currentUsername);
            setSplitAmong(room.members.map((m) => m.username));
            setSplitMode('equal');
            setExactSplits({});
            setLoading(false);
        }
    }, [open, room, currentUsername]);

    const numericAmount = parseFloat(amount) || 0;

    const orderedSplit = useMemo(
        () => orderedSplitMembers(room, splitAmong),
        [room, splitAmong],
    );

    const exactSplitMeta = useMemo(() => {
        if (splitMode !== 'exact' || orderedSplit.length === 0) {
            return {
                editableNames: [] as string[],
                autoName: null as string | null,
                autoAmount: 0,
                sumEditable: 0,
                exactOk: true,
                overBy: 0,
            };
        }

        const autoName =
            orderedSplit.length === 1 ? orderedSplit[0] : orderedSplit[orderedSplit.length - 1];
        const editableNames =
            orderedSplit.length === 1 ? [] : orderedSplit.slice(0, -1);

        const sumEditable = roundMoney(
            editableNames.reduce(
                (s, name) => s + (parseFloat(exactSplits[name] || '0') || 0),
                0,
            ),
        );

        const autoAmount =
            orderedSplit.length === 1
                ? roundMoney(numericAmount)
                : roundMoney(numericAmount - sumEditable);

        const overBy = roundMoney(Math.max(0, sumEditable - numericAmount));
        const exactOk =
            numericAmount > 0 &&
            autoAmount >= -0.005 &&
            overBy < 0.01 &&
            Math.abs(sumEditable + autoAmount - numericAmount) < 0.02;

        return {
            editableNames,
            autoName,
            autoAmount,
            sumEditable,
            exactOk,
            overBy,
        };
    }, [splitMode, orderedSplit, exactSplits, numericAmount]);

    const handleExactSplitChange = (name: string, raw: string) => {
        if (!exactSplitMeta.editableNames.includes(name)) return;

        if (raw === '' || raw === '.') {
            setExactSplits((p) => ({ ...p, [name]: raw }));
            return;
        }

        let val = parseFloat(raw);
        if (Number.isNaN(val) || val < 0) val = 0;

        const othersSum = exactSplitMeta.editableNames
            .filter((n) => n !== name)
            .reduce((s, n) => s + (parseFloat(exactSplits[n] || '0') || 0), 0);

        const maxAllowed = roundMoney(Math.max(0, numericAmount - othersSum));
        if (val > maxAllowed) val = maxAllowed;

        setExactSplits((p) => ({
            ...p,
            [name]: raw.includes('.') && raw.endsWith('.') ? raw : String(val),
        }));
    };

    const toggleSplit = (name: string) => {
        setSplitAmong((prev) => {
            const removing = prev.includes(name);
            if (removing) {
                setExactSplits((p) => {
                    const next = { ...p };
                    delete next[name];
                    return next;
                });
            }
            return removing ? prev.filter((n) => n !== name) : [...prev, name];
        });
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description.trim()) return showErrorSnackbar('Enter a description');
        if (numericAmount <= 0) return showErrorSnackbar('Enter a valid amount');
        if (splitAmong.length === 0) return showErrorSnackbar('Pick at least one person to split with');
        if (splitMode === 'exact' && !exactSplitMeta.exactOk) {
            if (exactSplitMeta.overBy > 0) {
                return showErrorSnackbar(
                    `Split amounts exceed the total by ₹${exactSplitMeta.overBy.toFixed(2)}`,
                );
            }
            if (exactSplitMeta.autoAmount < 0) {
                return showErrorSnackbar('Reduce member amounts — remainder cannot be negative');
            }
            return showErrorSnackbar(`Exact splits must total ₹${numericAmount.toFixed(2)}`);
        }

        // Map usernames to user IDs
        const usernameToId: Record<string, number> = {};
        room.members.forEach((m) => { usernameToId[m.username] = m.id; });

        const payerId = usernameToId[paidBy];
        if (!payerId) return showErrorSnackbar('Select who paid for this expense');

        setLoading(true);
        try {
            const base = {
                amount: numericAmount,
                description: description.trim(),
                paid_by: payerId,
            };
            if (splitMode === 'exact') {
                const shares: Record<string, number> = {};
                orderedSplit.forEach((name) => {
                    const uid = usernameToId[name];
                    if (!uid) return;
                    const isAuto =
                        exactSplitMeta.autoName === name && orderedSplit.length > 1;
                    const shareAmount = isAuto
                        ? exactSplitMeta.autoAmount
                        : parseFloat(exactSplits[name] || '0') || 0;
                    shares[String(uid)] = roundMoney(shareAmount);
                });
                await apiAddExpense(room.room_code, { ...base, shares });
            } else {
                const splitIds = splitAmong
                    .map((name) => usernameToId[name])
                    .filter(Boolean) as number[];
                await apiAddExpense(room.room_code, { ...base, split_among: splitIds });
            }
            showSuccessSnackbar('Expense added');
            onAdded();
            onClose();
        } catch (err) {
            showErrorSnackbar(getApiErrorMessage(err, 'Failed to add expense'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={wrapperSx}>
                <Card sx={{ p: 0 }}>
                    <Stack direction='row' justifyContent='space-between' alignItems='center' sx={headerSx('#7dd3fc')}>
                        <Typography variant='h6' sx={{ fontWeight: 800, color: '#0a0a0a' }}>
                            Add Expense
                        </Typography>
                        <IconButton onClick={onClose} size='small' sx={closeBtnSx}>
                            <CloseRounded fontSize='small' />
                        </IconButton>
                    </Stack>
                    <Box component='form' onSubmit={handleAdd} sx={{ p: 2.5 }}>
                        <Stack spacing={2}>
                            <TextField
                                label='Description'
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder='e.g. Dinner at Beachside Cafe'
                                fullWidth
                                required
                            />
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                <TextField
                                    label='Amount (₹)'
                                    type='number'
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    inputProps={{ min: 0, step: 0.01 }}
                                    required
                                    fullWidth
                                />
                            </Stack>
                            <FormControl fullWidth size='small'>
                                <InputLabel>Paid by</InputLabel>
                                <Select
                                    label='Paid by'
                                    value={paidBy}
                                    onChange={(e) => setPaidBy(e.target.value)}
                                >
                                    {room.members.map((m) => (
                                        <MenuItem key={m.id} value={m.username}>
                                            {m.username}
                                            {m.username === currentUsername ? ' (you)' : ''}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <Box>
                                <Typography variant='caption' sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                    Split mode
                                </Typography>
                                <ToggleButtonGroup
                                    value={splitMode}
                                    exclusive
                                    onChange={(_, v) => v && setSplitMode(v)}
                                    size='small'
                                    fullWidth
                                    sx={{ mt: 0.5 }}
                                >
                                    <ToggleButton value='equal' sx={{ fontWeight: 700 }}>
                                        Equal
                                    </ToggleButton>
                                    <ToggleButton value='exact' sx={{ fontWeight: 700 }}>
                                        Exact amounts
                                    </ToggleButton>
                                </ToggleButtonGroup>
                            </Box>

                            <Box>
                                <Typography variant='caption' sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                    Split among
                                </Typography>
                                <Stack
                                    direction='row'
                                    flexWrap='wrap'
                                    gap={0.5}
                                    sx={{
                                        border: '2px solid',
                                        borderColor: 'divider',
                                        borderRadius: 2,
                                        p: 1,
                                        mt: 0.5,
                                    }}
                                >
                                    {room.members.map((m) => (
                                        <FormControlLabel
                                            key={m.username}
                                            sx={{ m: 0, mr: 1 }}
                                            control={
                                                <Checkbox
                                                    size='small'
                                                    checked={splitAmong.includes(m.username)}
                                                    onChange={() => toggleSplit(m.username)}
                                                />
                                            }
                                            label={
                                                <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                                                    {m.username}
                                                </Typography>
                                            }
                                        />
                                    ))}
                                </Stack>
                                {splitMode === 'equal' && splitAmong.length > 0 && numericAmount > 0 && (
                                    <Typography variant='caption' color='text.secondary' sx={{ mt: 0.5, display: 'block' }}>
                                        Each pays ₹{(numericAmount / splitAmong.length).toFixed(2)}
                                    </Typography>
                                )}
                            </Box>

                            {splitMode === 'exact' && orderedSplit.length > 0 && numericAmount > 0 && (
                                <Box>
                                    <Typography variant='caption' sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                        Exact amounts
                                    </Typography>
                                    {orderedSplit.length > 1 && (
                                        <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 0.25, fontWeight: 600 }}>
                                            Enter amounts for each member except the last —{' '}
                                            <strong>{exactSplitMeta.autoName}</strong> is calculated automatically.
                                        </Typography>
                                    )}
                                    <Stack spacing={1} sx={{ mt: 0.75 }}>
                                        {orderedSplit.map((n) => {
                                            const isAuto =
                                                exactSplitMeta.autoName === n && orderedSplit.length > 1;
                                            return (
                                                <Stack direction='row' alignItems='center' spacing={1} key={n}>
                                                    <Typography sx={{ flex: 1, fontWeight: 600 }}>
                                                        {n}
                                                        {isAuto && (
                                                            <Typography
                                                                component='span'
                                                                variant='caption'
                                                                color='text.secondary'
                                                                sx={{ ml: 0.5, fontWeight: 600 }}
                                                            >
                                                                (auto)
                                                            </Typography>
                                                        )}
                                                    </Typography>
                                                    <TextField
                                                        size='small'
                                                        type='number'
                                                        disabled={isAuto}
                                                        value={
                                                            isAuto
                                                                ? exactSplitMeta.autoAmount.toFixed(2)
                                                                : exactSplits[n] ?? ''
                                                        }
                                                        onChange={(e) =>
                                                            handleExactSplitChange(n, e.target.value)
                                                        }
                                                        inputProps={{
                                                            min: 0,
                                                            step: 0.01,
                                                            max: isAuto
                                                                ? undefined
                                                                : roundMoney(
                                                                      numericAmount -
                                                                          exactSplitMeta.editableNames
                                                                              .filter((x) => x !== n)
                                                                              .reduce(
                                                                                  (s, x) =>
                                                                                      s +
                                                                                      (parseFloat(
                                                                                          exactSplits[x] || '0',
                                                                                      ) || 0),
                                                                                  0,
                                                                              ),
                                                                  ),
                                                        }}
                                                        error={
                                                            !isAuto &&
                                                            exactSplitMeta.overBy > 0 &&
                                                            (parseFloat(exactSplits[n] || '0') || 0) > 0
                                                        }
                                                        helperText={
                                                            isAuto
                                                                ? 'Remainder'
                                                                : undefined
                                                        }
                                                        sx={{ width: 130 }}
                                                    />
                                                </Stack>
                                            );
                                        })}
                                    </Stack>
                                    <Typography
                                        variant='caption'
                                        sx={{ mt: 0.75, display: 'block', fontWeight: 600 }}
                                        color={
                                            exactSplitMeta.exactOk ? 'success.dark' : 'error.main'
                                        }
                                    >
                                        Total: ₹
                                        {roundMoney(
                                            exactSplitMeta.sumEditable + exactSplitMeta.autoAmount,
                                        ).toFixed(2)}{' '}
                                        / ₹{numericAmount.toFixed(2)}
                                        {exactSplitMeta.overBy > 0 &&
                                            ` — over by ₹${exactSplitMeta.overBy.toFixed(2)}`}
                                        {exactSplitMeta.autoAmount < -0.005 &&
                                            ' — amounts are too high'}
                                    </Typography>
                                </Box>
                            )}

                            <Divider sx={{ my: 0.5 }} />
                            <Stack direction='row' spacing={1.25} justifyContent='flex-end'>
                                <Button variant='outlined' onClick={onClose} disabled={loading}>
                                    Cancel
                                </Button>
                                <Button
                                    type='submit'
                                    variant='contained'
                                    color='primary'
                                    disabled={
                                        loading ||
                                        (splitMode === 'exact' &&
                                            (numericAmount <= 0 || !exactSplitMeta.exactOk))
                                    }
                                >
                                    {loading ? <CircularProgress size={20} /> : 'Add expense'}
                                </Button>
                            </Stack>
                        </Stack>
                    </Box>
                </Card>
            </Box>
        </Modal>
    );
};
