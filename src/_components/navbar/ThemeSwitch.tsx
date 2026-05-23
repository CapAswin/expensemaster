import React from 'react';
import { Box } from '@mui/material';
import { DarkModeRounded, LightModeRounded } from '@mui/icons-material';

interface ThemeSwitchProps {
    checked: boolean;
    onChange: () => void;
}

const TRACK_W = 64;
const TRACK_H = 32;
const THUMB = 24;
const INSET = 1;

const ThemeSwitch: React.FC<ThemeSwitchProps> = ({ checked, onChange }) => {
    const handleKey = (e: React.KeyboardEvent) => {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            onChange();
        }
    };

    return (
        <Box
            role='switch'
            aria-checked={checked}
            aria-label='Toggle dark mode'
            tabIndex={0}
            onClick={onChange}
            onKeyDown={handleKey}
            sx={(t) => ({
                position: 'relative',
                flexShrink: 0,
                width: TRACK_W,
                height: TRACK_H,
                borderRadius: '10px',
                border: `2px solid ${t.palette.divider}`,
                boxShadow: `3px 3px 0 0 ${t.palette.divider}`,
                backgroundColor: checked ? '#1a1a2e' : '#fef6e4',
                cursor: 'pointer',
                outline: 'none',
                userSelect: 'none',
                WebkitTapHighlightColor: 'transparent',
                transition:
                    'background-color 220ms ease, transform 80ms ease, box-shadow 80ms ease',
                '&:hover': {
                    transform: 'translate(-1px, -1px)',
                    boxShadow: `4px 4px 0 0 ${t.palette.divider}`,
                },
                '&:active': {
                    transform: 'translate(2px, 2px)',
                    boxShadow: `1px 1px 0 0 ${t.palette.divider}`,
                },
                '&:focus-visible': {
                    outline: `2px solid ${t.palette.divider}`,
                    outlineOffset: 3,
                },
            })}
        >
            <Box
                sx={(t) => ({
                    position: 'absolute',
                    top: INSET,
                    left: checked ? TRACK_W - THUMB - INSET - 4 : INSET,
                    width: THUMB,
                    height: THUMB,
                    borderRadius: '6px',
                    backgroundColor: checked ? '#7dd3fc' : '#fcd34d',
                    border: `2px solid ${t.palette.divider}`,
                    boxShadow: `2px 2px 0 0 ${t.palette.divider}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition:
                        'left 240ms cubic-bezier(0.34, 1.56, 0.64, 1), background-color 200ms ease',
                    pointerEvents: 'none',
                })}
            >
                {checked ? (
                    <LightModeRounded sx={{ fontSize: 14, color: '#0a0a0a' }} />
                ) : (
                    <DarkModeRounded sx={{ fontSize: 14, color: '#0a0a0a' }} />
                )}
            </Box>
        </Box>
    );
};

export default ThemeSwitch;
