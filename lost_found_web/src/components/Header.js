import React, { useState, useEffect } from 'react';
import {
    Box,
    IconButton,
    Menu,
    MenuItem,
    Typography,
    Toolbar,
    Avatar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Header = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [user, setUser] = useState('');
    const [name, setName] = useState('');
    const [profilePhoto, setProfilePhoto] = useState('');
    const [openInfoDialog, setOpenInfoDialog] = useState(false); // State for the info dialog
    const navigate = useNavigate();

    // Fetch user details by UID from localStorage
    useEffect(() => {
        const uid = localStorage.getItem('uid');
        if (uid) {
            axios.get(`${process.env.REACT_APP_BASE_URL}/auth/user/${uid}`)
                .then((response) => {
                    const { name, profilePhotoUrl } = response.data;
                    setName(name);
                    setProfilePhoto(profilePhotoUrl);
                    localStorage.setItem('name', name);
                    localStorage.setItem('profile', profilePhotoUrl);
                })
                .catch((error) => {
                    console.error('Error fetching user details:', error);
                });
        }
    }, []);

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('uid');
        localStorage.removeItem('name');
        localStorage.removeItem('profile');
        setAnchorEl(null);
        navigate('/login');
    };

    const handleEditProfile = () => {
        setAnchorEl(null);
        navigate('/editprofile');
    };

    const handleHomeClick = () => {
        setAnchorEl(null);
        navigate('/home');
    };

    const handleMyProfileClick = () => {
        setAnchorEl(null);
        navigate('/myprofile');
    };

    // Function to open the info dialog
    const handleInfoDialogOpen = () => {
        setOpenInfoDialog(true);
    };

    // Function to close the info dialog
    const handleInfoDialogClose = () => {
        setOpenInfoDialog(false);
    };

    return (
        <Box sx={{ width: '100%', mb: 2 }}>
            <Toolbar
                sx={{
                    justifyContent: 'space-between',
                    bgcolor: 'transparent',
                    boxShadow: 'none',
                    paddingX: 2,
                }}
            >
                {/* Logo/Brand with Hover Effect */}
                <Typography
                    variant="h6"
                    onClick={() => navigate('/')}
                    sx={{
                        cursor: 'pointer',
                        transition: 'color 0.3s',
                        '&:hover': {
                            color: 'blue',
                        },
                    }}
                >
                    Lost and Found
                </Typography>

                {/* Account Circle Icon for Profile/Logout */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>

                     <Typography sx={{ marginRight: 1 }}>
                            {name}
                        </Typography>

                    {/* Info Button with Decoration */}
                    <IconButton
                        onClick={handleInfoDialogOpen}
                        sx={{
                            marginRight: 2, // Adds margin to the right of the Info button
                            bgcolor: 'primary.main', // Set background color
                            color: 'white', // Set text color
                            '&:hover': {
                                bgcolor: 'primary.dark', // Darker background on hover
                            },
                            borderRadius: '50%', // Make it circular
                        }}
                    >
                        <InfoIcon />
                    </IconButton>

                    <IconButton
                        onClick={handleMenuOpen}
                        size="large"
                        edge="end"
                        aria-label="account of current user"
                        aria-controls="menu-appbar"
                        aria-haspopup="true"
                        color="inherit"
                    >
                        {profilePhoto ? (
                            <Avatar src={profilePhoto} alt={name} style={{ width: 40, height: 40 }} />
                        ) : (
                            <Avatar>{name.charAt(0)}</Avatar> // Fallback if profileImage is missing
                        )}
                    </IconButton>
                </Box>

                {/* Dropdown Menu for Profile and Logout */}
                <Menu
                    id="menu-appbar"
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                >
                    <MenuItem onClick={handleHomeClick}>Home </MenuItem>
                    <MenuItem onClick={handleMyProfileClick}>My Posts</MenuItem>
                    <MenuItem onClick={handleEditProfile}>Edit Profile</MenuItem>
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>


            </Toolbar>

            {/* Info Dialog for Rules and Regulations */}
            <Dialog
                open={openInfoDialog}
                onClose={handleInfoDialogClose}
                fullWidth // Make the dialog full width on small devices
                maxWidth="sm" // Limit maximum width
            >
                <DialogTitle>Rules and Regulations</DialogTitle>
                <DialogContent>
                    <Typography variant="body1">
                        Welcome to the Lost and Found app! Please adhere to the following rules:
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                        1. Respect other users and their belongings.
                    </Typography>
                    <Typography variant="body2">
                        2. Only post items that you have found or lost.
                    </Typography>
                    <Typography variant="body2">
                        3. Report any inappropriate content to the admin.
                    </Typography>
                    <Typography variant="body2">
                        4. Use the contact options responsibly and cross check before exchange of items.
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                        By using this app, you agree to abide by these rules.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleInfoDialogClose} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Header;
