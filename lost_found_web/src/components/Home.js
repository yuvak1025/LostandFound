import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Avatar,
    Typography,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    IconButton,
    TextField,
    Snackbar,
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import Header from './Header';
import PostComponent from './Postcomponent'; // Import PostComponent




const Home = () => {
    const [open, setOpen] = useState(false); // Dialog open/close state
    const [location, setLocation] = useState('');
    const [postType, setPostType] = useState('lost');
    const [description, setDescription] = useState('');
    const [images, setImages] = useState([]); // Array for storing uploaded images
    const [posts, setPosts] = useState([]); // State to store all posts
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [loading, setLoading] = useState(false); // Loading state
    const uid = localStorage.getItem('uid');
    const profilePhoto = localStorage.getItem('profile');

    // Handle dialog open
    const handleClickOpen = () => setOpen(true);

    // Handle dialog close
    const handleClose = () => {
        setOpen(false);
        setDescription('');
        setLocation('');
        setImages([]);
    };

    // Fetch posts from backend
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_BASE_URL}/post/`);
                const data = await response.json();
                setPosts(data);
            } catch (error) {
                console.error('Error fetching posts:', error);
            }
        };

        fetchPosts();
    }, []);

    // Handle form submission
    const handleSubmit = async () => {
        setLoading(true); // Set loading to true
        const formData = new FormData();
        formData.append('location', location);
        formData.append('postType', postType);
        formData.append('description', description);
        formData.append('uid', uid);

        // Append images to FormData
        images.forEach((image) => formData.append('images', image));

        try {
            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/post/`, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const newPost = await response.json();
                setPosts([newPost.post, ...posts]); // Add new post to the top
                setSnackbarMessage('Post created successfully!');
                handleClose(); // Close the dialog after submission
            } else {
                setSnackbarMessage('Error creating post: ' + response.statusText);
            }
        } catch (error) {
            setSnackbarMessage('Error uploading images or creating post: ' + error.message);
        } finally {
            setLoading(false); // Set loading to false
            setSnackbarOpen(true); // Open Snackbar
        }
    };

    // Handle image upload
    const handleImageUpload = (event) => {
        const files = Array.from(event.target.files);
        setImages((prevImages) => [...prevImages, ...files]);
    };

    // Handle removing an image
    const handleRemoveImage = (index) => {
        setImages((prevImages) => prevImages.filter((_, i) => i !== index));
    };

    return (
        <>
            <Header />
            <Container>
                <Box sx={{ backgroundColor: '#f5f5f5' }}>
                    {/* Create Post Box */}
                    <Box
                        mt={3}
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{
                            backgroundColor: '#fff',
                            borderRadius: '10px',
                            padding: '10px',
                            boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
                        }}
                    >
                        <Avatar
                            alt="User"
                            src={profilePhoto}
                            sx={{ width: 56, height: 56, marginRight: 2 }}
                        />
                        <Box
                            sx={{
                                backgroundColor: '#f0f0f0',
                                padding: '12px 20px',
                                borderRadius: '20px',
                                flexGrow: 1,
                                cursor: 'pointer',
                                '&:hover': {
                                    backgroundColor: '#e0e0e0',
                                },
                            }}
                            onClick={handleClickOpen}
                        >
                            <Typography variant="body1" color="textSecondary">
                                Create a new post...
                            </Typography>
                        </Box>
                    </Box>

                    {/* Dialog for creating post */}
                    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
                        <DialogTitle>Create a Post</DialogTitle>
                        <DialogContent>
                            <FormControl fullWidth margin="dense" variant="outlined">
                                <InputLabel id="post-type-label"  required = "true" >Type</InputLabel>
                                <Select
                                    labelId="post-type-label"
                                    value={postType}
                                    onChange={(e) => setPostType(e.target.value)}
                                    label="Type"
                                >
                                    <MenuItem value="lost">Lost</MenuItem>
                                    <MenuItem value="found">Found</MenuItem>
                                </Select>
                            </FormControl>

                            <TextField
                                margin="dense"
                                label="Location"
                                type="text"
                                fullWidth
                                variant="outlined"
                                value={location}
                                required = "true"
                                onChange={(e) => setLocation(e.target.value)}
                            />

                            <TextField
                                margin="dense"
                                label="Description"
                                type="text"
                                fullWidth
                                multiline
                                rows={4}
                                variant="outlined"
                                value={description}
                                 required = "true"
                                onChange={(e) => setDescription(e.target.value)}
                            />

                            {/* Image upload */}
                            <Box mt={2}>
                                <Button
                                    variant="contained"
                                    component="label"
                                    startIcon={<PhotoCamera />}
                                >
                                    Upload Images
                                    <input
                                        hidden
                                        accept="image/*"
                                        type="file"
                                        multiple
                                        onChange={handleImageUpload}
                                    />
                                </Button>
                                <Box mt={1} display="flex" flexWrap="wrap">
                                    {images.map((image, index) => (
                                        <Box
                                            key={index}
                                            sx={{ position: 'relative', marginRight: 1, marginBottom: 1 }}
                                        >
                                            <img
                                                src={URL.createObjectURL(image)}
                                                alt={`Uploaded ${index}`}
                                                style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '5px' }}
                                            />
                                            <IconButton
                                                sx={{ position: 'absolute', top: 0, right: 0 }}
                                                onClick={() => handleRemoveImage(index)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleClose} color="primary">
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                color="primary"
                                variant="contained"
                                disabled={loading} // Disable button while loading
                            >
                                {loading ? 'Posting...' : 'Post'} 
                                
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Box>

                {/* Display posts */}
                <Box mt={3}>
                    {posts.map((post) => (
                        <PostComponent key={post._id} post={post} />
                    ))}
                </Box>

                {/* Snackbar for notifications */}
                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={6000}
                    onClose={() => setSnackbarOpen(false)}
                >
                    <MuiAlert onClose={() => setSnackbarOpen(false)} severity={loading ? 'info' : 'success'}>
                        {snackbarMessage}
                    </MuiAlert>
                </Snackbar>
            </Container>
        </>
    );
};

export default Home;
