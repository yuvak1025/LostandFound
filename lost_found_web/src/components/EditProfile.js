import React, { useState } from 'react';
import {
    Box,
    Avatar,
    Button,
    Typography,
    IconButton,
    Snackbar,
    Alert,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Select,
    MenuItem,
    TextField,
    Divider,
} from '@mui/material';
import { Delete as DeleteIcon, HorizontalRule } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getAuth, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import Header from './Header';
import Footer from './footer';

const EditProfile = () => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [preview, setPreview] = useState(localStorage.getItem('profile'));
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success'); // To control snackbar severity
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedHostel, setSelectedHostel] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();

    const hostels = ['Kalam', 'C.V. Raman', 'Aryabatta', 'Asima'];

    // Handling image selection
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    // Cancel image selection
    const handleCancel = () => {
        setSelectedImage(null);
        setPreview(localStorage.getItem('profile'));
    };

    // Handling profile picture upload
    const handleUpload = async () => {
        if (!selectedImage) return;

        const formData = new FormData();
        formData.append('profilePhoto', selectedImage);
        formData.append('currentProfilePhotoUrl', localStorage.getItem('profile'));

        const uid = localStorage.getItem('uid');

        try {
            const response = await axios.put(`${process.env.REACT_APP_BASE_URL}/auth/user/${uid}/profile-picture`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200) {
                console.log('Profile picture updated successfully');
                localStorage.setItem('profile', response.data.newProfilePhotoUrl);
                setSnackbarMessage('Profile picture updated successfully!');
                setSnackbarSeverity('success'); // Set severity to success
                setSnackbarOpen(true);

                setTimeout(() => {
                    window.location.reload();
                }, 500);
            }
        } catch (error) {
            console.error('Error uploading profile picture:', error);
        }
    };

    // Handling hostel selection
    const handleHostelChange = (event) => {
        setSelectedHostel(event.target.value);
    };

    // Handling hostel update
    const handleHostelUpdate = async () => {
        const uid = localStorage.getItem('uid');

        try {
            const response = await axios.put(`${process.env.REACT_APP_BASE_URL}/auth/user/${uid}/hostel`, {
                hostel: selectedHostel,
            });

            if (response.status === 200) {
                console.log('Hostel information updated successfully');
                setSnackbarMessage('Hostel information updated successfully!');
                setSnackbarSeverity('success'); // Set severity to success
                setSnackbarOpen(true);

                setTimeout(() => {
                    window.location.reload();
                }, 500);
            }
        } catch (error) {
            console.error('Error updating hostel information:', error);
        }
    };

    // Handle password change
    const handlePasswordChange = async () => {
        const auth = getAuth();
        const uid = localStorage.getItem('uid');

        try {
            const user = auth.currentUser;
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);

            if (newPassword === confirmPassword) {
                await updatePassword(user, newPassword);
                console.log('Password changed successfully');
                setSnackbarMessage('Password changed successfully!');
                setSnackbarSeverity('success'); // Set severity to success

                // Clear password fields
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setSnackbarMessage('New passwords do not match!');
                setSnackbarSeverity('error'); // Set severity to error
            }
        } catch (error) {
            // console.error('Error changing password:', error);

            // Check for specific error codes
            if (error.code === 'auth/wrong-password') {
                setSnackbarMessage('Invalid current password. Please try again.');
                setSnackbarSeverity('error'); // Set severity to error
            } else {
                setSnackbarMessage(`${error.message}. Please try again.`);
                setSnackbarSeverity('error'); // Set severity to error
            }
        } finally {
            setSnackbarOpen(true);
        }
    };

    // Snackbar close
    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    // Dialog for remove photo
    const handleRemovePhoto = () => {
        setDialogOpen(true);
    };

    // Confirm removal
    const confirmRemovePhoto = async () => {
        setDialogOpen(false);
        const uid = localStorage.getItem('uid');
        const currentProfilePhotoUrl = localStorage.getItem('profile');

        try {
            const response = await axios.delete(`${process.env.REACT_APP_BASE_URL}/auth/user/${uid}/profile-picture`, {
                data: { currentProfilePhotoUrl }
            });
            if (response.status === 200) {
                console.log('Profile picture removed successfully');
                localStorage.removeItem('profile');
                setSnackbarMessage('Profile picture removed successfully!');
                setSnackbarSeverity('success'); // Set severity to success
                setSnackbarOpen(true);

                setTimeout(() => {
                    window.location.reload();
                }, 500);
            }
        } catch (error) {
            console.error('Error removing profile picture:', error);
        }
    };

    // Close dialog
    const handleDialogClose = () => {
        setDialogOpen(false);
    };

    return (
        <Box>
            <Header />

            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mt: 4,
                }}
            >
                <Typography variant="h6" gutterBottom>
                    Update Profile Picture
                </Typography>

                <Box sx={{ position: 'relative', mb: 2 }}>
                    <Avatar
                        alt="Profile Picture"
                        src={preview || localStorage.getItem('profile')}
                        sx={{ width: 150, height: 150 }}
                    />
                    {localStorage.getItem('profile') && (
                        <IconButton
                            sx={{ position: 'absolute', top: -5, right: -5 }}
                            onClick={handleRemovePhoto}
                        >
                            <DeleteIcon color="white" />
                        </IconButton>
                    )}
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Button variant="outlined" component="label">
                        Choose Image
                        <input type="file" accept="image/*" hidden onChange={handleImageChange} />
                    </Button>

                    {selectedImage && (
                        <Button variant="outlined" color="secondary" onClick={handleCancel}>
                            Cancel
                        </Button>
                    )}
                </Box>

                {selectedImage && (
                    <Button variant="contained" color="primary" onClick={handleUpload}>
                        Upload Image
                    </Button>
                )}

                <Box
                    sx={{
                        mt: 4,
                        width: '100%',
                        maxWidth: 400,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Typography variant="h6" gutterBottom>
                        Update Hostel Information
                    </Typography>
                    <Select
                        value={selectedHostel}
                        onChange={handleHostelChange}
                        displayEmpty
                        fullWidth
                        sx={{ mb: 2 }}
                    >
                        <MenuItem value="" disabled>
                            Select your hostel
                        </MenuItem>
                        {hostels.map((hostel, index) => (
                            <MenuItem key={index} value={hostel}>
                                {hostel}
                            </MenuItem>
                        ))}
                    </Select>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleHostelUpdate}
                        sx={{ mt: 2 }}
                        disabled={!selectedHostel} // Disable button if no hostel is selected
                    >
                        Update Hostel
                    </Button>

                    {/* Change Password Section */}
                    <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                        Change Password
                    </Typography>
                    <TextField
                        type="password"
                        label="Current Password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        fullWidth
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        type="password"
                        label="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        fullWidth
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        type="password"
                        label="Confirm New Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        fullWidth
                        sx={{ mb: 4 }}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handlePasswordChange}
                    >
                        Change Password
                    </Button>
                </Box>
            </Box>

            {/* Snackbar for notifications */}
            <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>

            {/* Dialog for remove photo confirmation */}
            <Dialog open={dialogOpen} onClose={handleDialogClose}>
                <DialogTitle>Remove Profile Photo</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to remove your profile photo?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={confirmRemovePhoto} color="secondary">
                        Remove
                    </Button>
                </DialogActions>
            </Dialog>

            <Box sx={{ display: 'flex', justifyContent: 'center'  , maxWidth : "xs"}}>

                <Divider sx={{ width: '100%', borderColor: 'grey.500', borderBottomWidth: 2, my: 6 }} />


            </Box>



            <Footer />
        </Box>
    );
};

export default EditProfile;
