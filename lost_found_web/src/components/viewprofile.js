import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Avatar, CircularProgress } from '@mui/material';
import Header from './Header'; // Import your header component
import Footer from './footer'; // Import your footer component

const ViewProfile = () => {
    const { userId } = useParams();
    const [userDetails, setUserDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_BASE_URL}/auth/user/${userId}`);
                const data = await response.json();
                setUserDetails(data);
            } catch (error) {
                console.error('Error fetching user details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserDetails();
    }, [userId]);

    if (loading) return <CircularProgress />;

    if (!userDetails) return <Typography>No user found.</Typography>;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header /> {/* Add Header here */}
            <Box sx={{ padding: '20px', flexGrow: 1 }}>
                <Box display="flex" flexDirection="column" alignItems="center">
                    <Avatar
                        alt={userDetails.name}
                        src={userDetails.profilePhotoUrl}
                        sx={{ width: 100, height: 100, marginBottom: '20px' }}
                    />
                    <Typography variant="h5">{userDetails.name}</Typography>
                    <Typography variant="body1">Email: {userDetails.email}</Typography>
                    <Typography variant="body1">WhatsApp: {userDetails.whatsappNumber}</Typography>
                    <Typography variant="body1">Lives in Hostel: {userDetails.hostelName}</Typography>
                  
                </Box>
            </Box>
            <Footer /> 
        </Box>
    );
};

export default ViewProfile;
