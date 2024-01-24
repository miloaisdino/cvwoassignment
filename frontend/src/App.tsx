// src/App.tsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import PostList from './components/PostList';
import PostDetails from './components/PostDetails';
import NewPost from './components/NewPost';
import {AppBar, Toolbar, Button, Avatar, Menu, MenuItem, Typography, Container, Box} from '@mui/material';

const App: React.FC = () => {
    const [auth, setAuth] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        // Perform logout logic here
        setAuth(false);
        handleMenuClose();
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
                                <MenuItem onClick={handleLogout}>Logout</MenuItem>
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
                    <Route path="/login" element={<LoginPage setAuth={setAuth} />} />
                    <Route path="/*" element={<Navigate to="/posts" />} />
                </Routes>
                </Box>
            </Container>
        </Router>
    );
};

const LoginPage: React.FC<{ setAuth: React.Dispatch<React.SetStateAction<boolean>> }> = ({ setAuth }) => {
    setAuth(true);
    window.location.replace('http://localtest.me:8080/login')
    return <div />;
};

export default App;
