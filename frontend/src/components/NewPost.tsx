// src/components/NewPost.tsx
import React, { useState } from 'react';
import { apiInstance, ApiErrorAlert } from '../utils/api';
import {TextField, Button, Typography, Box, Chip, Grid, Stack} from '@mui/material';
import {Link} from "react-router-dom";

const NewPost: React.FC = () => {
    const [content, setContent] = useState('');
    const [tags, setTags] = useState('');
    const [tagList, setTagList] = useState([]);

    const handleTagChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
        setTags(event.target.value);
    };

    const handleAddTag = () => {
        if(tags == ''){return false;}
        // @ts-ignore
        setTagList([...tagList, tags]);
        setTags('');
    };

    const handleDeleteTag = (tagToDelete: never) => {
        setTagList((prevTags) => prevTags.filter((tag: { name: string, color: string }) => tag !== tagToDelete));
    };


    const handleCreatePost = async () => {
        try {
            await apiInstance.post('http://localtest.me:8080/posts', {
                content,
                tags: tagList,
            });

            // Redirect to the post list after creating a new post
            window.location.href = '/posts';
        } catch (error) {
            console.error('Error creating post:', error);
        }
    };

    return (
        <Grid container spacing={1}>
            <Stack spacing={0}>
                <Box>
                    <ApiErrorAlert />
                    <Typography variant="h4">New Post</Typography>
                </Box>
                <Box>
                    <TextField
                        label="Content"
                        multiline
                        fullWidth
                        variant="outlined"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        margin="normal"
                    />
                </Box>
                <Box>
                    <TextField
                        label="Tags"
                        variant="outlined"
                        fullWidth
                        value={tags}
                        onChange={handleTagChange}
                    />
                    <Button variant="contained" color="primary" onClick={handleAddTag} sx={{ mt: 1, mb: 1, mr: 1 }}>
                        Add Tag
                    </Button>

                    <Button component={Link} to="/posts" variant="outlined" color="primary">
                        Back to Posts
                    </Button>

                    {tagList.map((tag) => (
                        <Chip
                            key={tag}
                            label={tag}
                            onDelete={() => handleDeleteTag(tag)}
                            style={{ margin: '4px', padding: '4px' }}
                        />
                    ))}
                </Box>
                <Box>
                    <Button variant="contained" color="primary" onClick={handleCreatePost}>
                        Create Post
                    </Button>
                </Box>
            </Stack>
        </Grid>
    );
};

export default NewPost;
