import React, { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../_utils/axios';
import {
    TextField,
    Button,
    Box,
    Typography,
    Modal,
    Card,
    Stack,
    IconButton,
    Divider,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { showSuccessSnackbar, showWarningSnackbar } from '../_components/snackbar/Snackbar';
import { openCreateCategory } from '../redux/modalSlice';
import { RootState } from '../redux/store';
import { CloseRounded } from '@mui/icons-material';

export interface CategoryData {
    id?: number | null;
    Description: string;
    Name: string;
    TransactionDate: string;
}

const addCategory = async (category: CategoryData): Promise<void> => {
    await axiosInstance.post('api/insertCategory/', category);
};
const updateCategory = async (category: CategoryData): Promise<void> => {
    await axiosInstance.put('api/updateCategory/', category);
};

const CreateCategory: React.FC = () => {
    const [description, setDescription] = useState<string>('');
    const [name, setName] = useState<string>('');
    const open = useSelector((state: RootState) => state.modal.createCategory);
    const queryClient = useQueryClient();
    const dispatch = useDispatch();

    const mutation = useMutation<void, unknown, CategoryData>({
        mutationFn: open.id == null ? addCategory : updateCategory,
        onSuccess: () => {
            showSuccessSnackbar(`Category ${open.id == null ? 'added' : 'updated'} successfully!`);
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            handleClose();
        },
        onError: (error: any) => {
            showWarningSnackbar(
                `Failed to save category: ${error.response?.data?.message || error.message}`,
            );
        },
    });

    const handleClose = () => dispatch(openCreateCategory({ open: false, id: null, data: null }));

    const handleAddCategory = (e: React.FormEvent) => {
        e.preventDefault();
        const currentDate = new Date().toISOString().split('T')[0];
        const payload: CategoryData = {
            Description: description,
            Name: name,
            TransactionDate: currentDate,
        };
        if (open.id != null) payload.id = open.id;
        mutation.mutate(payload);
    };

    useEffect(() => {
        if (open) {
            setDescription(open.data?.Description ?? '');
            setName(open.data?.Name ?? '');
        }
    }, [open]);

    const isUpdate = open.id != null;

    return (
        <Modal open={open.open} onClose={handleClose}>
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: { xs: 'calc(100% - 32px)', sm: 440 },
                    maxWidth: '100%',
                }}
            >
                <Card sx={{ p: 0 }}>
                    <Stack
                        direction='row'
                        justifyContent='space-between'
                        alignItems='center'
                        sx={(t) => ({
                            px: 2.5,
                            py: 1.5,
                            backgroundColor: '#bef264',
                            borderBottom: `2px solid ${t.palette.divider}`,
                        })}
                    >
                        <Typography variant='h6' sx={{ fontWeight: 800, color: '#0a0a0a' }}>
                            {isUpdate ? 'Update Category' : 'New Category'}
                        </Typography>
                        <IconButton onClick={handleClose} size='small' sx={{ bgcolor: '#fff' }}>
                            <CloseRounded fontSize='small' />
                        </IconButton>
                    </Stack>
                    <Box component='form' onSubmit={handleAddCategory} sx={{ p: 2.5 }}>
                        <Stack spacing={2}>
                            <TextField
                                size='small'
                                label='Name'
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                fullWidth
                            />
                            <TextField
                                size='small'
                                label='Description'
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                                fullWidth
                                multiline
                                minRows={2}
                            />
                            <Divider sx={{ my: 0.5 }} />
                            <Stack direction='row' spacing={1.25} justifyContent='flex-end'>
                                <Button variant='outlined' onClick={handleClose}>
                                    Cancel
                                </Button>
                                <Button
                                    type='submit'
                                    variant='contained'
                                    color='primary'
                                    disabled={mutation.status === 'pending'}
                                >
                                    {isUpdate ? 'Update' : 'Create'}
                                </Button>
                            </Stack>
                        </Stack>
                    </Box>
                </Card>
            </Box>
        </Modal>
    );
};

export default CreateCategory;
