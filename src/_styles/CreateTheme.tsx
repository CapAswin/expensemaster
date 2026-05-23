import { createTheme } from '@mui/material/styles';

// Neobrutalism palette
const PALETTE = {
    yellow: '#fcd34d',
    pink: '#ff6b9d',
    lime: '#bef264',
    sky: '#7dd3fc',
    coral: '#fb923c',
    red: '#ef4444',
    green: '#22c55e',
    blue: '#60a5fa',
    cream: '#fef6e4',
    paper: '#ffffff',
    ink: '#0a0a0a',
    darkBg: '#1a1a2e',
    darkPaper: '#252540',
    darkInk: '#fef6e4',
};

const typography = {
    fontFamily: `'Space Grotesk', 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif`,
    h1: { fontWeight: 800, letterSpacing: '-0.03em' },
    h2: { fontWeight: 800, letterSpacing: '-0.03em' },
    h3: { fontWeight: 800, letterSpacing: '-0.02em' },
    h4: { fontWeight: 800, letterSpacing: '-0.02em' },
    h5: { fontWeight: 700, letterSpacing: '-0.01em' },
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    body1: { fontWeight: 500 },
    body2: { fontWeight: 500 },
    button: { fontWeight: 700, textTransform: 'none' as const, letterSpacing: 0 },
};

const shape = { borderRadius: 12 };

// Generate MUI's required 25-entry shadows array using neobrutalism offset shadows
const makeShadows = (color: string) => {
    const arr: string[] = ['none'];
    for (let i = 1; i <= 24; i++) {
        const offset = Math.min(8, Math.max(2, Math.ceil(i / 3) + 1));
        arr.push(`${offset}px ${offset}px 0 0 ${color}`);
    }
    return arr as any;
};

