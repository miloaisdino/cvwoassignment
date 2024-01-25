// components/AdminPage.tsx
import React, { useState, useEffect } from 'react';
import { DataGrid, GridColDef, GridRowId, GridRowSelectionModel } from '@mui/x-data-grid';
import { Button } from '@mui/material';
import axios from 'axios';

interface AdminData {
    id: string;
    email: string;
    banned: boolean;
    isAdmin: boolean;
}

axios.defaults.withCredentials = true;

const AdminPage: React.FC = () => {
    const [adminData, setAdminData] = useState<AdminData[]>([]);
    const [selectionModel, setSelectionModel] = useState<GridRowId[]>([]);

    useEffect(() => {
        // Fetch admin data
        const fetchData = async () => {
            try {
                const response = await axios.get<{ data: AdminData[] }>('http://localtest.me:8080/admin/data');
                setAdminData(response.data.data);
            } catch (error) {
                console.error('Error fetching admin data:', error);
            }
        };

        fetchData();
    }, []);

    const handleUpdateAdminData = async () => {
        try {
            await axios.patch('http://localhost:8080/admin/data', adminData);
            console.log('Admin data updated successfully');
        } catch (error) {
            console.error('Error updating admin data:', error);
        }
    };

    const columns: GridColDef[] = [
        { field: 'id', headerName: 'ID' },
        { field: 'email', headerName: 'Email', flex: 1 },
        { field: 'banned', headerName: 'Banned', flex: 1, renderCell: (params) => (params.value ? 'Yes' : 'No') },
        { field: 'isAdmin', headerName: 'Admin', flex: 1, renderCell: (params) => (params.value ? 'Yes' : 'No') },
    ];

    return (
        <div>
            <h2>Admin Page</h2>
            <div style={{ height: 400, width: '100%' }}>
                <DataGrid
                    rows={adminData}
                    columns={columns}
                    checkboxSelection
                    rowSelectionModel={selectionModel as GridRowSelectionModel}
                    onRowSelectionModelChange={(newSelectionModel: React.SetStateAction<GridRowId[]>) => {
                        setSelectionModel(newSelectionModel);
                    }}
                />
            </div>
            <Button variant="contained" color="primary" onClick={handleUpdateAdminData}>
                Update Admin Data
            </Button>
        </div>
    );
};

export default AdminPage;
