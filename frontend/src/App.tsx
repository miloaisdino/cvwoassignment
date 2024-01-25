// src/App.tsx
import './index.css'
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import PostList from './components/PostList';
import PostDetails from './components/PostDetails';
import NewPost from './components/NewPost';
import {AppBar, Toolbar, Button, Avatar, Menu, MenuItem, Typography, Container, Box} from '@mui/material';
import Icon from '@mui/material/Icon';
import AdminPage from "./components/AdminPage";

interface UserData {
    dp: string;
    name: string;
    email: string;
}

axios.defaults.withCredentials = true;

const App: React.FC = () => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    //const auth = document.cookie.match(/^(.*;)?\s*jwt\s*=\s*[^;]+(.*)?$/);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    useEffect(() => {
        // Fetch user data from /auth/me endpoint
        const fetchUserData = async () => {
            try {
                if(document.cookie.match(/^(.*;)?\s*jwt\s*=\s*[^;]+(.*)?$/)) {
                    const response = await axios.get('http://localtest.me:8080/auth/me');
                    setUserData(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, []);

    return (
        <Router>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6"
                                component={Link}
                                to="/"
                                color="white"
                                sx={{ flexGrow: 1, textDecoration: "none" }}>
                        Forum App
                    </Typography>
                    {userData ? (
                        <div>
                            <Button color="inherit" style={{textTransform: 'none'}} onClick={handleMenuOpen}>
                                <Avatar alt="User" src={userData.dp} sx={{ width: 32, height: 32, marginRight: 1 }} />
                                {/*userData.name*/}
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
                            <Icon>login</Icon>
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
                    <Route path="/posts" element={<PostList isLogged={userData !== null} />} />
                    <Route path="/posts/:id" element={<PostDetails />} />
                    <Route path="/new-post" element={<NewPost />} />
                    <Route path="/login" element={<LoginPage logout={false} />} />
                    <Route path="/logout" element={<LoginPage logout={true} />} />
                    <Route path="/admin" element={<AdminPage />} />
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