const buildComponents = (mode: 'light' | 'dark') => {
    const isDark = mode === 'dark';
    const ink = isDark ? PALETTE.darkInk : PALETTE.ink;
    const bg = isDark ? PALETTE.darkBg : PALETTE.cream;
    const paper = isDark ? PALETTE.darkPaper : PALETTE.paper;
    const border = `2px solid ${ink}`;
    const shadow = (n = 4) => `${n}px ${n}px 0 0 ${ink}`;

    return {
        MuiCssBaseline: {
            styleOverrides: {
                ':root': { colorScheme: mode },
                body: {
                    backgroundColor: bg,
                    backgroundImage: `radial-gradient(${
                        isDark ? 'rgba(254,246,228,0.07)' : 'rgba(10,10,10,0.08)'
                    } 1.2px, transparent 1.2px)`,
                    backgroundSize: '22px 22px',
                    backgroundAttachment: 'fixed',
                    minHeight: '100vh',
                    color: ink,
                },
                '*::-webkit-scrollbar': { width: 12, height: 12 },
                '*::-webkit-scrollbar-track': { backgroundColor: bg },
                '*::-webkit-scrollbar-thumb': {
                    backgroundColor: ink,
                    border: `2px solid ${bg}`,
                    borderRadius: 0,
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    backgroundColor: paper,
                    border,
                    boxShadow: shadow(4),
                    borderRadius: 12,
                },
                elevation0: { boxShadow: 'none', border: 'none' },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    backgroundColor: paper,
                    border,
                    borderRadius: 14,
                    boxShadow: shadow(5),
                    transition: 'transform 120ms ease, box-shadow 120ms ease',
                },
            },
        },
        MuiButton: {
            defaultProps: { disableElevation: true, disableRipple: false },
            styleOverrides: {
                root: {
                    border,
                    borderRadius: 10,
                    paddingInline: 18,
                    paddingBlock: 8,
                    fontWeight: 700,
                    boxShadow: shadow(3),
                    transition: 'transform 80ms ease, box-shadow 80ms ease, background-color 120ms ease',
                    '&:hover': {
                        boxShadow: shadow(5),
                        transform: 'translate(-2px, -2px)',
                    },
                    '&:active': {
                        boxShadow: shadow(1),
                        transform: 'translate(2px, 2px)',
                    },
                    '&.Mui-disabled': {
                        opacity: 0.6,
                        border,
                        color: ink,
                    },
                },
                containedPrimary: {
                    backgroundColor: PALETTE.yellow,
                    color: PALETTE.ink,
                    '&:hover': {
                        backgroundColor: PALETTE.yellow,
                        boxShadow: shadow(5),
                        transform: 'translate(-2px, -2px)',
                    },
                },
                containedSecondary: {
                    backgroundColor: PALETTE.pink,
                    color: PALETTE.ink,
                    '&:hover': { backgroundColor: PALETTE.pink },
                },
                containedSuccess: {
                    backgroundColor: PALETTE.lime,
                    color: PALETTE.ink,
                    '&:hover': { backgroundColor: PALETTE.lime },
                },
                containedError: {
                    backgroundColor: PALETTE.red,
                    color: '#fff',
                    '&:hover': { backgroundColor: PALETTE.red },
                },
                containedInfo: {
                    backgroundColor: PALETTE.sky,
                    color: PALETTE.ink,
                    '&:hover': { backgroundColor: PALETTE.sky },
                },
                outlined: {
                    backgroundColor: paper,
                    color: ink,
                    '&:hover': {
                        backgroundColor: paper,
                        borderColor: ink,
                    },
                },
                text: {
                    border: 'none',
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: 'none',
                        transform: 'none',
                        backgroundColor: isDark ? 'rgba(254,246,228,0.08)' : 'rgba(10,10,10,0.06)',
                    },
                    '&:active': { boxShadow: 'none', transform: 'none' },
                },
            },
        },
        MuiIconButton: {
            styleOverrides: {
                root: {
                    border,
                    borderRadius: 10,
                    backgroundColor: paper,
                    boxShadow: shadow(3),
                    padding: 6,
                    transition: 'transform 80ms ease, box-shadow 80ms ease',
                    '&:hover': {
                        backgroundColor: paper,
                        boxShadow: shadow(4),
                        transform: 'translate(-1px, -1px)',
                    },
                    '&:active': {
                        boxShadow: shadow(1),
                        transform: 'translate(2px, 2px)',
                    },
                },
                sizeSmall: { padding: 4 },
            },
        },
        MuiTextField: {
            defaultProps: { variant: 'outlined' as const, size: 'small' as const },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    backgroundColor: paper,
                    borderRadius: 10,
                    boxShadow: `3px 3px 0 0 ${ink}`,
                    '& fieldset': { borderColor: `${ink} !important`, borderWidth: '2px !important' },
                    '&:hover fieldset': { borderColor: `${ink} !important` },
                    '&.Mui-focused fieldset': { borderColor: `${ink} !important`, borderWidth: '2px !important' },
                    '&.Mui-focused': { boxShadow: `4px 4px 0 0 ${ink}` },
                },
                input: { fontWeight: 500 },
            },
        },
        MuiInputLabel: {
            styleOverrides: {
                root: { fontWeight: 600, color: ink },
                asterisk: { color: PALETTE.red },
            },
        },
        MuiSelect: {
            styleOverrides: {
                outlined: { borderRadius: 10 },
            },
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    textTransform: 'none' as const,
                    fontWeight: 700,
                    minHeight: 40,
                    minWidth: 0,
                    padding: '6px 14px',
                    margin: '0 2px',
                    borderRadius: 10,
                    color: ink,
                    border: '2px solid transparent',
                    transition: 'all 120ms ease',
                    '&:hover': {
                        backgroundColor: isDark ? 'rgba(254,246,228,0.08)' : 'rgba(10,10,10,0.05)',
                        color: ink,
                    },
                    // Selected tab has a constant yellow bg, so force the text dark in both themes
                    '&.Mui-selected': {
                        color: '#0a0a0a',
                        backgroundColor: PALETTE.yellow,
                        border: `2px solid ${PALETTE.ink}`,
                        boxShadow: `3px 3px 0 0 ${PALETTE.ink}`,
                    },
                    '&.Mui-selected:hover': {
                        backgroundColor: PALETTE.yellow,
                        color: '#0a0a0a',
                    },
                },
            },
        },
        MuiTabs: {
            styleOverrides: {
                indicator: { display: 'none' },
                root: { minHeight: 40 },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    fontWeight: 700,
                    border,
                    boxShadow: `2px 2px 0 0 ${ink}`,
                    backgroundColor: paper,
                    color: ink,
                },
                colorPrimary: { backgroundColor: PALETTE.yellow },
                colorSecondary: { backgroundColor: PALETTE.pink },
                colorSuccess: { backgroundColor: PALETTE.lime, color: PALETTE.ink },
                colorError: { backgroundColor: PALETTE.red, color: '#fff' },
                colorWarning: { backgroundColor: PALETTE.coral, color: PALETTE.ink },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: 14,
                    backgroundImage: 'none',
                    backgroundColor: paper,
                    border,
                    boxShadow: shadow(8),
                },
            },
        },
        MuiMenu: {
            styleOverrides: {
                paper: {
                    borderRadius: 12,
                    marginTop: 8,
                    minWidth: 220,
                    border,
                    boxShadow: shadow(4),
                    backgroundColor: paper,
                },
                list: { padding: 6 },
            },
        },
        MuiMenuItem: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    margin: '2px 0',
                    fontSize: 14,
                    fontWeight: 600,
                    padding: '8px 12px',
                    '&:hover': {
                        backgroundColor: PALETTE.yellow,
                        color: PALETTE.ink,
                    },
                },
            },
        },
        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    backgroundColor: ink,
                    color: isDark ? PALETTE.ink : '#fff',
                    fontSize: 12,
                    fontWeight: 700,
                    borderRadius: 6,
                    padding: '6px 10px',
                    border: `2px solid ${ink}`,
                },
                arrow: { color: ink },
            },
        },
        MuiAvatar: {
            styleOverrides: {
                root: {
                    backgroundColor: PALETTE.pink,
                    color: PALETTE.ink,
                    fontWeight: 800,
                    border,
                },
            },
        },
        MuiLinearProgress: {
            styleOverrides: {
                root: {
                    height: 12,
                    border,
                    borderRadius: 4,
                    backgroundColor: paper,
                },
                bar: { backgroundColor: PALETTE.yellow },
            },
        },
        MuiDivider: {
            styleOverrides: {
                root: { borderColor: ink, borderBottomWidth: 2 },
            },
        },
        MuiCardContent: {
            styleOverrides: {
                root: { '&:last-child': { paddingBottom: 16 } },
            },
        },
        MuiAutocomplete: {
            styleOverrides: {
                paper: {
                    border,
                    boxShadow: shadow(4),
                    borderRadius: 10,
                },
                option: {
                    fontWeight: 600,
                    '&[aria-selected="true"]': {
                        backgroundColor: `${PALETTE.yellow} !important`,
                        color: PALETTE.ink,
                    },
                    '&.Mui-focused': {
                        backgroundColor: isDark ? 'rgba(254,246,228,0.08)' : 'rgba(10,10,10,0.05)',
                    },
                },
            },
        },
    };
};

