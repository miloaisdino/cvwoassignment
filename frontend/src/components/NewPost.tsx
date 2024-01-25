// src/components/NewPost.tsx
import React, { useState } from 'react';
import { apiInstance, ApiErrorAlert } from '../utils/api';
import { TextField, Button, Typography } from '@mui/material';

const NewPost: React.FC = () => {
    const [content, setContent] = useState('');

    const handleCreatePost = async () => {
        try {
            await apiInstance.post('http://localtest.me:8080/posts', {
                content,
            });

            // Redirect to the post list after creating a new post
            window.location.href = '/posts';
        } catch (error) {
            console.error('Error creating post:', error);
        }
    };

    return (
        <div>
            <ApiErrorAlert />
            <Typography variant="h4">New Post</Typography>
            <TextField
                label="Content"
                multiline
                fullWidth
                variant="outlined"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                margin="normal"
            />
            <Button variant="contained" color="primary" onClick={handleCreatePost}>
                Create Post
            </Button>
        </div>
    );
};

export default NewPost;
