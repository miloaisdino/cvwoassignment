// src/components/PostDetails.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { Typography, Button, TextField } from '@mui/material';

interface Post {
    id: number;
    author: string;
    content: string;
}

const PostDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [post, setPost] = useState<Post | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [editedContent, setEditedContent] = useState('');

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/posts/${id}`);
                setPost(response.data.data);
                setEditedContent(response.data.data.content);
            } catch (error) {
                console.error('Error fetching post:', error);
            }
        };

        fetchPost();
    }, [id]);

    const handleEditClick = () => {
        setEditMode(true);
    };

    const handleCancelClick = () => {
        setEditMode(false);
        setEditedContent(post?.content || '');
    };

    const handleSaveClick = async () => {
        try {
            const response = await axios.patch(`http://localhost:8080/posts/${id}`, {
                content: editedContent,
            });

            setPost(response.data.data);
            setEditMode(false);
        } catch (error) {
            console.error('Error updating post:', error);
        }
    };

    return (
        <div>
            <Typography variant="h4">Post Details</Typography>
            {post ? (
                <div>
                    <Typography variant="h6">{post.author}</Typography>
                    {editMode ? (
                        <div>
                            <TextField
                                label="Edit Content"
                                multiline
                                fullWidth
                                variant="outlined"
                                value={editedContent}
                                onChange={(e) => setEditedContent(e.target.value)}
                            />
                            <Button variant="contained" color="primary" onClick={handleSaveClick}>
                                Save
                            </Button>
                            <Button variant="outlined" onClick={handleCancelClick}>
                                Cancel
                            </Button>
                        </div>
                    ) : (
                        <div>
                            <Typography variant="body1">{post.content}</Typography>
                            <Button variant="outlined" onClick={handleEditClick}>
                                Edit
                            </Button>
                        </div>
                    )}
                </div>
            ) : (
                <Typography variant="body1">Loading...</Typography>
            )}
            <Button component={Link} to="/posts" variant="contained" color="primary">
                Back to List
            </Button>
        </div>
    );
};

export default PostDetails;