import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
    Button,
    IconButton,
    InputAdornment,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import {
    LockRounded,
    LoginRounded,
    PersonRounded,
    VisibilityOffRounded,
    VisibilityRounded,
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';

import axiosInstance from '../_utils/axios';
import { login } from '../redux/authSlice';
import { showSuccessSnackbar, showWarningSnackbar } from '../_components/snackbar/Snackbar';

interface LoginResponse {
    token: string;
}
interface LoginData {
    username: string;
    password: string;
}

const loginUser = async (data: LoginData): Promise<LoginResponse> => {
    const response = await axiosInstance.post<LoginResponse>('/api/login/', data);
    return response.data;
};

interface LoginProps {
    onSwitchToRegister?: () => void;
}

const Login: React.FC<LoginProps> = ({ onSwitchToRegister }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const dispatch = useDispatch();

    const mutation = useMutation<LoginResponse, unknown, LoginData>({
        mutationFn: loginUser,
        onSuccess: (data) => {
            dispatch(login({ isLoggedIn: true, token: data.token }));
            localStorage.setItem('token', data.token);
            showSuccessSnackbar('Welcome back!');
        },
        onError: (error: any) => {
            showWarningSnackbar(`Login failed: ${error.response?.data?.message || error.message}`);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.length) return showWarningSnackbar('Enter your username');
        if (!password.length) return showWarningSnackbar('Enter your password');
        mutation.mutate({ username, password });
    };

    return (
        <Stack component='form' onSubmit={handleSubmit} spacing={2}>
            <Stack spacing={0.5}>
                <Typography variant='h5' sx={{ fontWeight: 800 }}>
                    Welcome back
                </Typography>
                <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 600 }}>
                    Sign in to access your dashboard
                </Typography>
            </Stack>

            <TextField
                label='Username'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                fullWidth
                required
                autoComplete='username'
                InputProps={{
                    startAdornment: (
                        <InputAdornment position='start'>
                            <PersonRounded sx={{ fontSize: 18 }} />
                        </InputAdornment>
                    ),
                }}
            />
            <TextField
                label='Password'
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                required
                autoComplete='current-password'
                InputProps={{
                    startAdornment: (
                        <InputAdornment position='start'>
                            <LockRounded sx={{ fontSize: 18 }} />
                        </InputAdornment>
                    ),
                    endAdornment: (
                        <InputAdornment position='end'>
                            <IconButton
                                onClick={() => setShowPassword((p) => !p)}
                                edge='end'
                                size='small'
                                sx={{
                                    border: 'none',
                                    boxShadow: 'none',
                                    bgcolor: 'transparent',
                                    '&:hover': { boxShadow: 'none', transform: 'none', bgcolor: 'transparent' },
                                }}
                            >
                                {showPassword ? (
                                    <VisibilityOffRounded sx={{ fontSize: 18 }} />
                                ) : (
                                    <VisibilityRounded sx={{ fontSize: 18 }} />
                                )}
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
            />

            <Button
                type='submit'
                variant='contained'
                color='primary'
                fullWidth
                size='large'
                startIcon={<LoginRounded />}
                disabled={mutation.status === 'pending'}
                sx={{ mt: 1 }}
            >
                {mutation.status === 'pending' ? 'Signing in…' : 'Sign in'}
            </Button>

            {onSwitchToRegister && (
                <Typography
                    variant='body2'
                    align='center'
                    sx={{ fontWeight: 600, color: 'text.secondary', mt: 1 }}
                >
                    New here?{' '}
                    <Typography
                        component='span'
                        onClick={onSwitchToRegister}
                        sx={{
                            fontWeight: 800,
                            color: 'text.primary',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            textUnderlineOffset: 3,
                            '&:hover': { color: '#0a0a0a', backgroundColor: '#fcd34d', px: 0.5 },
                        }}
                    >
                        Create an account
                    </Typography>
                </Typography>
            )}
        </Stack>
    );
};

export default Login;
