import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
    Button,
    IconButton,
    InputAdornment,
    LinearProgress,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import {
    EmailRounded,
    HowToRegRounded,
    LockRounded,
    PersonRounded,
    VisibilityOffRounded,
    VisibilityRounded,
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';

import axiosInstance from '../_utils/axios';
import { loginWithRegister } from '../redux/authSlice';
import { showSuccessSnackbar, showWarningSnackbar } from '../_components/snackbar/Snackbar';

interface User {
    email: string;
    username: string;
}
interface RegisterResponse {
    token: string;
    user: User;
}
interface RegisterData {
    email: string;
    password: string;
    username: string;
}

const registerUser = async (data: RegisterData): Promise<RegisterResponse> => {
    const response = await axiosInstance.post<RegisterResponse>('api/register/', data);
    return response.data;
};

const passwordStrength = (pwd: string): { score: number; label: string; color: string } => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (pwd.length === 0) return { score: 0, label: '', color: '#9ca3af' };
    if (score <= 1) return { score: 20, label: 'Weak', color: '#ef4444' };
    if (score === 2) return { score: 45, label: 'Okay', color: '#fb923c' };
    if (score === 3) return { score: 70, label: 'Good', color: '#fcd34d' };
    return { score: 100, label: 'Strong', color: '#22c55e' };
};

interface RegisterProps {
    onSwitchToLogin?: () => void;
}

const Register: React.FC<RegisterProps> = ({ onSwitchToLogin }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const mutation = useMutation<RegisterResponse, unknown, RegisterData>({
        mutationFn: registerUser,
        onSuccess: (data) => {
            dispatch(
                loginWithRegister({
                    username: data.user.username,
                    email: data.user.email,
                    isLoggedIn: true,
                    token: data.token,
                }),
            );
            localStorage.setItem('token', data.token);
            showSuccessSnackbar('Account created!');
            navigate(location.pathname + location.search || '/');
        },
        onError: (error: any) => {
            const errorResponse = error.response as { data: { [key: string]: string[] } };
            if (errorResponse) {
                const firstKey = Object.keys(errorResponse.data)[0];
                const msg = errorResponse.data[firstKey]?.[0] || 'Registration failed.';
                showWarningSnackbar(`Error: ${msg}`);
            } else {
                showWarningSnackbar('Registration failed. Please try again.');
            }
        },
    });

    const strength = passwordStrength(password);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!username.length) return showWarningSnackbar('Enter a username');
        if (!email.length) return showWarningSnackbar('Enter your email');
        if (!emailRegex.test(email)) return showWarningSnackbar('Enter a valid email');
        if (password.length < 8) return showWarningSnackbar('Password must be at least 8 characters');
        if (password !== confirmPassword) return showWarningSnackbar('Passwords do not match');
        mutation.mutate({ email, password, username });
    };

    return (
        <Stack component='form' onSubmit={handleSubmit} spacing={2}>
            <Stack spacing={0.5}>
                <Typography variant='h5' sx={{ fontWeight: 800 }}>
                    Create your account
                </Typography>
                <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 600 }}>
                    Takes less than a minute
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
                label='Email'
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                required
                autoComplete='email'
                InputProps={{
                    startAdornment: (
                        <InputAdornment position='start'>
                            <EmailRounded sx={{ fontSize: 18 }} />
                        </InputAdornment>
                    ),
                }}
            />
            <Stack spacing={0.75}>
                <TextField
                    label='Password'
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    fullWidth
                    required
                    autoComplete='new-password'
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
                {password.length > 0 && (
                    <Stack direction='row' alignItems='center' spacing={1}>
                        <LinearProgress
                            variant='determinate'
                            value={strength.score}
                            sx={{
                                flex: 1,
                                '& .MuiLinearProgress-bar': { backgroundColor: strength.color },
                            }}
                        />
                        <Typography variant='caption' sx={{ fontWeight: 700, color: strength.color, minWidth: 50 }}>
                            {strength.label}
                        </Typography>
                    </Stack>
                )}
            </Stack>
            <TextField
                label='Confirm password'
                type='password'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                fullWidth
                required
                autoComplete='new-password'
                error={confirmPassword.length > 0 && confirmPassword !== password}
                helperText={
                    confirmPassword.length > 0 && confirmPassword !== password
                        ? "Passwords don't match"
                        : ' '
                }
                InputProps={{
                    startAdornment: (
                        <InputAdornment position='start'>
                            <LockRounded sx={{ fontSize: 18 }} />
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
                startIcon={<HowToRegRounded />}
                disabled={mutation.status === 'pending'}
            >
                {mutation.status === 'pending' ? 'Creating account…' : 'Create account'}
            </Button>

            {onSwitchToLogin && (
                <Typography
                    variant='body2'
                    align='center'
                    sx={{ fontWeight: 600, color: 'text.secondary', mt: 1 }}
                >
                    Already have an account?{' '}
                    <Typography
                        component='span'
                        onClick={onSwitchToLogin}
                        sx={{
                            fontWeight: 800,
                            color: 'text.primary',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            textUnderlineOffset: 3,
                            '&:hover': { color: '#0a0a0a', backgroundColor: '#fcd34d', px: 0.5 },
                        }}
                    >
                        Sign in
                    </Typography>
                </Typography>
            )}
        </Stack>
    );
};

export default Register;
