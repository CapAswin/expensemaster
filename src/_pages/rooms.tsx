import React, { useEffect, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Grid,
    IconButton,
    Stack,
    Tooltip,
    Typography,
} from '@mui/material';
import {
    AddRounded,
    ContentCopyRounded,
    GroupAddRounded,
    GroupsRounded,
    LinkRounded,
    OpenInNewRounded,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { RootState } from '../redux/store';
import {
    rememberJoinedRoom,
    forgetJoinedRoom,
    setMemberName,
} from '../redux/roomSlice';
import { buildInviteLink, getRoom, importRoomFromInvite, Room } from '../_utils/roomsStore';
import {
    CreateRoomModal,
    JoinRoomModal,
} from '../_components/modals/roomModals';
import { showErrorSnackbar, showSuccessSnackbar } from '../_components/snackbar/Snackbar';

const HEADER_COLORS = ['#fcd34d', '#ff6b9d', '#bef264', '#7dd3fc', '#fb923c', '#c4b5fd'];

const RoomsPage: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const memberName = useSelector((s: RootState) => s.room.memberName);
    const joinedRooms = useSelector((s: RootState) => s.room.joinedRooms);

    const [createOpen, setCreateOpen] = useState(false);
    const [joinOpen, setJoinOpen] = useState(false);
    const [inviteBanner, setInviteBanner] = useState<{ room: Room } | null>(null);
    const [searchParams, setSearchParams] = useSearchParams();

    // Auto-import a room from a ?invite=… link, then strip the param from the URL.
    useEffect(() => {
        const invite = searchParams.get('invite');
        if (!invite) return;
        const room = importRoomFromInvite(invite);
        if (room) {
            setInviteBanner({ room });
            showSuccessSnackbar(`Room "${room.name}" available to join`);
        } else {
            showErrorSnackbar('Invalid invite link');
        }
        searchParams.delete('invite');
        setSearchParams(searchParams, { replace: true });
    }, [searchParams, setSearchParams]);

    const hydrated = joinedRooms
        .map((j) => ({ joined: j, room: getRoom(j.roomId) }))
        .filter((x): x is { joined: typeof joinedRooms[number]; room: Room } => !!x.room);

    const handleCreated = (room: Room, name: string) => {
        dispatch(setMemberName(name));
        dispatch(rememberJoinedRoom({ roomId: room.id, memberName: name, joinedAt: Date.now() }));
        navigate(`/rooms/${room.id}`);
    };

    const handleJoined = (room: Room, name: string) => {
        dispatch(setMemberName(name));
        dispatch(rememberJoinedRoom({ roomId: room.id, memberName: name, joinedAt: Date.now() }));
        navigate(`/rooms/${room.id}`);
    };

    const handleCopy = (id: string) => {
        navigator.clipboard.writeText(id);
        showSuccessSnackbar(`Room ID copied: ${id}`);
    };

    const handleCopyInvite = (room: Room) => {
        const link = buildInviteLink(room);
        navigator.clipboard.writeText(link);
        showSuccessSnackbar('Invite link copied — share it to add others');
    };

    return (
        <Box>
            {/* Invite banner */}
            {inviteBanner && (
                <Alert
                    severity='info'
                    sx={{ mb: 2.5, fontWeight: 600 }}
                    action={
                        <Stack direction='row' spacing={1}>
                            <Button size='small' onClick={() => setInviteBanner(null)}>
                                Dismiss
                            </Button>
                            <Button
                                size='small'
                                variant='contained'
                                color='primary'
                                onClick={() => {
                                    setJoinOpen(true);
                                    setInviteBanner(null);
                                }}
                            >
                                Join now
                            </Button>
                        </Stack>
                    }
                >
                    You've been invited to <strong>{inviteBanner.room.name}</strong>.
                    Use ID <code>{inviteBanner.room.id}</code> and ask the creator for the password.
                </Alert>
            )}

            {/* Action cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                    <Card sx={{ height: '100%', backgroundColor: '#fcd34d', color: '#0a0a0a' }}>
                        <CardContent sx={{ p: 2.5 }}>
                            <Stack direction='row' spacing={2} alignItems='center'>
                                <Box
                                    sx={{
                                        width: 56,
                                        height: 56,
                                        borderRadius: 2,
                                        border: '2px solid #0a0a0a',
                                        boxShadow: '3px 3px 0 0 #0a0a0a',
                                        backgroundColor: '#fff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#0a0a0a',
                                        flexShrink: 0,
                                    }}
                                >
                                    <AddRounded sx={{ fontSize: 30 }} />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant='h6' sx={{ fontWeight: 800 }}>
                                        Create a room
                                    </Typography>
                                    <Typography variant='body2' sx={{ fontWeight: 600, color: 'rgba(10,10,10,0.75)' }}>
                                        Start a new shared expense space
                                    </Typography>
                                </Box>
                                <Button
                                    variant='contained'
                                    color='secondary'
                                    onClick={() => setCreateOpen(true)}
                                >
                                    Create
                                </Button>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Card sx={{ height: '100%', backgroundColor: '#bef264', color: '#0a0a0a' }}>
                        <CardContent sx={{ p: 2.5 }}>
                            <Stack direction='row' spacing={2} alignItems='center'>
                                <Box
                                    sx={{
                                        width: 56,
                                        height: 56,
                                        borderRadius: 2,
                                        border: '2px solid #0a0a0a',
                                        boxShadow: '3px 3px 0 0 #0a0a0a',
                                        backgroundColor: '#fff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#0a0a0a',
                                        flexShrink: 0,
                                    }}
                                >
                                    <GroupAddRounded sx={{ fontSize: 30 }} />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant='h6' sx={{ fontWeight: 800 }}>
                                        Join a room
                                    </Typography>
                                    <Typography variant='body2' sx={{ fontWeight: 600, color: 'rgba(10,10,10,0.75)' }}>
                                        Enter with a room ID + password
                                    </Typography>
                                </Box>
                                <Button
                                    variant='contained'
                                    color='secondary'
                                    onClick={() => setJoinOpen(true)}
                                >
                                    Join
                                </Button>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Joined rooms list */}
            <Card>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Stack
                        direction='row'
                        alignItems='center'
                        justifyContent='space-between'
                        sx={{ mb: 2.5 }}
                    >
                        <Stack direction='row' alignItems='center' gap={1.25}>
                            <Box
                                sx={(t) => ({
                                    width: 40,
                                    height: 40,
                                    borderRadius: 1.5,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: '#c4b5fd',
                                    border: `2px solid ${t.palette.divider}`,
                                    boxShadow: `3px 3px 0 0 ${t.palette.divider}`,
                                    color: '#0a0a0a',
                                })}
                            >
                                <GroupsRounded />
                            </Box>
                            <Box>
                                <Typography variant='h6' sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                                    Your rooms
                                </Typography>
                                <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 600 }}>
                                    {hydrated.length} joined
                                </Typography>
                            </Box>
                        </Stack>
                        {memberName && (
                            <Chip
                                label={`You: ${memberName}`}
                                color='primary'
                                sx={{ fontWeight: 700 }}
                            />
                        )}
                    </Stack>

                    {hydrated.length === 0 ? (
                        <Box
                            sx={(t) => ({
                                textAlign: 'center',
                                py: 6,
                                px: 3,
                                border: `2px dashed ${t.palette.divider}`,
                                borderRadius: 2,
                            })}
                        >
                            <Typography variant='h6' sx={{ fontWeight: 800, mb: 0.5 }}>
                                You haven't joined any rooms yet
                            </Typography>
                            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                                Create one to start splitting expenses, or join with a friend's ID.
                            </Typography>
                            <Stack direction='row' spacing={1.5} justifyContent='center'>
                                <Button
                                    variant='contained'
                                    color='primary'
                                    startIcon={<AddRounded />}
                                    onClick={() => setCreateOpen(true)}
                                >
                                    Create room
                                </Button>
                                <Button
                                    variant='outlined'
                                    startIcon={<GroupAddRounded />}
                                    onClick={() => setJoinOpen(true)}
                                >
                                    Join room
                                </Button>
                            </Stack>
                        </Box>
                    ) : (
                        <Grid container spacing={2}>
                            {hydrated.map(({ room, joined }, idx) => {
                                const bg = HEADER_COLORS[idx % HEADER_COLORS.length];
                                return (
                                    <Grid item xs={12} sm={6} md={4} key={room.id}>
                                        <Card sx={{ height: '100%' }}>
                                            <Box
                                                sx={{
                                                    backgroundColor: bg,
                                                    px: 2,
                                                    py: 1.5,
                                                    borderBottom: '2px solid',
                                                    borderBottomColor: 'divider',
                                                }}
                                            >
                                                <Typography
                                                    variant='subtitle1'
                                                    sx={{ fontWeight: 800, color: '#0a0a0a', wordBreak: 'break-word' }}
                                                >
                                                    {room.name}
                                                </Typography>
                                            </Box>
                                            <CardContent sx={{ p: 2 }}>
                                                <Stack spacing={1.25}>
                                                    <Stack direction='row' alignItems='center' spacing={0.5}>
                                                        <Chip
                                                            label={room.id}
                                                            size='small'
                                                            sx={{ fontFamily: 'monospace', letterSpacing: '0.06em' }}
                                                        />
                                                        <Tooltip title='Copy ID'>
                                                            <IconButton
                                                                size='small'
                                                                onClick={() => handleCopy(room.id)}
                                                                sx={{ width: 28, height: 28 }}
                                                            >
                                                                <ContentCopyRounded sx={{ fontSize: 14 }} />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Stack>
                                                    <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 600 }}>
                                                        {room.members.length} member{room.members.length === 1 ? '' : 's'} · {room.expenses.length} expense{room.expenses.length === 1 ? '' : 's'}
                                                    </Typography>
                                                    <Typography variant='caption' color='text.secondary'>
                                                        You as <strong>{joined.memberName}</strong>
                                                    </Typography>
                                                    <Stack direction='row' spacing={1} sx={{ mt: 0.5 }}>
                                                        <Button
                                                            variant='contained'
                                                            color='primary'
                                                            size='small'
                                                            startIcon={<OpenInNewRounded />}
                                                            onClick={() => navigate(`/rooms/${room.id}`)}
                                                            sx={{ flex: 1 }}
                                                        >
                                                            Open
                                                        </Button>
                                                        <Tooltip title='Copy invite link'>
                                                            <IconButton
                                                                size='small'
                                                                onClick={() => handleCopyInvite(room)}
                                                                sx={{ width: 36, height: 36 }}
                                                            >
                                                                <LinkRounded sx={{ fontSize: 18 }} />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title='Remove from list'>
                                                            <Button
                                                                variant='outlined'
                                                                size='small'
                                                                onClick={() => dispatch(forgetJoinedRoom(room.id))}
                                                            >
                                                                Forget
                                                            </Button>
                                                        </Tooltip>
                                                    </Stack>
                                                </Stack>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    )}
                </CardContent>
            </Card>

            <CreateRoomModal
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                defaultMemberName={memberName}
                onCreated={handleCreated}
            />
            <JoinRoomModal
                open={joinOpen}
                onClose={() => setJoinOpen(false)}
                defaultMemberName={memberName}
                onJoined={handleJoined}
            />
        </Box>
    );
};

export default RoomsPage;
