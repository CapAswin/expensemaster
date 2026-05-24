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
} from '@mui/material';
import { CloseRounded } from '@mui/icons-material';
import {
    createRoom,
    joinRoom,
    addExpense,
    Room,
    SplitMode,
} from '../../_utils/roomsStore';
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
    defaultMemberName?: string | null;
    onCreated: (room: Room, memberName: string) => void;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
    open,
    onClose,
    defaultMemberName,
    onCreated,
}) => {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [memberName, setMemberName] = useState(defaultMemberName ?? '');

    useEffect(() => {
        if (open) {
            setName('');
            setPassword('');
            setMemberName(defaultMemberName ?? '');
        }
    }, [open, defaultMemberName]);

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!memberName.trim()) return showErrorSnackbar('Enter your name');
        if (!name.trim()) return showErrorSnackbar('Enter a room name');
        if (password.length < 3) return showErrorSnackbar('Password must be at least 3 characters');
        const room = createRoom({
            name: name.trim(),
            password,
            creatorName: memberName.trim(),
        });
        showSuccessSnackbar(`Room "${room.name}" created!`);
        onCreated(room, memberName.trim());
        onClose();
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
                                label='Your name'
                                value={memberName}
                                onChange={(e) => setMemberName(e.target.value)}
                                placeholder='How others will see you'
                                fullWidth
                                required
                            />
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
                                helperText='Minimum 3 characters'
                            />
                            <Divider sx={{ my: 0.5 }} />
                            <Stack direction='row' spacing={1.25} justifyContent='flex-end'>
                                <Button variant='outlined' onClick={onClose}>
                                    Cancel
                                </Button>
                                <Button type='submit' variant='contained' color='primary'>
                                    Create room
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
    defaultMemberName?: string | null;
    onJoined: (room: Room, memberName: string) => void;
}

export const JoinRoomModal: React.FC<JoinRoomModalProps> = ({
    open,
    onClose,
    defaultMemberName,
    onJoined,
}) => {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [memberName, setMemberName] = useState(defaultMemberName ?? '');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setId('');
            setPassword('');
            setMemberName(defaultMemberName ?? '');
            setError(null);
        }
    }, [open, defaultMemberName]);

    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!memberName.trim()) return setError('Enter your name');
        if (!id.trim()) return setError('Enter the room ID');
        if (!password) return setError('Enter the room password');

        const result = joinRoom({ id: id.trim(), password, memberName: memberName.trim() });
        if (!result.ok) {
            setError(result.reason === 'not-found' ? 'No room with that ID' : 'Wrong password');
            return;
        }
        showSuccessSnackbar(`Joined "${result.room.name}"`);
        onJoined(result.room, memberName.trim());
        onClose();
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
                                label='Your name'
                                value={memberName}
                                onChange={(e) => setMemberName(e.target.value)}
                                placeholder='How others will see you'
                                fullWidth
                                required
                            />
                            <TextField
                                label='Room ID'
                                value={id}
                                onChange={(e) => setId(e.target.value.toUpperCase())}
                                placeholder='e.g. FNX-7K3'
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
                                <Button variant='outlined' onClick={onClose}>
                                    Cancel
                                </Button>
                                <Button type='submit' variant='contained' color='primary'>
                                    Join room
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
    room: Room;
    currentMember: string;
    onAdded: () => void;
}

