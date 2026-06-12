import React, { useEffect, useState, useCallback } from 'react';
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
    CircularProgress,
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
} from '../redux/roomSlice';
import {
    apiListRooms,
    apiGetRoomInfo,
    apiCheckMembership,
    APIRoom,
    getApiErrorMessage,
} from '../_utils/roomsAPI';
import {
    CreateRoomModal,
    JoinRoomModal,
} from '../_components/modals/roomModals';
import { showErrorSnackbar, showSuccessSnackbar } from '../_components/snackbar/Snackbar';

const HEADER_COLORS = ['#fcd34d', '#ff6b9d', '#bef264', '#7dd3fc', '#fb923c', '#c4b5fd'];

const RoomsPage: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const joinedRooms = useSelector((s: RootState) => s.room.joinedRooms);
    const username = useSelector((s: RootState) => s.auth.username);

    const [rooms, setRooms] = useState<APIRoom[]>([]);
    const [loading, setLoading] = useState(true);
    const [createOpen, setCreateOpen] = useState(false);
    const [joinOpen, setJoinOpen] = useState(false);
    const [inviteRoomCode, setInviteRoomCode] = useState<string | undefined>();
    const [inviteBanner, setInviteBanner] = useState<{
        name: string;
        room_code: string;
        is_member: boolean;
    } | null>(null);
    const [searchParams, setSearchParams] = useSearchParams();

    // Fetch rooms
    const fetchRooms = useCallback(async () => {
        try {
            const data = await apiListRooms();
            setRooms(data);
        } catch (err) {
            showErrorSnackbar(getApiErrorMessage(err, 'Failed to load rooms'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRooms();
    }, [fetchRooms]);

    // Handle invite link
    useEffect(() => {
        const invite = searchParams.get('invite');
        if (!invite) return;
        const code = invite.trim().toUpperCase();

        (async () => {
            try {
                const info = await apiGetRoomInfo(code);
                try {
                    const membership = await apiCheckMembership(code);
                    setInviteBanner({
                        name: info.name,
                        room_code: code,
                        is_member: membership.is_member,
                    });
                    if (membership.is_member) {
                        showSuccessSnackbar(`You are already a member of "${info.name}"`);
                    } else {
                        showSuccessSnackbar(`Room "${info.name}" available to join`);
                    }
                } catch {
                    // Not logged in or can't check — show join banner anyway
                    setInviteBanner({
                        name: info.name,
                        room_code: code,
                        is_member: false,
                    });
                    showSuccessSnackbar(`Room "${info.name}" available to join`);
                }
            } catch {
                showErrorSnackbar('Invalid invite link — room not found');
            }
        })();

        searchParams.delete('invite');
        setSearchParams(searchParams, { replace: true });
    }, [searchParams, setSearchParams]);

    const handleCreated = (room: APIRoom) => {
        dispatch(rememberJoinedRoom({ roomCode: room.room_code, roomName: room.name, joinedAt: Date.now() }));
        navigate(`/rooms/${room.room_code}`);
    };

    const handleJoined = (room: APIRoom) => {
        dispatch(rememberJoinedRoom({ roomCode: room.room_code, roomName: room.name, joinedAt: Date.now() }));
        navigate(`/rooms/${room.room_code}`);
    };

    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code);
        showSuccessSnackbar(`Room code copied: ${code}`);
    };

    const handleCopyInvite = (code: string) => {
        const link = `${window.location.origin}/rooms?invite=${code}`;
        navigator.clipboard.writeText(link);
        showSuccessSnackbar('Invite link copied — share it to add others');
    };

    return (
        <Box>
            {/* Invite banner */}
            {inviteBanner && (
                <Alert
                    severity={inviteBanner.is_member ? 'success' : 'info'}
                    sx={{ mb: 2.5, fontWeight: 600 }}
                    action={
                        <Stack direction='row' spacing={1}>
                            <Button size='small' onClick={() => setInviteBanner(null)}>
                                Dismiss
                            </Button>
                            {!inviteBanner.is_member && (
                                <Button
                                    size='small'
                                    variant='contained'
                                    color='primary'
                                    onClick={() => {
                                        setInviteRoomCode(inviteBanner.room_code);
                                        setJoinOpen(true);
                                        setInviteBanner(null);
                                    }}
                                >
                                    Join now
                                </Button>
                            )}
                        </Stack>
                    }
                >
                    {inviteBanner.is_member ? (
                        <>You are already a member of <strong>{inviteBanner.name}</strong>.</>
                    ) : (
                        <>You've been invited to <strong>{inviteBanner.name}</strong>. Enter the password to join.</>
                    )}
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
                                        Enter with a room code + password
                                    </Typography>
                                </Box>
                                <Button
                                    variant='contained'
                                    color='secondary'
                                    onClick={() => {
                                        setInviteRoomCode(undefined);
                                        setJoinOpen(true);
                                    }}
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
                                    {rooms.length} joined
                                </Typography>
                            </Box>
                        </Stack>
                        {username && (
                            <Chip
                                label={`You: ${username}`}
                                color='primary'
                                sx={{ fontWeight: 700 }}
                            />
                        )}
                    </Stack>

                    {loading ? (
                        <Box sx={{ textAlign: 'center', py: 6 }}>
                            <CircularProgress />
                        </Box>
                    ) : rooms.length === 0 ? (
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
                                Create one to start splitting expenses, or join with a friend's code.
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
                                    onClick={() => {
                                        setInviteRoomCode(undefined);
                                        setJoinOpen(true);
                                    }}
                                >
                                    Join room
                                </Button>
                            </Stack>
                        </Box>
                    ) : (
                        <Grid container spacing={2}>
                            {rooms.map((room, idx) => {
                                const bg = HEADER_COLORS[idx % HEADER_COLORS.length];
                                return (
                                    <Grid item xs={12} sm={6} md={4} key={room.room_code}>
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
                                                            label={room.room_code}
                                                            size='small'
                                                            sx={{ fontFamily: 'monospace', letterSpacing: '0.06em' }}
                                                        />
                                                        <Tooltip title='Copy code'>
                                                            <IconButton
                                                                size='small'
                                                                onClick={() => handleCopy(room.room_code)}
                                                                sx={{ width: 28, height: 28 }}
                                                            >
                                                                <ContentCopyRounded sx={{ fontSize: 14 }} />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Stack>
                                                    <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 600 }}>
                                                        {room.member_count} member{room.member_count === 1 ? '' : 's'}
                                                    </Typography>
                                                    <Typography variant='caption' color='text.secondary'>
                                                        Created by <strong>{room.created_by_username}</strong>
                                                    </Typography>
                                                    <Stack direction='row' spacing={1} sx={{ mt: 0.5 }}>
                                                        <Button
                                                            variant='contained'
                                                            color='primary'
                                                            size='small'
                                                            startIcon={<OpenInNewRounded />}
                                                            onClick={() => navigate(`/rooms/${room.room_code}`)}
                                                            sx={{ flex: 1 }}
                                                        >
                                                            Open
                                                        </Button>
                                                        <Button
                                                            variant='outlined'
                                                            size='small'
                                                            onClick={() => navigate(`/rooms/${room.room_code}/settlement`)}
                                                        >
                                                            Balance
                                                        </Button>
                                                        <Tooltip title='Copy invite link'>
                                                            <IconButton
                                                                size='small'
                                                                onClick={() => handleCopyInvite(room.room_code)}
                                                                sx={{ width: 36, height: 36 }}
                                                            >
                                                                <LinkRounded sx={{ fontSize: 18 }} />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title='Remove from list'>
                                                            <Button
                                                                variant='outlined'
                                                                size='small'
                                                                onClick={() => dispatch(forgetJoinedRoom(room.room_code))}
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
                onCreated={handleCreated}
            />
            <JoinRoomModal
                open={joinOpen}
                onClose={() => setJoinOpen(false)}
                defaultRoomCode={inviteRoomCode}
                onJoined={handleJoined}
            />
        </Box>
    );
};

export default RoomsPage;
