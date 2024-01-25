import Alert, { AlertProps } from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import axios from 'axios';
import { useState } from 'react';
axios.defaults.withCredentials = true;
const apiInstance = axios.create();

const ApiErrorAlert = () => {
    const [open, setOpen] = useState(false);
    const [severity, setSeverity] = useState<'success' | 'info' | 'warning' | 'error'>('error');
    const [message, setMessage] = useState('');

    const handleClose = () => {
        setOpen(false);
    };

    const showAlert = (newSeverity: 'success' | 'info' | 'warning' | 'error', newMessage: string) => {
        setSeverity(newSeverity);
        setMessage(newMessage);
        setOpen(true);
    };

    // Add a request interceptor
    apiInstance.interceptors.request.use(
        (config) => config,
        (error) => {
            // Do something with the request error
            return Promise.reject(error);
        }
    );

    // Add a response interceptor
    apiInstance.interceptors.response.use(
        (response) => response,
        (error) => {
            // Handle 401 errors
            if (error.response && error.response.status === 401) {
                showAlert('error', 'You are not logged in');
            } else if(error.response && error.response.status === 403) {
                showAlert('error', 'Access denied');
                console.error('API Error:', error);
            } else {
                // Handle other errors
                showAlert('error', 'Validation error: You have blank inputs');
                console.error('API Error:', error);
            }

            return Promise.reject(error);
        }
    );

    const alertDiv = <Alert severity={severity} onClose={handleClose}>
        {message}
    </Alert>;

    return open ? alertDiv : <div />;
};

export {apiInstance, ApiErrorAlert};