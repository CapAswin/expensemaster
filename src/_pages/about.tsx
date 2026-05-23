import React from 'react';
import { Box, Typography, Card, CardContent, Grid, Stack, Button } from '@mui/material';
import {
    AccountBalanceWalletRounded,
    CategoryRounded,
    EmailRounded,
    InsightsRounded,
    LockRounded,
    TrendingUpRounded,
} from '@mui/icons-material';

const FEATURES = [
    {
        icon: <AccountBalanceWalletRounded />,
        color: '#fcd34d',
        title: 'Daily tracking',
        body: 'Log income & expenses with a single tap. Never lose sight of where your money goes.',
    },
    {
        icon: <CategoryRounded />,
        color: '#bef264',
        title: 'Smart categories',
        body: 'Organize transactions into custom categories and instantly spot spending patterns.',
    },
    {
        icon: <InsightsRounded />,
        color: '#7dd3fc',
        title: 'Visual reports',
        body: 'Beautiful charts turn raw numbers into stories you can act on.',
    },
    {
        icon: <TrendingUpRounded />,
        color: '#ff6b9d',
        title: 'Budget goals',
        body: 'Set monthly targets and watch your progress with real-time indicators.',
    },
    {
        icon: <LockRounded />,
        color: '#fb923c',
        title: 'Secure by design',
        body: 'Your data stays yours. Encryption and best practices throughout.',
    },
    {
        icon: <EmailRounded />,
        color: '#c4b5fd',
        title: 'Stay in touch',
        body: 'Questions or ideas? Reach us anytime and we’ll get back fast.',
    },
];

const AboutUs: React.FC = () => {
    return (
        <Stack spacing={2.5}>
            {/* Hero */}
            <Card sx={{ overflow: 'hidden' }}>
                <Box
                    sx={(t) => ({
                        p: { xs: 3, sm: 5 },
                        background: `repeating-linear-gradient(135deg, #fcd34d 0px, #fcd34d 18px, #fef6e4 18px, #fef6e4 36px)`,
                        borderBottom: `2px solid ${t.palette.divider}`,
                    })}
                >
                    <Box
                        sx={(t) => ({
                            display: 'inline-block',
                            backgroundColor: '#ff6b9d',
                            color: '#0a0a0a',
                            fontWeight: 800,
                            fontSize: 12,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            px: 1.25,
                            py: 0.5,
                            border: `2px solid ${t.palette.divider}`,
                            boxShadow: `3px 3px 0 0 ${t.palette.divider}`,
                            borderRadius: 1,
                            mb: 2,
                        })}
                    >
                        About us
                    </Box>
                    <Typography
                        variant='h3'
                        sx={{
                            fontWeight: 900,
                            color: '#0a0a0a',
                            maxWidth: 700,
                            lineHeight: 1.05,
                            mb: 2,
                        }}
                    >
                        Money management,<br />without the boring bits.
                    </Typography>
                    <Typography
                        variant='body1'
                        sx={{ fontWeight: 600, color: '#0a0a0a', maxWidth: 640 }}
                    >
                        ExpenseMaster helps individuals and families take control of their finances with
                        an interface that's fast, friendly, and actually fun to use.
                    </Typography>
                </Box>
            </Card>

            {/* Features */}
            <Box>
                <Typography variant='h5' sx={{ fontWeight: 800, mb: 2 }}>
                    What you can do
                </Typography>
                <Grid container spacing={2}>
                    {FEATURES.map((f) => (
                        <Grid item xs={12} sm={6} md={4} key={f.title}>
                            <Card sx={{ height: '100%' }}>
                                <CardContent sx={{ p: 2.5 }}>
                                    <Box
                                        sx={(t) => ({
                                            width: 48,
                                            height: 48,
                                            borderRadius: 1.5,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backgroundColor: f.color,
                                            color: '#0a0a0a',
                                            border: `2px solid ${t.palette.divider}`,
                                            boxShadow: `3px 3px 0 0 ${t.palette.divider}`,
                                            mb: 1.5,
                                        })}
                                    >
                                        {f.icon}
                                    </Box>
                                    <Typography variant='subtitle1' sx={{ fontWeight: 800, mb: 0.5 }}>
                                        {f.title}
                                    </Typography>
                                    <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 500 }}>
                                        {f.body}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>

            {/* Contact */}
            <Card>
                <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                        justifyContent='space-between'
                        gap={2}
                    >
                        <Box>
                            <Typography variant='h6' sx={{ fontWeight: 800, mb: 0.5 }}>
                                Got feedback?
                            </Typography>
                            <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 500 }}>
                                We read every message. Let us know what would make your tracking even better.
                            </Typography>
                        </Box>
                        <Button
                            variant='contained'
                            color='primary'
                            startIcon={<EmailRounded />}
                            href='mailto:support@expensemaster.com'
                        >
                            support@expensemaster.com
                        </Button>
                    </Stack>
                </CardContent>
            </Card>
        </Stack>
    );
};

export default AboutUs;
