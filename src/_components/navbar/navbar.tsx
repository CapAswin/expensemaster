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
    InfoOutlined,
    LogoutRounded,
    PasswordRounded,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';

import axiosInstance from '../../_utils/axios';
import { persistor, RootState } from '../../redux/store';
import { showSuccessSnackbar } from '../snackbar/Snackbar';
import { openChangePassword, openCreateTransactinModal } from '../../redux/modalSlice';
import ThemeSwitch from './ThemeSwitch';

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
                    elevation={0}
                    sx={(t) => ({
                        mb: { xs: 3, sm: 4 },
                        px: { xs: 2, sm: 3, md: 3.5 },
                        py: { xs: 1.75, sm: 2 },
                        borderRadius: 3,
                        border: `2px solid ${t.palette.divider}`,
                        boxShadow: `5px 5px 0 0 ${t.palette.divider}`,
                        backgroundColor: t.palette.background.paper,
                    })}
                >
                    <Stack
                        direction='row'
                        alignItems='center'
                        justifyContent='space-between'
                        gap={2}
                    >
                        {/* Brand */}
                        <Stack direction='row' alignItems='center' gap={1.25} sx={{ flexShrink: 0 }}>
                            <Box
                                sx={(t) => ({
                                    width: 42,
                                    height: 42,
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
                                    display: { xs: 'none', sm: 'block' },
                                    lineHeight: 1,
                                }}
                            >
                                pense&nbsp;Master
                            </Typography>
                        </Stack>

                        {/* Tabs (centered on md+) */}
                        <Box
                            sx={{
                                flex: 1,
                                display: { xs: 'none', md: 'flex' },
                                justifyContent: 'center',
                            }}
                        >
                            <TabList
                                onChange={handleChange}
                                aria-label='primary navigation'
                                sx={{
                                    minHeight: 40,
                                    '& .MuiTabs-flexContainer': { gap: 1.5 },
                                }}
                            >
                                {TAB_CONTENT.map((tab) => (
                                    <Tab key={tab.value} value={tab.value} label={tab.label} />
                                ))}
                            </TabList>
                        </Box>

                        {/* Actions */}
                        <Stack direction='row' alignItems='center' gap={1.25} sx={{ flexShrink: 0 }}>
                            <Tooltip title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
                                <Box sx={{ display: 'flex' }}>
                                    <ThemeSwitch checked={isDarkMode} onChange={theme} />
                                </Box>
                            </Tooltip>
                            <Tooltip title='Account'>
                                <IconButton
                                    onClick={handleMenuOpen}
                                    sx={{
                                        p: 0,
                                        border: 'none',
                                        boxShadow: 'none',
                                        backgroundColor: 'transparent',
                                        '&:hover': {
                                            transform: 'none',
                                            boxShadow: 'none',
                                            backgroundColor: 'transparent',
                                        },
                                        '&:active': { transform: 'none', boxShadow: 'none' },
                                    }}
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

                    {/* Mobile/Tablet tabs row */}
                    <Box sx={{ display: { xs: 'block', md: 'none' }, mt: 1.5 }}>
                        <TabList
                            onChange={handleChange}
                            variant='scrollable'
                            allowScrollButtonsMobile
                            sx={{
                                minHeight: 40,
                                '& .MuiTabs-flexContainer': { gap: 1 },
                            }}
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
                                color: 'text.primary',
                                '&:hover': { backgroundColor: '#ef4444', color: '#fff' },
                            }}
                        >
                            <LogoutRounded fontSize='small' style={{ marginRight: 10 }} /> Logout
                        </MenuItem>
                    </Menu>
                </Card>

                {TAB_CONTENT.map((tab) => (
                    <TabPanel
                        key={tab.value}
                        value={tab.value}
                        sx={{ p: 0, mb: { xs: 2.5, sm: 3.5 } }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: { xs: 'flex-start', sm: 'center' },
                                flexDirection: { xs: 'column', sm: 'row' },
                                gap: 2,
                                px: { xs: 0.5, sm: 1 },
                                py: { xs: 0.5, sm: 1 },
                            }}
                        >
                            <Box sx={{ minWidth: 0 }}>
                                <Typography variant='h4' sx={{ fontWeight: 800, lineHeight: 1.15 }}>
                                    {tab.label === 'Dashboard' && user
                                        ? `Welcome back, ${user}`
                                        : tab.label}
                                </Typography>
                                <Typography
                                    variant='body2'
                                    color='text.secondary'
                                    sx={{ mt: 0.75, fontWeight: 600 }}
                                >
                                    {TAB_SUBTITLES[tab.value]}
                                </Typography>
                            </Box>
                            {tab.label === 'Dashboard' && (
                                <Button
                                    variant='contained'
                                    color='primary'
                                    startIcon={<AddRounded />}
                                    onClick={handleCreateTransaction}
                                    sx={{ flexShrink: 0 }}
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