const lightTheme = createTheme({
    palette: {
        mode: 'light',
        primary: { main: PALETTE.yellow, contrastText: PALETTE.ink },
        secondary: { main: PALETTE.pink, contrastText: PALETTE.ink },
        success: { main: PALETTE.lime, contrastText: PALETTE.ink },
        warning: { main: PALETTE.coral, contrastText: PALETTE.ink },
        error: { main: PALETTE.red, contrastText: '#fff' },
        info: { main: PALETTE.sky, contrastText: PALETTE.ink },
        background: { default: PALETTE.cream, paper: PALETTE.paper },
        text: { primary: PALETTE.ink, secondary: '#3f3f46' },
        divider: PALETTE.ink,
    },
    typography,
    shape,
    shadows: makeShadows(PALETTE.ink),
    components: buildComponents('light') as any,
});

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: { main: PALETTE.yellow, contrastText: PALETTE.ink },
        secondary: { main: PALETTE.pink, contrastText: PALETTE.ink },
        success: { main: PALETTE.lime, contrastText: PALETTE.ink },
        warning: { main: PALETTE.coral, contrastText: PALETTE.ink },
        error: { main: PALETTE.red, contrastText: '#fff' },
        info: { main: PALETTE.sky, contrastText: PALETTE.ink },
        background: { default: PALETTE.darkBg, paper: PALETTE.darkPaper },
        text: { primary: PALETTE.darkInk, secondary: '#cbd5e1' },
        divider: PALETTE.darkInk,
    },
    typography,
    shape,
    shadows: makeShadows(PALETTE.darkInk),
    components: buildComponents('dark') as any,
});

export { lightTheme, darkTheme };
