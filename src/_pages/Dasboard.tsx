import React, { useEffect, useState } from 'react';
import { Box, CssBaseline, ThemeProvider } from '@mui/material';
import { Route, Routes } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { darkTheme, lightTheme } from '../_styles/CreateTheme';
import LabTabs from '../_components/navbar/navbar';
import TransactionDataGrid from './transactionGrid';
import Manage from './manage';
import Dashboard from './Dashboard';
import { ChangePasswordModal } from '../_components';
import CreateTransaction from './createTransactions';
import CreateCategory from './createCategory';
import AboutUs from './about';
import RoomsPage from './rooms';
import RoomDetailPage from './roomDetail';
import RoomSettlementPage from './roomSettlement';
import { fetchCategories, fetchTransactions } from '../redux/dataSlice';
import { AppDispatch } from '../redux/store';

const DashboardHome: React.FC = () => {
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
    const dispatch: AppDispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchCategories());
        dispatch(fetchTransactions());
    }, [dispatch]);

    const toggleTheme = () => setIsDarkMode((prev) => !prev);

    return (
        <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
            <CssBaseline />
            <Box
                sx={{
                    minHeight: '100vh',
                    width: '100%',
                    pb: { xs: 6, sm: 8, md: 10 },
                }}
            >
                <Box
                    sx={{
                        width: '100%',
                        maxWidth: { xs: '100%', sm: 720, md: 960, lg: 1200, xl: 1320 },
                        mx: 'auto',
                        px: { xs: 2, sm: 3, md: 4 },
                        pt: { xs: 3, sm: 4, md: 5 },
                    }}
                >
                    <LabTabs theme={toggleTheme} isDarkMode={isDarkMode} />
                    <Box sx={{ mt: { xs: 3, sm: 4 } }}>
                        <Routes>
                            <Route path='/' element={<Dashboard />} />
                            <Route path='/manage' element={<Manage />} />
                            <Route path='/transactions' element={<TransactionDataGrid />} />
                            <Route path='/rooms' element={<RoomsPage />} />
                            <Route path='/rooms/:id' element={<RoomDetailPage />} />
                            <Route path='/rooms/:id/settlement' element={<RoomSettlementPage />} />
                            <Route path='/aboutus' element={<AboutUs />} />
                        </Routes>
                    </Box>
                </Box>
            </Box>
            <ChangePasswordModal />
            <CreateTransaction />
            <CreateCategory />
        </ThemeProvider>
    );
};

export default DashboardHome;
