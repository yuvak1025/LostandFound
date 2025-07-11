import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Avatar,
    Button,
    TextField,
    Collapse,
    CircularProgress,
    Divider,
    IconButton,

} from '@mui/material';
import Slider from 'react-slick';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailIcon from '@mui/icons-material/Email';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useMediaQuery } from '@mui/material';



const PostComponent = ({ post }) => {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [showComments, setShowComments] = useState(false);
    const [commentLoading, setCommentLoading] = useState(false);
    const [loadingUser, setLoadingUser] = useState(true);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editedComment, setEditedComment] = useState('');

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_BASE_URL}/auth/user/${post.uid}`);
                const data = await response.json();
                setProfilePhoto(data.profilePhotoUrl);
                setWhatsapp(data.whatsappNumber);
                setEmail(data.email);
                setName(data.name);
            } catch (error) {
                console.error('Error fetching user:', error);
            } finally {
                setLoadingUser(false);
            }
        };

        fetchUser();
    }, [post.uid]);

    useEffect(() => {
        setComments(post.comments || []);
    }, [post.comments]);

    const handleCommentSubmit = async () => {
        if (newComment.trim() === '') return;

        setCommentLoading(true);

        const userId = localStorage.getItem('uid');
        const userName = localStorage.getItem('name');

        const newCommentObj = {
            userId,
            userName,
            comment: newComment,
        };

        setComments((prevComments) => [...prevComments, newCommentObj]);
        setNewComment('');

        try {
            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/post/${post._id}/comment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newCommentObj),
            });

            if (!response.ok) {
                throw new Error('Failed to add comment');
            }
        } catch (error) {
            console.error('Error adding comment:', error);
            setComments((prevComments) => prevComments.slice(0, -1)); // Revert optimistic update
        } finally {
            setCommentLoading(false);
        }
    };

    const handleEditComment = (commentId, commentText) => {
        setEditingCommentId(commentId);
        setEditedComment(commentText);
    };

    const handleSaveEditedComment = async (commentId) => {
        if (editedComment.trim() === '') return;

        setCommentLoading(true);

        // console.log(post._id);
        // console.log(commentId);

        try {
            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/post/${post._id}/comment/${commentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ comment: editedComment }),
            });

            if (!response.ok) {
                throw new Error('Failed to edit comment');
            }

            // Update the comment in the UI after saving
            setComments((prevComments) =>
                prevComments.map((comment) =>
                    comment._id === commentId ? { ...comment, comment: editedComment } : comment
                )
            );

            setEditingCommentId(null); // Exit edit mode
        } catch (error) {
            console.error('Error editing comment:', error);
        } finally {
            setCommentLoading(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        setCommentLoading(true);

        try {
            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/post/${post._id}/comment/${commentId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete comment');
            }

            // Remove the comment from the UI after deletion
            setComments((prevComments) => prevComments.filter((comment) => comment._id !== commentId));
        } catch (error) {
            console.error('Error deleting comment:', error);
        } finally {
            setCommentLoading(false);
        }
    };

    const settings = {
        dots: true,
        infinite: post.imageUrls.length > 1,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
    };

    const postTypeStyles = {
        lost: {
            backgroundColor: '#ffe5e5',
            color: '#d32f2f',
        },
        found: {
            backgroundColor: '#e8f5e9',
            color: '#388e3c',
        },
    };

    const isSmallScreen = useMediaQuery('(max-width:600px)');

    // console.log(post);
    return (

        <Card sx={{ margin: '20px 0', padding: '20px', ...postTypeStyles[post.postType] }}>
            {loadingUser ? (
                <CircularProgress />
            ) : (
                <Box display="flex" alignItems="center" mb={2}>
                    <Avatar alt="User Avatar" src={profilePhoto} sx={{ width: 56, height: 56 }} />
                    <Typography variant="h6" ml={2} component={Link} to={`/profile/${post.uid}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        {name}
                    </Typography>
                </Box>
            )}

            <CardContent>
                <Box display="flex" justifyContent="space-between" mt={1}>
                    <Typography variant="body2" sx={{ color: postTypeStyles[post.postType].color }}>
                        Location: {post.location}
                    </Typography>
                    <Typography variant="body2" sx={{ color: postTypeStyles[post.postType].color }}>
                        Type: {post.postType.charAt(0).toUpperCase() + post.postType.slice(1)}
                    </Typography>
                </Box>

                <Typography variant="body1" mt={1}>{post.description}</Typography>

                {post.imageUrls && post.imageUrls.length > 0 && (
                    <Box mt={2}>
                        <Slider {...settings}>
                            {post.imageUrls.map((url, index) => (
                                <div key={index}>
                                    <img
                                        src={url}
                                        alt={`Post image ${index + 1}`}
                                        style={{
                                            width: '100%',
                                            height: '200px',
                                            objectFit: 'contain',
                                            borderRadius: '8px',
                                        }}
                                    />
                                </div>
                            ))}
                        </Slider>
                    </Box>
                )}
            </CardContent>

            <Box display="flex" justifyContent="space-between" mt={2}>
                <Button
                    variant="outlined"
                    onClick={() => setShowComments(!showComments)}
                    fullWidth
                    sx={{ marginRight: '10px', padding: '10px', fontSize: '0.775rem' }}

                >
                    {showComments ? (isSmallScreen ? '💬' : 'Hide Comments') : (isSmallScreen ? '💬' : 'Show Comments')}
                </Button>
                <Button
                    variant="contained"
                    color="success"
                    startIcon={!isSmallScreen && <WhatsAppIcon />}
                    onClick={() => window.open(`https://wa.me/91${whatsapp}`, '_blank')}
                    fullWidth
                    sx={{
                        marginRight: '10px',
                        padding: '10px',
                        '&:hover': { backgroundColor: '#66bb6a' },
                    }}
                >
                    {isSmallScreen ? <WhatsAppIcon /> : 'Message'}
                </Button>
                <Button
                    color="error"
                    variant="contained"
                    onClick={() => window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${email}`, '_blank')}
                    startIcon={!isSmallScreen && <EmailIcon />}
                    fullWidth
                    sx={{
                        padding: '10px',
                        backgroundColor: '#d50000',
                        '&:hover': { backgroundColor: '#a00000' },
                    }}
                >
                    {isSmallScreen ? <EmailIcon /> : 'Gmail'}
                </Button>
            </Box>

            <Collapse in={showComments}>
                <Box mt={2}>
                    <Typography variant="body2">{comments.length > 0 ? `${comments.length} Comments` : 'No comments yet.'}</Typography>
                    <Divider sx={{ marginY: 1 }} />
                    {comments.map((comment, index) => (
                        <Box key={index} display="flex" mb={2} alignItems="center">
                            <Typography variant="body2" fontWeight="bold" fontSize={15} mr={2} component={Link} to={`/profile/${comment.userId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                {comment.userName } :
                            </Typography>

                            {editingCommentId === comment._id ? (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: { xs: 'column', sm: 'row' },  // Stack on small screens
                                        alignItems: { xs: 'stretch', sm: 'center' },
                                        gap: 1  // Add space between elements
                                    }}
                                >
                                    <TextField
                                        variant="outlined"
                                        value={editedComment}
                                        onChange={(e) => setEditedComment(e.target.value)}
                                        fullWidth
                                        size="small"
                                        sx={{ flexGrow: 1 }} // Allows the input field to take up available space
                                    />
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => handleSaveEditedComment(comment._id)}
                                        sx={{
                                            height: '35px',  // Slightly larger for touch-friendly
                                            mt: { xs: '8px', sm: 0 }  // Add margin-top on small screens for spacing
                                        }}
                                    >
                                        Done
                                    </Button>
                                    <IconButton
                                        onClick={() => setEditingCommentId(null)}
                                        sx={{
                                            color: 'gray',
                                            fontSize: '18px',
                                            mt: { xs: '8px', sm: 0 }  // Add margin-top for small screens
                                        }}
                                    >
                                        Cancel
                                    </IconButton>
                                </Box>
                            ) : (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: { xs: 'column', sm: 'row' },
                                        alignItems: { xs: 'flex-start', sm: 'center' },
                                        gap: 1
                                    }}
                                >
                                    <Typography variant="body2" sx={{ flexGrow: 1 }}>
                                        {comment.comment}
                                    </Typography>
                                    {comment.userId === localStorage.getItem('uid') && (
                                        <>
                                            <IconButton
                                                onClick={() => handleEditComment(comment._id, comment.comment)}
                                                sx={{ p: 0.5 }}  // Smaller padding for a more compact look
                                            >
                                                <EditIcon sx={{ fontSize: 15, color: '#4caf50' }} />
                                            </IconButton>
                                            <IconButton
                                                onClick={() => handleDeleteComment(comment._id)}
                                                sx={{ p: 0.5 }}
                                            >
                                                <DeleteIcon sx={{ fontSize: 15, color: '#f44336' }} />
                                            </IconButton>
                                        </>
                                    )}
                                </Box>
                            )}


                        </Box>
                    ))}
                </Box>

                <Box display="flex" alignItems="center">
                    <TextField
                        label="Add a comment..."
                        variant="outlined"
                        size="small"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        fullWidth
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleCommentSubmit}
                        sx={{ marginLeft: '10px', height: '40px' }}
                        disabled={commentLoading}
                    >
                        {commentLoading ? <CircularProgress size={24} /> : 'Add'}
                    </Button>
                </Box>
            </Collapse>
        </Card>
    );
};

export default PostComponent;
