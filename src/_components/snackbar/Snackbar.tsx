import React, { forwardRef, useCallback, useEffect, useState } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Fade from '@mui/material/Fade';
import { Box, IconButton, Typography } from '@mui/material';
import type { AlertColor } from '@mui/material/Alert';
import {
    CheckCircleRounded,
    CloseRounded,
    ErrorOutlineRounded,
    InfoOutlined,
    WarningAmberRounded,
} from '@mui/icons-material';

const INK = '#0a0a0a';
const PAPER = '#ffffff';

const SNACKBAR_PALETTE: Record<AlertColor, { bg: string; color: string }> = {
    success: { bg: '#bef264', color: INK },
    error: { bg: '#ef4444', color: '#ffffff' },
    warning: { bg: '#fb923c', color: INK },
    info: { bg: '#7dd3fc', color: INK },
};

type SnackbarPosition = {
    vertical: 'top' | 'bottom';
    horizontal: 'left' | 'center' | 'right';
};

type SnackbarRefType = {
    showSuccess: (
        message: string,
        horizontal?: SnackbarPosition['horizontal'],
        vertical?: SnackbarPosition['vertical'],
    ) => void;
    showError: (
        message: string,
        horizontal?: SnackbarPosition['horizontal'],
        vertical?: SnackbarPosition['vertical'],
    ) => void;
    showWarning: (
        message: string,
        horizontal?: SnackbarPosition['horizontal'],
        vertical?: SnackbarPosition['vertical'],
    ) => void;
    handleClose: () => void;
} | null;

let snackbarRef: SnackbarRefType = null;

const AUTO_HIDE_MS = 5000;

function SeverityIcon({ severity }: { severity: AlertColor }) {
    const sx = { fontSize: 26, color: 'inherit' };
    switch (severity) {
        case 'success':
            return <CheckCircleRounded sx={sx} />;
        case 'error':
            return <ErrorOutlineRounded sx={sx} />;
        case 'warning':
            return <WarningAmberRounded sx={sx} />;
        default:
            return <InfoOutlined sx={sx} />;
    }
}

/** Must forward ref — MUI Snackbar transition attaches ref to this root node. */
const BrutalistSnackbarContent = forwardRef<
    HTMLDivElement,
    {
        message: string;
        severity: AlertColor;
        onClose: () => void;
    }
>(function BrutalistSnackbarContent({ message, severity, onClose }, ref) {
    const colors = SNACKBAR_PALETTE[severity];

    return (
        <Box
            ref={ref}
            role='alert'
            sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.25,
                px: 2,
                py: 1.5,
                minWidth: { xs: 'calc(100vw - 32px)', sm: 320 },
                maxWidth: 480,
                backgroundColor: colors.bg,
                color: colors.color,
                border: `2px solid ${INK}`,
                borderRadius: '12px',
                boxShadow: `4px 4px 0 0 ${INK}`,
                fontFamily: `'Space Grotesk', 'Inter', system-ui, sans-serif`,
            }}
        >
            <Box sx={{ pt: 0.25, flexShrink: 0, display: 'flex' }}>
                <SeverityIcon severity={severity} />
            </Box>
            <Typography
                sx={{
                    flex: 1,
                    fontWeight: 700,
                    fontSize: 14,
                    lineHeight: 1.45,
                    color: 'inherit',
                    wordBreak: 'break-word',
                }}
            >
                {message}
            </Typography>
            <IconButton
                size='small'
                aria-label='Dismiss'
                onClick={onClose}
                sx={{
                    flexShrink: 0,
                    mt: -0.25,
                    mr: -0.5,
                    width: 32,
                    height: 32,
                    bgcolor: PAPER,
                    color: INK,
                    border: `2px solid ${INK}`,
                    borderRadius: '10px',
                    boxShadow: `2px 2px 0 0 ${INK}`,
                    transition: 'transform 80ms ease, box-shadow 80ms ease, background-color 120ms ease',
                    '&:hover': {
                        bgcolor: '#ef4444',
                        color: '#fff',
                        boxShadow: `3px 3px 0 0 ${INK}`,
                        transform: 'translate(-1px, -1px)',
                    },
                    '&:active': {
                        boxShadow: `1px 1px 0 0 ${INK}`,
                        transform: 'translate(1px, 1px)',
                    },
                }}
            >
                <CloseRounded sx={{ fontSize: 18 }} />
            </IconButton>
        </Box>
    );
});

function SnackbarComponent() {
    const [open, setOpen] = useState(false);
    const [text, setText] = useState('');
    const [severity, setSeverity] = useState<AlertColor>('success');
    const [position, setPosition] = useState<SnackbarPosition>({
        vertical: 'bottom',
        horizontal: 'center',
    });

    const handleClose = useCallback(() => {
        setOpen(false);
    }, []);

    const handleOpen = useCallback(
        (
            message: string,
            horizontal: SnackbarPosition['horizontal'] = 'center',
            vertical: SnackbarPosition['vertical'] = 'bottom',
            type: AlertColor = 'success',
        ) => {
            setText(message);
            setSeverity(type);
            setPosition({ vertical, horizontal });
            setOpen(true);
        },
        [],
    );

    useEffect(() => {
        snackbarRef = {
            showSuccess: (message, horizontal, vertical) =>
                handleOpen(message, horizontal, vertical, 'success'),
            showError: (message, horizontal, vertical) =>
                handleOpen(message, horizontal, vertical, 'error'),
            showWarning: (message, horizontal, vertical) =>
                handleOpen(message, horizontal, vertical, 'warning'),
            handleClose,
        };
        return () => {
            snackbarRef = null;
        };
    }, [handleClose, handleOpen]);

    return (
        <Snackbar
            anchorOrigin={position}
            open={open}
            autoHideDuration={AUTO_HIDE_MS}
            onClose={(_, reason) => {
                if (reason === 'clickaway') return;
                handleClose();
            }}
            TransitionComponent={Fade}
            TransitionProps={{ timeout: { enter: 220, exit: 180 } }}
            sx={{
                zIndex: (theme) => theme.zIndex.snackbar + 1,
                '& .MuiSnackbarContent-root': { p: 0, bgcolor: 'transparent', boxShadow: 'none' },
                ...(position.vertical === 'bottom' && {
                    bottom: { xs: 20, sm: 28 },
                }),
                ...(position.vertical === 'top' && {
                    top: { xs: 20, sm: 28 },
                }),
            }}
        >
            <BrutalistSnackbarContent message={text} severity={severity} onClose={handleClose} />
        </Snackbar>
    );
}

export function showSuccessSnackbar(
    message: string,
    horizontal: SnackbarPosition['horizontal'] = 'center',
    vertical: SnackbarPosition['vertical'] = 'bottom',
) {
    snackbarRef?.showSuccess(message, horizontal, vertical);
}

export function showErrorSnackbar(
    message: string,
    horizontal: SnackbarPosition['horizontal'] = 'center',
    vertical: SnackbarPosition['vertical'] = 'bottom',
) {
    snackbarRef?.showError(message, horizontal, vertical);
}

export function showWarningSnackbar(
    message: string,
    horizontal: SnackbarPosition['horizontal'] = 'center',
    vertical: SnackbarPosition['vertical'] = 'bottom',
) {
    snackbarRef?.showWarning(message, horizontal, vertical);
}

export function closeSnackbar() {
    snackbarRef?.handleClose();
}

export default SnackbarComponent;
