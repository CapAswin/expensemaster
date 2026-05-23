import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../_utils/axios';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    Skeleton,
    Stack,
    TextField,
    Tooltip,
    Typography,
    Alert,
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { openCreateTransactinModal } from '../redux/modalSlice';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

export interface Transaction {
    id: number;
    Amount: number;
    CategoryID: {
        id: number;
        Name: string;
        Description: string;
        TransactionDate: string;
        UserID: number;
    };
    Description: string;
    TransactionDate: string;
    TransactionType: string;
    UserID: number;
}

const fetchTransactions = async (): Promise<Transaction[]> => {
    const response = await axiosInstance.get('api/transactions/');
    return response.data.map((t: Transaction) => ({ ...t, CategoryName: t.CategoryID.Name }));
};

const deleteTransaction = async (id: number): Promise<void> => {
    await axiosInstance.delete(`api/remove/${id}`);
};

const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(
        date.getUTCDate(),
    ).padStart(2, '0')}`;
};

const TransactionDataGrid: React.FC = () => {
    const [searchText, setSearchText] = useState('');
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const queryClient = useQueryClient();
    const dispatch = useDispatch();

    const { data: transactions = [], isLoading, error } = useQuery<Transaction[]>({
        queryKey: ['transactions'],
        queryFn: fetchTransactions,
    });

    const deleteMutation = useMutation<void, unknown, number>({
        mutationFn: deleteTransaction,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transactions'] }),
    });

    const handleConfirmDelete = () => {
        if (deleteId !== null) {
            deleteMutation.mutate(deleteId);
            setDeleteId(null);
        }
    };

    const columns: GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 80 },
        {
            field: 'Amount',
            headerName: 'Amount',
            width: 140,
            renderCell: (params) => (
                <Typography sx={{ fontWeight: 700 }}>
                    ₹ {new Intl.NumberFormat('en-IN').format(params.value)}
                </Typography>
            ),
        },
        { field: 'CategoryName', headerName: 'Category', width: 160 },
        { field: 'Description', headerName: 'Description', flex: 1, minWidth: 200 },
        {
            field: 'TransactionDate',
            headerName: 'Date',
            width: 140,
            renderCell: (params) => <span>{formatDate(params.value)}</span>,
        },
        {
            field: 'TransactionType',
            headerName: 'Type',
            width: 130,
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    size='small'
                    color={params.value === 'Income' ? 'success' : 'error'}
                />
            ),
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 110,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <Tooltip title='Delete'>
                    <IconButton
                        size='small'
                        onClick={(e) => {
                            e.stopPropagation();
                            setDeleteId(params.row.id);
                        }}
                        sx={{ color: '#ef4444' }}
                    >
                        <DeleteRoundedIcon fontSize='small' />
                    </IconButton>
                </Tooltip>
            ),
        },
    ];

    const filtered = transactions.filter((t) =>
        (t.Description || '').toLowerCase().includes(searchText.toLowerCase()),
    );

    const handleCreateTransaction = () =>
        dispatch(openCreateTransactinModal({ open: true, id: null, data: null }));

    return (
        <Card>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    justifyContent='space-between'
                    alignItems={{ xs: 'stretch', md: 'center' }}
                    spacing={1.5}
                    sx={{ mb: 2 }}
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
                                backgroundColor: '#7dd3fc',
                                border: `2px solid ${t.palette.divider}`,
                                boxShadow: `3px 3px 0 0 ${t.palette.divider}`,
                                color: '#0a0a0a',
                            })}
                        >
                            <ReceiptLongRoundedIcon />
                        </Box>
                        <Box>
                            <Typography variant='h6' sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                                All Transactions
                            </Typography>
                            <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 600 }}>
                                {transactions.length} entries
                            </Typography>
                        </Box>
                    </Stack>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
                        <TextField
                            size='small'
                            placeholder='Search description…'
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            InputProps={{
                                startAdornment: <SearchRoundedIcon sx={{ mr: 1, fontSize: 18 }} />,
                            }}
                            sx={{ minWidth: { xs: '100%', sm: 260 } }}
                        />
                        <Button
                            variant='contained'
                            color='primary'
                            startIcon={<AddRoundedIcon />}
                            onClick={handleCreateTransaction}
                        >
                            New transaction
                        </Button>
                    </Stack>
                </Stack>

                {error ? (
                    <Alert severity='error'>Couldn't load transactions.</Alert>
                ) : isLoading ? (
                    <Skeleton variant='rounded' height={520} />
                ) : (
                    <Box sx={{ height: 560, width: '100%' }}>
                        <DataGrid
                            rows={filtered}
                            columns={columns}
                            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                            onRowClick={(e) =>
                                dispatch(
                                    openCreateTransactinModal({
                                        open: true,
                                        id: e.id ? Number(e.id) : null,
                                        data: e.row,
                                    }),
                                )
                            }
                            pageSizeOptions={[10, 20, 50]}
                            checkboxSelection
                            disableRowSelectionOnClick
                            sx={(t) => ({
                                border: `2px solid ${t.palette.divider}`,
                                borderRadius: 2.5,
                                boxShadow: `3px 3px 0 0 ${t.palette.divider}`,
                                overflow: 'hidden',
                                fontWeight: 500,
                                color: t.palette.text.primary,
                                // Column header bar — yellow strip with dark text, both modes
                                '& .MuiDataGrid-columnHeaders': {
                                    backgroundColor: '#fcd34d !important',
                                    borderBottom: `2px solid ${t.palette.divider}`,
                                    color: '#0a0a0a',
                                },
                                '& .MuiDataGrid-columnHeader': {
                                    backgroundColor: '#fcd34d !important',
                                    color: '#0a0a0a',
                                    '&:focus, &:focus-within': { outline: 'none' },
                                },
                                '& .MuiDataGrid-columnHeaderTitle': {
                                    color: '#0a0a0a',
                                    fontWeight: 800,
                                },
                                '& .MuiDataGrid-columnHeaderTitleContainer, & .MuiDataGrid-columnHeaderTitleContainerContent': {
                                    color: '#0a0a0a',
                                },
                                '& .MuiDataGrid-iconButtonContainer .MuiSvgIcon-root, & .MuiDataGrid-sortIcon, & .MuiDataGrid-menuIconButton .MuiSvgIcon-root, & .MuiDataGrid-filterIcon': {
                                    color: '#0a0a0a',
                                },
                                '& .MuiDataGrid-columnSeparator': {
                                    color: 'rgba(10,10,10,0.35)',
                                },
                                // Checkbox in header
                                '& .MuiDataGrid-columnHeader .MuiCheckbox-root': {
                                    color: '#0a0a0a',
                                },
                                // Body cells
                                '& .MuiDataGrid-cell': {
                                    borderColor: t.palette.divider,
                                    color: t.palette.text.primary,
                                    '&:focus, &:focus-within': { outline: 'none' },
                                },
                                '& .MuiDataGrid-row': {
                                    cursor: 'pointer',
                                    '&:hover': {
                                        backgroundColor: t.palette.mode === 'dark'
                                            ? 'rgba(254,246,228,0.06)'
                                            : 'rgba(252,211,77,0.18)',
                                    },
                                },
                                '& .MuiDataGrid-footerContainer': {
                                    borderTop: `2px solid ${t.palette.divider}`,
                                    color: t.palette.text.primary,
                                },
                                '& .MuiTablePagination-root, & .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows, & .MuiTablePagination-select': {
                                    color: t.palette.text.primary,
                                },
                            })}
                        />
                    </Box>
                )}

                <Dialog open={deleteId !== null} onClose={() => setDeleteId(null)} maxWidth='xs' fullWidth>
                    <DialogTitle sx={{ fontWeight: 800 }}>Delete transaction?</DialogTitle>
                    <DialogContent>
                        <DialogContentText sx={{ fontWeight: 500 }}>
                            This will permanently remove the transaction. You can't undo this.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button onClick={() => setDeleteId(null)} variant='outlined'>
                            Cancel
                        </Button>
                        <Button onClick={handleConfirmDelete} variant='contained' color='error' autoFocus>
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>
            </CardContent>
        </Card>
    );
};

export default TransactionDataGrid;
