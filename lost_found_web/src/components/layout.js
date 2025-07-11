import React from 'react';
import { Box } from '@mui/material';
import Footer from './footer'; // Adjust the import based on your file structure

const Layout = ({ children }) => {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
             
                
            }}
        >
            <Box sx={{ flexGrow: 1 }}>{children}</Box>
            <Footer />
        </Box>
    );
};

export default Layout;
