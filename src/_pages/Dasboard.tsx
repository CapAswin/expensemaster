import React, { useEffect, useState } from 'react';
import { Paper, Box, ThemeProvider, CssBaseline, GlobalStyles } from '@mui/material';
import { darkTheme, lightTheme } from '../_styles/CreateTheme';
import LabTabs from '../_components/navbar/navbar';
import TransactionDataGrid from './transactionGrid';
import { Route, Routes } from 'react-router-dom';
import Manage from './manage';
import Dashboard from './Dashboard';
import { ChangePasswordModal } from '../_components';
import CreateTransaction from './createTransactions';
import { useDispatch } from 'react-redux';
import { fetchCategories, fetchTransactions } from '../redux/dataSlice';
import { AppDispatch } from '../redux/store';
import CreateCategory from './createCategory';
import AboutUs from './about';

const DashboardHome: React.FC = () => {

    const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
    const dispatch: AppDispatch = useDispatch();
    let fetch = async () => {
        dispatch(fetchCategories())
        dispatch(fetchTransactions())

    }
    useEffect(() => {

        fetch()
        return () => {

        }
    }, [])

    const toggleTheme = () => {
        setIsDarkMode((prevMode) => !prevMode);
    };
    return (
        <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
            <CssBaseline />
            <GlobalStyles
                styles={{
                    html: {
                        backgroundColor: isDarkMode ? darkTheme.palette.background.default : lightTheme.palette.background.paper,
                        height: '100%',
                    },
                    body: {
                        // backgroundColor: isDarkMode ? darkTheme.palette.background.default : lightTheme.palette.background.paper,
                        margin: 0,
                        minHeight: '100vh',
                    },
                }}
            />
            <Paper sx={{ boxShadow: "none", background: "transparent" }}>

                <Box
                    sx={{
                        width: '100%',
                        maxWidth: {
                            xs: '100%',  // full width for extra small screens
                            sm: '540px', // similar to Bootstrap's sm container
                            md: '720px', // similar to Bootstrap's md container
                            lg: '960px', // similar to Bootstrap's lg container
                            xl: '1140px', // similar to Bootstrap's xl container
                        },
                        mx: 'auto', // centers the container horizontally
                        px: {
                            xs: 2,  // padding for extra small screens
                            sm: 3,  // padding for small screens and up
                        },
                    }}
                >
                    <LabTabs theme={toggleTheme} />
                    <Routes>
                        <Route path='/' element={<Dashboard />} />
                        <Route path='/manage' element={<Manage />} />
                        <Route path='/transactions' element={<TransactionDataGrid />} />
                        <Route path='/aboutus' element={<AboutUs />} />

                    </Routes>
                </Box>
                <ChangePasswordModal />
                <CreateTransaction />
                <CreateCategory />
            </Paper>
        </ThemeProvider>
    );
};

export default DashboardHome;
