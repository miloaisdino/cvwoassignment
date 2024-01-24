// src/components/NewPost.tsx
import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Typography } from '@mui/material';

const NewPost: React.FC = () => {
    const [author, setAuthor] = useState('');
    const [content, setContent] = useState('');

    const handleCreatePost = async () => {
        try {
            await axios.post('http://localhost:8080/posts', {
                author,
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
            <Typography variant="h4">New Post</Typography>
            <TextField
                label="Author"
                fullWidth
                variant="outlined"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                margin="normal"
            />
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
