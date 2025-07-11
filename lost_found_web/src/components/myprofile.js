import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Snackbar,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Typography,
} from '@mui/material';
import axios from 'axios';
import Header from './Header';
import Footer from './footer';
import Slider from 'react-slick'; // Import react-slick

const MyProfile = () => {
    const [posts, setPosts] = useState([]);
    const [selectedPost, setSelectedPost] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [editLocation, setEditLocation] = useState('');
    const [editType, setEditType] = useState('lost'); // Default to 'lost'
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [notification, setNotification] = useState({ open: false, message: '', severity: '' });
    
    // Survey state
    const [openSurveyDialog, setOpenSurveyDialog] = useState(false);
    const [surveyResponse, setSurveyResponse] = useState('');

    // Fetch user posts by UID
    useEffect(() => {
        const uid = localStorage.getItem('uid');
        if (uid) {
            axios.get(`${process.env.REACT_APP_BASE_URL}/post/user/${uid}`)
                .then((response) => {
                    setPosts(response.data);
                })
                .catch((error) => {
                    console.error('Error fetching posts:', error);
                });
        }
    }, []);

    // Handle opening the edit dialog
    const handleEditClick = (post) => {
        setSelectedPost(post);
        setEditContent(post.description);
        setEditLocation(post.location); // Set existing location
        setEditType(post.postType); // Set existing type
        setOpenEditDialog(true);
    };

    // Handle post deletion
    const handleDelete = (post) => {
        setSelectedPost(post); // Set selected post
        setOpenSurveyDialog(true); // Open survey dialog
    };

    // Confirm deletion of post
    const confirmDeletePost = async () => {
        try {
            // Delete the post without sending any data
            await axios.delete(`${process.env.REACT_APP_BASE_URL}/post/${selectedPost._id}`);
            
            // Remove the post from the state
            setPosts(posts.filter(post => post._id !== selectedPost._id));
            
            // Notification for successful deletion
            setNotification({ open: true, message: 'Post deleted successfully!', severity: 'success' });
    
            // If surveyResponse is not empty and is not just whitespace, send it to the survey endpoint
            if (surveyResponse.trim() !== '') {
                const uid = localStorage.getItem('uid');
                const surveyData = {
                    uid: uid,
                    surveyResponse: surveyResponse.trim(), // Trim the response
                };
                await axios.post(`${process.env.REACT_APP_BASE_URL}/auth/survey`, surveyData);
            }
        } catch (error) {
            console.error('Error deleting post:', error);
            setNotification({ open: true, message: 'Failed to delete post.', severity: 'error' });
        } finally {
            setOpenSurveyDialog(false); // Close survey dialog
            setSurveyResponse(''); // Reset survey response
        }
    };
    

    // Handle post update
    const handleUpdatePost = async () => {
        try {
            await axios.put(`${process.env.REACT_APP_BASE_URL}/post/${selectedPost._id}`, {
                description: editContent,
                location: editLocation, // Update location
                postType: editType // Update post type
            });
            setPosts(posts.map(post => (
                post._id === selectedPost._id
                    ? { ...post, description: editContent, location: editLocation, postType: editType }
                    : post
            )));
            setNotification({ open: true, message: 'Post updated successfully!', severity: 'success' });
            setOpenEditDialog(false);
        } catch (error) {
            console.error('Error updating post:', error);
            setNotification({ open: true, message: 'Failed to update post.', severity: 'error' });
        }
    };

    // Handle Snackbar close
    const handleSnackbarClose = () => {
        setNotification({ ...notification, open: false });
    };

    // Settings for the image slider
    const sliderSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        adaptiveHeight: true,
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />

            <Box sx={{ padding: 2, flexGrow: 1 }}>
                {/* Display user posts */}
                {posts.map((post) => (
                    <Box key={post._id} sx={{ marginBottom: 2, padding: 2, backgroundColor: post.postType === 'lost' ? '#ffe5e5' : '#e8f5e9' }}>
                        <Typography variant="h6">{post.description}</Typography>
                        <Typography variant="body2">Location: {post.location}</Typography>

                        {post.imageUrls.length > 0 && (
                            <Box sx={{ marginTop: 2, padding: 1 }}>
                                <Slider {...sliderSettings}>
                                    {post.imageUrls.map((url, index) => (
                                        <div key={index} style={{ display: 'flex', justifyContent: 'center' }}>
                                            <img
                                                src={url}
                                                alt={`Post image ${index}`}
                                                style={{
                                                    width: '100%', // Adjust width as needed
                                                    height: '150px', // Maintain aspect ratio
                                                    maxHeight: '400px', // Optional: set a maximum height
                                                    objectFit: 'contain', // Maintain aspect ratio and cover the area
                                                    borderRadius: '4px', // Optional: Add border radius for aesthetics
                                                }}
                                            />
                                        </div>
                                    ))}
                                </Slider>
                            </Box>
                        )}

                        <Button onClick={() => handleEditClick(post)}>Edit</Button>
                        <Button onClick={() => handleDelete(post)} color="error">Delete</Button>
                    </Box>
                ))}

                {/* Edit Post Dialog */}
                <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
                    <DialogTitle>Edit Post</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Post Content"
                            fullWidth
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                        />
                        <TextField
                            margin="dense"
                            label="Location"
                            fullWidth
                            value={editLocation}
                            onChange={(e) => setEditLocation(e.target.value)} // Update directly
                        />
                        <TextField
                            select
                            margin="dense"
                            label="Post Type"
                            fullWidth
                            value={editType} // Update to use editType directly
                            onChange={(e) => setEditType(e.target.value)} // Update directly
                            SelectProps={{
                                native: true,
                            }}
                        >
                            <option value="lost">Lost</option>
                            <option value="found">Found</option>
                        </TextField>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
                        <Button onClick={handleUpdatePost}>Update</Button>
                    </DialogActions>
                </Dialog>

                {/* Survey Dialog for Post Deletion */}
                <Dialog open={openSurveyDialog} onClose={() => setOpenSurveyDialog(false)}>
                    <DialogTitle>Feedback Survey</DialogTitle>
                    <DialogContent>
                        <Typography variant="body1">Did this app help you? Please provide your feedback (optional):</Typography>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Your Feedback"
                            fullWidth
                            value={surveyResponse}
                            onChange={(e) => setSurveyResponse(e.target.value)}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenSurveyDialog(false)}>Cancel</Button>
                        <Button onClick={confirmDeletePost}  color="error">Confirm Delete</Button>
                    </DialogActions>
                </Dialog>

                {/* Snackbar for notifications */}
                <Snackbar open={notification.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
                    <Alert onClose={handleSnackbarClose} severity={notification.severity}>
                        {notification.message}
                    </Alert>
                </Snackbar>
            </Box>

            <Footer />
        </Box>
    );
};

export default MyProfile;
