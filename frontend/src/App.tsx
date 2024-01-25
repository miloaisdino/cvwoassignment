// src/App.tsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import PostList from './components/PostList';
import PostDetails from './components/PostDetails';
import NewPost from './components/NewPost';
import {AppBar, Toolbar, Button, Avatar, Menu, MenuItem, Typography, Container, Box} from '@mui/material';

const App: React.FC = () => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const auth = document.cookie.match(/^(.*;)?\s*jwt\s*=\s*[^;]+(.*)?$/);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    return (
        <Router>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Forum App
                    </Typography>
                    {auth ? (
                        <div>
                            <Button color="inherit" component={Link} to="/posts">
                                Posts
                            </Button>
                            <Button color="inherit" onClick={handleMenuOpen}>
                                <Avatar alt="User" src="/path-to-profile-pic.jpg" sx={{ width: 32, height: 32, marginRight: 1 }} />
                                User
                            </Button>
                            <Menu
                                id="profile-menu"
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleMenuClose}
                                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                            >
                                <MenuItem component={Link} to="/logout">Logout</MenuItem>
                            </Menu>
                        </div>
                    ) : (
                        <Button color="inherit" component={Link} to="/login">
                            Login
                        </Button>
                    )}
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg">
                <Box
                    sx={{
                        my: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                <Routes>
                    <Route path="/posts" element={<PostList />} />
                    <Route path="/posts/:id" element={<PostDetails />} />
                    <Route path="/new-post" element={<NewPost />} />
                    <Route path="/login" element={<LoginPage logout={false} />} />
                    <Route path="/logout" element={<LoginPage logout={true} />} />
                    <Route path="/*" element={<Navigate to="/posts" />} />
                </Routes>
                </Box>
            </Container>
        </Router>
    );
};

const LoginPage: React.FC<{ logout: boolean }> = ({ logout }) => {
    if(!logout){
        window.location.replace('http://localtest.me:8080/login');
    } else {
        const logoutHandler = async () => {
            try {
               await axios.get('http://localtest.me:8080/logout');
            } catch (error) {
                console.error('Error logging out:', error);
            }
        };
        logoutHandler().then(_ => {
            window.location.replace('/posts');
        });
    }
    return <div />;
};

export default App;
