// src/components/PostList.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Card, CardContent, Button, Typography, Grid } from '@mui/material';

const PostList = ({isLogged}: {isLogged: boolean}) => {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get('http://localtest.me:8080/posts');
                setPosts(response.data.data);
            } catch (error) {
                console.error('Error fetching posts:', error);
            }
        };

        fetchPosts();
    }, []);

    return (
        <Grid container spacing={2}>
            <Button disabled={!isLogged} component={Link} to="/new-post" variant="contained" color="primary"
                    sx={{ml: 2, mb: 1, mt: 1}}>
                {isLogged ? "New Post" : "Login to Post"}
            </Button>
            {posts.map((post: any) => (
                <Grid item key={post.id} xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                {post.author}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                {post.content}
                            </Typography>
                            <Button disabled={ post.email === "" } style={{float: 'right'}}
                                    component={Link} to={`/posts/${post.id}`} color="primary">
                                Edit
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};

export default PostList;
