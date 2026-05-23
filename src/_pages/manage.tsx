import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../_utils/axios';
import {
    Box,
    Button,
    Grid,
    Card,
    Typography,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    CardContent,
    IconButton,
    Tooltip,
    Stack,
    Skeleton,
    Alert,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import { useDispatch } from 'react-redux';
import { openCreateCategory } from '../redux/modalSlice';
import { CategoryData } from './createCategory';

interface Category {
    id: number;
    Name: string;
    Description: string;
    UserID: string;
    TransactionDate: string;
}

const CARD_COLORS = ['#fcd34d', '#ff6b9d', '#bef264', '#7dd3fc', '#fb923c', '#c4b5fd'];

const fetchCategories = async (): Promise<Category[]> => {
    const response = await axiosInstance.get('api/categories/');
    return response.data;
};

const deleteCategory = async (id: number): Promise<void> => {
    await axiosInstance.delete(`api/removeCategory/${id}`);
};

const Manage: React.FC = () => {
    const queryClient = useQueryClient();
    const dispatch = useDispatch();
    const { data: categories, error, isLoading } = useQuery<Category[]>({
        queryKey: ['categories'],
        queryFn: fetchCategories,
    });

    const [open, setOpen] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

    const handleDelete = async (id: number) => {
        await deleteCategory(id);
        queryClient.invalidateQueries({ queryKey: ['categories'] });
        setOpen(false);
    };

    const handleOpenDialog = (id: number) => {
        setSelectedCategoryId(id);
        setOpen(true);
    };

    const handleCloseDialog = () => setOpen(false);

    const handleEdit = (id: number, e: CategoryData) =>
        dispatch(openCreateCategory({ open: true, id, data: e }));

    const handelCreateCategory = () =>
        dispatch(openCreateCategory({ open: true, id: null, data: null }));

    return (
        <Card>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent='space-between'
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    gap={1.5}
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
                                backgroundColor: '#bef264',
                                border: `2px solid ${t.palette.divider}`,
                                boxShadow: `3px 3px 0 0 ${t.palette.divider}`,
                                color: '#0a0a0a',
                            })}
                        >
                            <CategoryRoundedIcon />
                        </Box>
                        <Box>
                            <Typography variant='h6' sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                                Categories
                            </Typography>
                            <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 600 }}>
                                {categories?.length ?? 0} total
                            </Typography>
                        </Box>
                    </Stack>
                    <Button
                        onClick={handelCreateCategory}
                        variant='contained'
                        color='primary'
                        startIcon={<AddRoundedIcon />}
                    >
                        Create category
                    </Button>
                </Stack>

                {error ? (
                    <Alert severity='error'>Couldn't load categories.</Alert>
                ) : isLoading ? (
                    <Grid container spacing={2}>
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                                <Skeleton variant='rounded' height={140} />
                            </Grid>
                        ))}
                    </Grid>
                ) : categories && categories.length > 0 ? (
                    <Grid container spacing={2}>
                        {categories.map((category, idx) => {
                            const bg = CARD_COLORS[idx % CARD_COLORS.length];
                            return (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={category.id}>
                                    <Card
                                        sx={{
                                            height: '100%',
                                            backgroundColor: bg,
                                            color: '#0a0a0a',
                                            '&:hover': {
                                                transform: 'translate(-2px, -2px)',
                                                boxShadow: (t) => `7px 7px 0 0 ${t.palette.divider}`,
                                            },
                                        }}
                                    >
                                        <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
                                            <Stack direction='row' justifyContent='space-between' alignItems='flex-start'>
                                                <Typography
                                                    variant='subtitle1'
                                                    sx={{ fontWeight: 800, wordBreak: 'break-word', pr: 1 }}
                                                >
                                                    {category.Name}
                                                </Typography>
                                                <Stack direction='row' spacing={0.75}>
                                                    <Tooltip title='Edit'>
                                                        <IconButton
                                                            size='small'
                                                            onClick={() => handleEdit(category.id, category)}
                                                            sx={{
                                                                bgcolor: '#fff',
                                                                color: '#0a0a0a',
                                                                border: '2px solid #0a0a0a',
                                                                boxShadow: '2px 2px 0 0 #0a0a0a',
                                                                width: 32,
                                                                height: 32,
                                                                '&:hover': {
                                                                    bgcolor: '#7dd3fc',
                                                                    color: '#0a0a0a',
                                                                },
                                                            }}
                                                        >
                                                            <EditRoundedIcon sx={{ fontSize: 16 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title='Delete'>
                                                        <IconButton
                                                            size='small'
                                                            onClick={() => handleOpenDialog(category.id)}
                                                            sx={{
                                                                bgcolor: '#fff',
                                                                color: '#0a0a0a',
                                                                border: '2px solid #0a0a0a',
                                                                boxShadow: '2px 2px 0 0 #0a0a0a',
                                                                width: 32,
                                                                height: 32,
                                                                '&:hover': {
                                                                    bgcolor: '#ef4444',
                                                                    color: '#fff',
                                                                },
                                                            }}
                                                        >
                                                            <DeleteRoundedIcon sx={{ fontSize: 16 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Stack>
                                            </Stack>
                                            <Typography
                                                variant='body2'
                                                sx={{ fontWeight: 600, mt: 1.25, color: 'rgba(10,10,10,0.75)' }}
                                            >
                                                {category.Description || 'No description'}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>
                ) : (
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
                            No categories yet
                        </Typography>
                        <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                            Create your first category to organize transactions.
                        </Typography>
                        <Button
                            onClick={handelCreateCategory}
                            variant='contained'
                            color='primary'
                            startIcon={<AddRoundedIcon />}
                        >
                            Create category
                        </Button>
                    </Box>
                )}
            </CardContent>

            <Dialog open={open} onClose={handleCloseDialog} maxWidth='xs' fullWidth>
                <DialogTitle sx={{ fontWeight: 800 }}>Confirm deletion</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ fontWeight: 500 }}>
                        Are you sure you want to delete this category? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleCloseDialog} variant='outlined'>
                        Cancel
                    </Button>
                    <Button
                        onClick={() => selectedCategoryId !== null && handleDelete(selectedCategoryId)}
                        variant='contained'
                        color='error'
                        autoFocus
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
};

export default Manage;
