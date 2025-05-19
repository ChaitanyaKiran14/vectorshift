// data-form.js

import { useState } from 'react';
import {
    Box,
    Button,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    CircularProgress,
    Snackbar,
    Alert
} from '@mui/material';
import axios from 'axios';

const endpointMapping = {
    'Notion': 'notion',
    'Airtable': 'airtable',
    'HubSpot': 'hubspot', // Add HubSpot
};

export const DataForm = ({ integrationType, credentials, setIntegrationParams }) => {
    const [loadedData, setLoadedData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const endpoint = endpointMapping[integrationType];

    const handleLoad = async () => {
        try {
            setIsLoading(true);
            setError(null);
            setLoadedData(null);
            const formData = new FormData();
            formData.append('credentials', JSON.stringify(credentials));
            const response = await axios.post(`http://localhost:8000/integrations/${endpoint}/load`, formData);
            setLoadedData(response.data);
        } catch (e) {
            setError(e?.response?.data?.detail || 'Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDisconnect = () => {
        setIntegrationParams({}); // Clear credentials
        setLoadedData(null);
    };

    return (
        <Box display='flex' justifyContent='center' alignItems='center' flexDirection='column' width='100%'>
            <Box display='flex' flexDirection='column' width='100%'>
                {loadedData && (
                    <Table sx={{ mt: 2 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Parent ID</TableCell>
                                <TableCell>Parent Name</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loadedData.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{item.id}</TableCell>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell>{item.type}</TableCell>
                                    <TableCell>{item.parent_id || '-'}</TableCell>
                                    <TableCell>{item.parent_path_or_name || '-'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
                <Button
                    onClick={handleLoad}
                    sx={{ mt: 2 }}
                    variant='contained'
                    disabled={isLoading}
                    aria-label="Load Data"
                >
                    {isLoading ? <CircularProgress size={20} /> : 'Load Data'}
                </Button>
                <Button
                    onClick={() => setLoadedData(null)}
                    sx={{ mt: 1 }}
                    variant='contained'
                    disabled={isLoading || !loadedData}
                    aria-label="Clear Data"
                >
                    Clear Data
                </Button>
                <Button
                    onClick={handleDisconnect}
                    sx={{ mt: 1 }}
                    variant='contained'
                    color='error'
                    disabled={isLoading}
                    aria-label="Disconnect Integration"
                >
                    Disconnect
                </Button>
            </Box>
            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={() => setError(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>
        </Box>
    );
};