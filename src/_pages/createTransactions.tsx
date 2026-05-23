import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../_utils/axios';
import {
    TextField,
    Button,
    Box,
    Typography,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Modal,
    Stack,
    IconButton,
    Divider,
    Card,
} from '@mui/material';
import { CustomAutocomplete } from '../_components/form/inputs/autoComplete';
import { TextInput } from '../_components';
import { CloseRounded } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { openCreateTransactinModal } from '../redux/modalSlice';
import {
    showErrorSnackbar,
    showSuccessSnackbar,
    showWarningSnackbar,
} from '../_components/snackbar/Snackbar';
import moment from 'moment';

interface Category {
    id: number;
    Name: string;
    Description: string;
    UserID: string;
    TransactionDate: string;
}

interface TransactionData {
    id?: number | null;
    Description: string;
    Amount: number;
    CategoryID: number;
    TransactionDate: string;
    TransactionType: string;
}

const fetchCategories = async (): Promise<Category[]> => {
    const response = await axiosInstance.get('api/categories/');
    return response.data;
};

const CreateTransaction: React.FC = () => {
    const open = useSelector((state: RootState) => state.modal.createTransaction);
    const datas = open.data;
    const dispatch = useDispatch();
    const queryClient = useQueryClient();

    const [description, setDescription] = useState<string>('');
    const [amount, setAmount] = useState<number>(0);
    const [categoryID, setCategoryID] = useState<any>(null);
    const [transactionDate, setTransactionDate] = useState<string>(
        moment(new Date()).toISOString().split('T')[0],
    );
    const [transactionType, setTransactionType] = useState<string>('Income');

    const handleClose = () => {
        dispatch(openCreateTransactinModal({ open: false, id: null, data: null }));
        setDescription('');
        setAmount(0);
        setCategoryID(null);
        setTransactionDate('');
    };

    const createTransaction = async (t: TransactionData): Promise<void> => {
        delete t.id;
        await axiosInstance.post('api/insert/', t);
    };
    const updateTransaction = async (t: TransactionData): Promise<void> => {
        await axiosInstance.put('/api/update/', t);
    };

    const { data: categories = [] } = useQuery<Category[]>({
        queryKey: ['categories'],
        queryFn: fetchCategories,
    });

    const mutation = useMutation<void, unknown, TransactionData>({
        mutationFn: open.id == null ? createTransaction : updateTransaction,
        onSuccess: () => {
            showSuccessSnackbar(
                open.id == null
                    ? 'Transaction created successfully!'
                    : 'Transaction updated successfully!',
            );
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            handleClose();
        },
        onError: (error: any) => {
            showErrorSnackbar(
                `Failed to save transaction: ${error.response?.data?.message || error.message}`,
            );
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount) return showWarningSnackbar('Enter an amount!');
        if (!description) return showWarningSnackbar('Enter a description');
        if (!categoryID) return showWarningSnackbar('Select a category');
        if (!transactionDate) return showWarningSnackbar('Select a transaction date');
        if (!transactionType) return showWarningSnackbar('Select a transaction type');
        mutation.mutate({
            Description: description,
            Amount: amount,
            CategoryID: categoryID?.id ?? categoryID,
            TransactionDate: transactionDate,
            TransactionType: transactionType,
            id: open?.id,
        });
    };

    function formatDate(dateString: string): string {
        const date = new Date(dateString);
        return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(
            date.getUTCDate(),
        ).padStart(2, '0')}`;
    }

    useEffect(() => {
        if (datas) {
            setDescription(datas.Description);
            setAmount(datas.Amount);
            setCategoryID(datas.CategoryID);
            setTransactionDate(formatDate(datas.TransactionDate));
            setTransactionType(datas.TransactionType);
        }
    }, [datas]);

    const isUpdate = open.id != null;

    return (
        <Modal open={open.open} onClose={handleClose}>
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: { xs: 'calc(100% - 32px)', sm: 460 },
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
                            backgroundColor: '#fcd34d',
                            borderBottom: `2px solid ${t.palette.divider}`,
                        })}
                    >
                        <Typography variant='h6' sx={{ fontWeight: 800, color: '#0a0a0a' }}>
                            {isUpdate ? 'Update Transaction' : 'New Transaction'}
                        </Typography>
                        <IconButton onClick={handleClose} size='small' sx={{ bgcolor: '#fff' }}>
                            <CloseRounded fontSize='small' />
                        </IconButton>
                    </Stack>
                    <Box component='form' onSubmit={handleSubmit} sx={{ p: 2.5 }}>
                        <Stack spacing={2}>
                            <TextInput
                                size='small'
                                label='Amount'
                                type='number'
                                value={amount}
                                onChange={(e) => setAmount(parseFloat(e.target.value))}
                                required
                                fullWidth
                            />
                            <TextInput
                                size='small'
                                label='Description'
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                                fullWidth
                            />
                            <FormControl fullWidth>
                                <CustomAutocomplete
                                    onChange={(value) => setCategoryID(value)}
                                    options={categories}
                                    label='Category'
                                    descriptionLength={20}
                                    value={categoryID}
                                />
                            </FormControl>
                            <TextField
                                size='small'
                                label='Transaction date'
                                type='date'
                                value={transactionDate}
                                onChange={(e) => setTransactionDate(e.target.value)}
                                required
                                fullWidth
                                placeholder='dd/mm/yyyy'
                                InputLabelProps={{ shrink: true }}
                            />
                            <FormControl fullWidth size='small'>
                                <InputLabel>Transaction type</InputLabel>
                                <Select
                                    label='Transaction type'
                                    value={transactionType}
                                    onChange={(e) => setTransactionType(e.target.value)}
                                    required
                                >
                                    <MenuItem value='Income'>Income</MenuItem>
                                    <MenuItem value='Expense'>Expense</MenuItem>
                                </Select>
                            </FormControl>
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

export default CreateTransaction;
