import React from 'react';
import Chip from '@mui/material/Chip';

const Tag = ({ name, color }) => {
    return <Chip label={name} style={{ backgroundColor: color, marginRight: 4, marginBottom: 4 }} />;
};

export default Tag;