export const AddRoomExpenseModal: React.FC<AddExpenseModalProps> = ({
    open,
    onClose,
    room,
    currentMember,
    onAdded,
}) => {
    const today = () => new Date().toISOString().split('T')[0];

    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState<string>('');
    const [paidBy, setPaidBy] = useState(currentMember);
    const [splitAmong, setSplitAmong] = useState<string[]>(room.members.map((m) => m.name));
    const [splitMode, setSplitMode] = useState<SplitMode>('equal');
    const [exactSplits, setExactSplits] = useState<Record<string, string>>({});
    const [date, setDate] = useState<string>(today());

    useEffect(() => {
        if (open) {
            setDescription('');
            setAmount('');
            setPaidBy(currentMember);
            setSplitAmong(room.members.map((m) => m.name));
            setSplitMode('equal');
            setExactSplits({});
            setDate(today());
        }
    }, [open, room, currentMember]);

    const exactTotal = useMemo(
        () =>
            splitAmong.reduce(
                (s, name) => s + (parseFloat(exactSplits[name] || '0') || 0),
                0,
            ),
        [exactSplits, splitAmong],
    );

    const numericAmount = parseFloat(amount) || 0;
    const exactOk =
        splitMode !== 'exact' || Math.abs(exactTotal - numericAmount) < 0.01;

    const toggleSplit = (name: string) => {
        setSplitAmong((prev) =>
            prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
        );
    };

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!description.trim()) return showErrorSnackbar('Enter a description');
        if (numericAmount <= 0) return showErrorSnackbar('Enter a valid amount');
        if (splitAmong.length === 0) return showErrorSnackbar('Pick at least one person to split with');
        if (splitMode === 'exact' && !exactOk)
            return showErrorSnackbar(`Exact splits must total ₹${numericAmount.toFixed(2)}`);

        const exact: Record<string, number> | undefined =
            splitMode === 'exact'
                ? Object.fromEntries(
                      splitAmong.map((n) => [n, parseFloat(exactSplits[n] || '0') || 0]),
                  )
                : undefined;

        addExpense(room.id, {
            description: description.trim(),
            amount: numericAmount,
            paidBy,
            splitAmong,
            splitMode,
            exactSplits: exact,
            date,
        });
        showSuccessSnackbar('Expense added');
        onAdded();
        onClose();
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
                                <TextField
                                    label='Date'
                                    type='date'
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    fullWidth
                                    required
                                    InputLabelProps={{ shrink: true }}
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
                                        <MenuItem key={m.name} value={m.name}>
                                            {m.name}
                                            {m.name === currentMember ? ' (you)' : ''}
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
                                            key={m.name}
                                            sx={{ m: 0, mr: 1 }}
                                            control={
                                                <Checkbox
                                                    size='small'
                                                    checked={splitAmong.includes(m.name)}
                                                    onChange={() => toggleSplit(m.name)}
                                                />
                                            }
                                            label={
                                                <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                                                    {m.name}
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

                            {splitMode === 'exact' && splitAmong.length > 0 && (
                                <Box>
                                    <Typography variant='caption' sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                        Exact amounts
                                    </Typography>
                                    <Stack spacing={1} sx={{ mt: 0.5 }}>
                                        {splitAmong.map((n) => (
                                            <Stack direction='row' alignItems='center' spacing={1} key={n}>
                                                <Typography sx={{ flex: 1, fontWeight: 600 }}>{n}</Typography>
                                                <TextField
                                                    size='small'
                                                    type='number'
                                                    value={exactSplits[n] ?? ''}
                                                    onChange={(e) =>
                                                        setExactSplits((p) => ({ ...p, [n]: e.target.value }))
                                                    }
                                                    inputProps={{ min: 0, step: 0.01 }}
                                                    sx={{ width: 120 }}
                                                />
                                            </Stack>
                                        ))}
                                    </Stack>
                                    <Typography
                                        variant='caption'
                                        sx={{ mt: 0.5, display: 'block', fontWeight: 600 }}
                                        color={exactOk ? 'success.dark' : 'error.main'}
                                    >
                                        Total: ₹{exactTotal.toFixed(2)} / ₹{numericAmount.toFixed(2)}
                                    </Typography>
                                </Box>
                            )}

                            <Divider sx={{ my: 0.5 }} />
                            <Stack direction='row' spacing={1.25} justifyContent='flex-end'>
                                <Button variant='outlined' onClick={onClose}>
                                    Cancel
                                </Button>
                                <Button type='submit' variant='contained' color='primary' disabled={!exactOk}>
                                    Add expense
                                </Button>
                            </Stack>
                        </Stack>
                    </Box>
                </Card>
            </Box>
        </Modal>
    );
};
