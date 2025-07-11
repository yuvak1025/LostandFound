import React, { useState } from 'react';
import { TextField, Button, Typography, Box, MenuItem, Link, Snackbar, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getAuth, sendEmailVerification, signInWithEmailAndPassword } from 'firebase/auth';
import { app } from '../firebase'; // Ensure you have initialized your Firebase app somewhere
import Layout from './layout';

const Register = () => {

    const navigate = useNavigate(); // Hook for navigation
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [hostel, setHostel] = useState('');
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [profilePhotoName, setProfilePhotoName] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('');

    const hostels = ['Kalam', 'C.V. Raman', 'Aryabatta', 'Asima'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSnackbarOpen(false);

        // Password confirmation check
        if (password !== confirmPassword) {
            setSnackbarMessage('Passwords do not match');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
        }

        try {
            // Prepare user data for your server
            const userData = {
                email,
                name,
                whatsappNumber: whatsapp,
                password,
                hostelName: hostel,
            };

            // Create a FormData object to handle file uploads
            const formData = new FormData();
            formData.append('userData', JSON.stringify(userData));
            if (profilePhoto) {
                formData.append('profilePhoto', profilePhoto);
            }

            // Send registration request to backend
            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/auth/register`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                // After registration, send verification email
                const auth = getAuth(app); // Initialize Firebase Auth
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                await sendEmailVerification(user);

                setSnackbarMessage('Registration successful! A verification email has been sent.');
                setSnackbarSeverity('success');
                setSnackbarOpen(true);

                // Reset the form after successful registration
                setEmail('');
                setWhatsapp('');
                setPassword('');
                setName('');
                setConfirmPassword('');
                setHostel('');
                setProfilePhoto(null);
                setProfilePhotoName('');
                setTimeout(() => navigate('/login'), 2000); // Redirect to login after 2 seconds
            } else {
                throw new Error(data.error || 'Registration failed');
            }
        } catch (err) {
            setSnackbarMessage(err.message);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };


    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setProfilePhoto(file);
        setProfilePhotoName(file ? file.name : '');
    };

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    return (

        <Layout>
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                maxWidth: '500px',
                margin: 'auto',
                marginTop: 8,
            }}
            mb={{ xs: 4, sm: 6 }}
        >
            <Typography variant="h4" component="h1" align="center">Join the Community</Typography>

            <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            <TextField
                label="Name"
                type="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />
            <TextField
                label="WhatsApp Number"
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                required
            />
            <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            <TextField
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
            />
            <TextField
                select
                label="Hostel"
                value={hostel}
                onChange={(e) => setHostel(e.target.value)}
                required
            >
                {hostels.map((hostel) => (
                    <MenuItem key={hostel} value={hostel}>
                        {hostel}
                    </MenuItem>
                ))}
            </TextField>

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'left', marginBottom: 2 }}>
                <Typography variant="body1" component="label" sx={{ display: 'block', marginBottom: '8px' }}>
                    Upload Profile Photo (Optional)
                </Typography>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    id="profile-photo-upload"
                />
                <label htmlFor="profile-photo-upload">
                    <Box
                        sx={{
                            border: '2px dashed #3f51b5',
                            padding: '20px',
                            borderRadius: '4px',
                            backgroundColor: '#f0f0f0',
                            cursor: 'pointer',
                            textAlign: 'center',
                            width: '100%',
                            maxWidth: '320px',
                            '&:hover': { backgroundColor: '#e0e0e0' },
                        }}
                    >
                        Click or drag to upload
                    </Box>
                </label>
                {profilePhotoName && <Typography variant="caption">{profilePhotoName}</Typography>}
                <Typography variant="caption" color="textSecondary">
                    Supported formats: .jpg, .png, .jpeg
                </Typography>
            </Box>

            <Button type="submit" variant="contained">Register</Button>

            <Box mt={2}>
                <Typography variant="body2" align="center">
                    Already have an account?{' '}
                    <Link href="/login" color="primary">
                        Login here
                    </Link>
                </Typography>
            </Box>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
            
        </Box>
        </Layout>



    );
};

export default Register;
