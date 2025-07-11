import React, { useState, useEffect } from 'react';
import { Container, TextField, Button, Typography, Box, Link, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

import Footer from './footer';
const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [forgotPasswordDialogOpen, setForgotPasswordDialogOpen] = useState(false);
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('');
    const navigate = useNavigate();

    // Check for token in local storage on component mount
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            navigate('/home'); // Redirect to home if token exists
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const auth = getAuth(); // Initialize Firebase Auth

        try {
            // Sign in the user with email and password
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Check if the user's email is verified
            if (!user.emailVerified) {
                setSnackbarMessage('Please verify your email before logging in.');
                setSnackbarSeverity('warning');
                setSnackbarOpen(true);
                return; // Exit the function if the email is not verified
            }

            // console.log(user);
            

            // Save user info or token to local storage for session management
            localStorage.setItem('authToken', user.accessToken);
            localStorage.setItem('uid', user.uid);
            
            // Provide success feedback
            setSnackbarMessage('Login successful!');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);

            // Redirect to home page after successful login
            navigate('/home');
        } catch (error) {
            // Handle login errors
            setSnackbarMessage(error.message);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    const handleForgotPassword = () => {
        setForgotPasswordDialogOpen(true); // Open the forgot password dialog
    };

    const handleCloseForgotPasswordDialog = () => {
        setForgotPasswordDialogOpen(false); // Close the forgot password dialog
    };

    const handleSendPasswordReset = async () => {
        const auth = getAuth(); // Initialize Firebase Auth

        try {
            // Send password reset email
            await sendPasswordResetEmail(auth, forgotPasswordEmail);
            setSnackbarMessage('Password reset email sent!');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            handleCloseForgotPasswordDialog(); // Close dialog after successful reset email
        } catch (error) {
            setSnackbarMessage(error.message);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    return (
        <Container maxWidth="xs">
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh">
                <Typography variant="h4" component="h1" gutterBottom>
                    Login
                </Typography>
                <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                    <TextField
                        label="Email"
                        type="email"
                        fullWidth
                        margin="normal"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <TextField
                        label="Password"
                        type="password"
                        fullWidth
                        margin="normal"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        style={{ marginTop: '16px' }}
                    >
                        Login
                    </Button>
                </form>

                {/* Forgot Password Link */}
                <Link onClick={handleForgotPassword} variant="body2" style={{ marginTop: '16px', cursor: 'pointer' }}>
                    Forgot Password?
                </Link>

                {/* New User Register Link */}
                <Link href="/register" variant="body2" style={{ marginTop: '8px' }}>
                    New User? Register
                </Link>

                {/* Forgot Password Dialog */}
                <Dialog open={forgotPasswordDialogOpen} onClose={handleCloseForgotPasswordDialog} fullWidth maxWidth="sm">
                    <DialogTitle>Reset Password</DialogTitle>
                    <DialogContent>
                        <TextField
                            label="Enter your email"
                            type="email"
                            fullWidth
                            margin="normal"
                            value={forgotPasswordEmail}
                            onChange={(e) => setForgotPasswordEmail(e.target.value)}
                            required
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseForgotPasswordDialog} variant="contained" color="secondary">
                            Cancel
                        </Button>
                        <Button onClick={handleSendPasswordReset} variant="contained" color="primary">
                            Send Reset Link
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Snackbar for feedback */}
                <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                    <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
                        {snackbarMessage}
                    </Alert>
                </Snackbar>
            </Box>
            <Footer />
        </Container>
    );
};

export default Login;
