import * as React from 'react';
import {
    Avatar,
    Box,
    Button,
    Card,
    IconButton,
    Menu,
    MenuItem,
    Tab,
    Tooltip,
    Typography,
    Divider,
    Stack,
} from '@mui/material';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    AddRounded,
    DarkModeRounded,
    InfoOutlined,
    LightModeRounded,
    LogoutRounded,
    PasswordRounded,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';

import axiosInstance from '../../_utils/axios';
import { persistor, RootState } from '../../redux/store';
import { showSuccessSnackbar } from '../snackbar/Snackbar';
import { openChangePassword, openCreateTransactinModal } from '../../redux/modalSlice';

interface LabTabsProps {
    theme: () => void;
    isDarkMode?: boolean;
}

const TAB_CONTENT = [
    { label: 'Dashboard', value: '/' },
    { label: 'Transactions', value: '/transactions' },
    { label: 'Manage', value: '/manage' },
];

const TAB_SUBTITLES: Record<string, string> = {
    '/': 'Your financial overview at a glance',
    '/transactions': 'Browse, filter and manage every entry',
    '/manage': 'Organize your spending categories',
};

export default function LabTabs({ theme, isDarkMode = false }: LabTabsProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.auth.username);

    const [value, setValue] = React.useState(location.pathname);
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    React.useEffect(() => {
        setValue(location.pathname);
    }, [location.pathname]);

    const handleChange = (_: React.SyntheticEvent, newValue: string) => {
        setValue(newValue);
        navigate(newValue, { state: { newValue } });
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    const handleLogout = () => {
        axiosInstance.post('/api/logout/').then(() => {
            persistor.purge();
            localStorage.clear();
            showSuccessSnackbar('Signed out!');
        });
        handleMenuClose();
    };

    const handleChangePassword = () => {
        dispatch(openChangePassword({ open: true }));
        handleMenuClose();
    };

    const handleCreateTransaction = () => {
        dispatch(openCreateTransactinModal({ open: true, id: null, data: null }));
    };

    const userInitial = (user || 'U').charAt(0).toUpperCase();

    return (
        <Box sx={{ width: '100%' }}>
            <TabContext value={value}>
                <Card
                    sx={{
                        mb: 2,
                        px: { xs: 2, sm: 3 },
                        py: 1.5,
                        borderRadius: 3,
                    }}
                >
                    <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        alignItems={{ xs: 'stretch', md: 'center' }}
                        justifyContent='space-between'
                        gap={1.5}
                    >
                        <Stack direction='row' alignItems='center' gap={2.5}>
                            <Stack direction='row' alignItems='center' gap={1.25}>
                                <Box
                                    sx={(t) => ({
                                        width: 40,
                                        height: 40,
                                        borderRadius: 1.5,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: '#fcd34d',
                                        color: '#0a0a0a',
                                        fontWeight: 900,
                                        fontSize: 22,
                                        lineHeight: 1,
                                        letterSpacing: '-0.04em',
                                        border: `2px solid ${t.palette.divider}`,
                                        boxShadow: `3px 3px 0 0 ${t.palette.divider}`,
                                    })}
                                >
                                    X
                                </Box>
                                <Typography
                                    variant='h6'
                                    sx={{
                                        fontWeight: 800,
                                        letterSpacing: '-0.02em',
                                        color: 'text.primary',
                                    }}
                                >
                                    pense Master
                                </Typography>
                            </Stack>
                            <TabList
                                onChange={handleChange}
                                aria-label='primary navigation'
                                sx={{
                                    minHeight: 40,
                                    '& .MuiTabs-flexContainer': { gap: 0.5 },
                                    display: { xs: 'none', sm: 'flex' },
                                }}
                            >
                                {TAB_CONTENT.map((tab) => (
                                    <Tab key={tab.value} value={tab.value} label={tab.label} />
                                ))}
                            </TabList>
                        </Stack>
                        <Stack direction='row' alignItems='center' gap={1.25}>
                            <Tooltip title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
                                <IconButton onClick={theme} size='medium'>
                                    {isDarkMode ? <LightModeRounded /> : <DarkModeRounded />}
                                </IconButton>
                            </Tooltip>
                            <Tooltip title='Account'>
                                <IconButton
                                    onClick={handleMenuOpen}
                                    sx={{ p: 0, border: 'none', boxShadow: 'none', '&:hover': { transform: 'none', boxShadow: 'none' } }}
                                >
                                    <Avatar
                                        sx={(t) => ({
                                            height: 38,
                                            width: 38,
                                            fontSize: 16,
                                            boxShadow: `3px 3px 0 0 ${t.palette.divider}`,
                                        })}
                                    >
                                        {userInitial}
                                    </Avatar>
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    </Stack>

                    <Box sx={{ display: { xs: 'block', sm: 'none' }, mt: 1.5 }}>
                        <TabList
                            onChange={handleChange}
                            variant='scrollable'
                            allowScrollButtonsMobile
                            sx={{ minHeight: 40 }}
                        >
                            {TAB_CONTENT.map((tab) => (
                                <Tab key={tab.value} value={tab.value} label={tab.label} />
                            ))}
                        </TabList>
                    </Box>

                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    >
                        <Box sx={{ px: 1.5, py: 1 }}>
                            <Typography variant='subtitle2' sx={{ fontWeight: 800 }}>
                                {user || 'Guest'}
                            </Typography>
                            <Typography variant='caption' color='text.secondary'>
                                Signed in
                            </Typography>
                        </Box>
                        <Divider sx={{ my: 0.5 }} />
                        <MenuItem onClick={() => { navigate('/aboutus'); handleMenuClose(); }}>
                            <InfoOutlined fontSize='small' style={{ marginRight: 10 }} /> About us
                        </MenuItem>
                        <MenuItem onClick={handleChangePassword}>
                            <PasswordRounded fontSize='small' style={{ marginRight: 10 }} /> Change Password
                        </MenuItem>
                        <MenuItem
                            onClick={handleLogout}
                            sx={{
                                color: '#0a0a0a',
                                '&:hover': { backgroundColor: '#ef4444', color: '#fff' },
                            }}
                        >
                            <LogoutRounded fontSize='small' style={{ marginRight: 10 }} /> Logout
                        </MenuItem>
                    </Menu>
                </Card>

                {TAB_CONTENT.map((tab) => (
                    <TabPanel key={tab.value} value={tab.value} sx={{ p: 0, mb: 2 }}>
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: { xs: 'flex-start', sm: 'center' },
                                flexDirection: { xs: 'column', sm: 'row' },
                                gap: 1.5,
                                px: 0.5,
                            }}
                        >
                            <Box>
                                <Typography variant='h4' sx={{ fontWeight: 800 }}>
                                    {tab.label === 'Dashboard' && user
                                        ? `Welcome back, ${user}`
                                        : tab.label}
                                </Typography>
                                <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5, fontWeight: 600 }}>
                                    {TAB_SUBTITLES[tab.value]}
                                </Typography>
                            </Box>
                            {tab.label === 'Dashboard' && (
                                <Button
                                    variant='contained'
                                    color='primary'
                                    startIcon={<AddRounded />}
                                    onClick={handleCreateTransaction}
                                >
                                    New transaction
                                </Button>
                            )}
                        </Box>
                    </TabPanel>
                ))}
            </TabContext>
        </Box>
    );
}
