import React, { useState } from 'react';
import {
    Box,
    Card,
    CssBaseline,
    Stack,
    Tab,
    Tabs,
    ThemeProvider,
    Typography,
} from '@mui/material';
import { lightTheme } from '../_styles/CreateTheme';
import Login from './login';
import Register from './register';

type Mode = 'login' | 'register';

const LoginSignUp: React.FC = () => {
    const [mode, setMode] = useState<Mode>('login');

    return (
        <ThemeProvider theme={lightTheme}>
            <CssBaseline />
            <Box
                sx={{
                    minHeight: '100vh',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: { xs: 2, sm: 3 },
                }}
            >
                <Box sx={{ width: '100%', maxWidth: 440 }}>
                    {/* Branded header */}
                    <Stack direction='row' alignItems='center' gap={1.5} sx={{ mb: 3, justifyContent: 'center' }}>
                        <Box
                            sx={{
                                width: 48,
                                height: 48,
                                borderRadius: 1.5,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#fcd34d',
                                color: '#0a0a0a',
                                fontWeight: 900,
                                fontSize: 26,
                                lineHeight: 1,
                                letterSpacing: '-0.04em',
                                border: '2px solid #0a0a0a',
                                boxShadow: '3px 3px 0 0 #0a0a0a',
                            }}
                        >
                            X
                        </Box>
                        <Typography variant='h5' sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                            pense&nbsp;Master
                        </Typography>
                    </Stack>

                    <Card sx={{ p: 0, overflow: 'hidden' }}>
                        <Box
                            sx={{
                                p: 0.75,
                                backgroundColor: '#fef6e4',
                                borderBottom: '2px solid #0a0a0a',
                            }}
                        >
                            <Tabs
                                value={mode}
                                onChange={(_, v) => setMode(v)}
                                variant='fullWidth'
                                sx={{
                                    minHeight: 40,
                                    '& .MuiTabs-flexContainer': { gap: 0.5 },
                                    '& .MuiTab-root': { borderRadius: 1.5 },
                                }}
                            >
                                <Tab value='login' label='Login' />
                                <Tab value='register' label='Sign up' />
                            </Tabs>
                        </Box>
                        <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
                            {mode === 'login' ? (
                                <Login onSwitchToRegister={() => setMode('register')} />
                            ) : (
                                <Register onSwitchToLogin={() => setMode('login')} />
                            )}
                        </Box>
                    </Card>

                    <Typography
                        variant='caption'
                        align='center'
                        sx={{ display: 'block', mt: 2.5, fontWeight: 600, color: 'text.secondary' }}
                    >
                        Track expenses · Split with friends · Stay in control
                    </Typography>
                </Box>
            </Box>
        </ThemeProvider>
    );
};

export default LoginSignUp;
