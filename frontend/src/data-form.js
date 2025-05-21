import { useState } from 'react';
import {
    Box,
    TextField,
    Button,
} from '@mui/material';
import axios from 'axios';

const endpointMapping = {
    'Notion': 'notion',
    'Airtable': 'airtable',
    'Hubspot': 'hubspot'
};

export const DataForm = ({ integrationType, credentials }) => {
    const [loadedData, setLoadedData] = useState(null);
    const endpoint = endpointMapping[integrationType];

    // In src/data-form.js
const handleLoad = async () => {
    try {
        if (!endpoint) {
            throw new Error(`Invalid integration type: ${integrationType}`);
        }
        const formData = new FormData();
        formData.append('credentials', JSON.stringify(credentials));
        const response = await axios.post(`http://localhost:8000/integrations/${endpoint}/load`, formData);
        const formattedData = JSON.stringify(response.data, null, 2);
        setLoadedData(formattedData);
    } catch (e) {
        console.error('Load error:', e);
        alert(e?.response?.data?.detail || e.message || 'Failed to load data');
    }
};

    return (
        <Box display='flex' justifyContent='center' alignItems='center' flexDirection='column' width='100%'>
            <Box display='flex' flexDirection='column' width='100%'>
                <TextField
                    label="Loaded Data"
                    value={loadedData || ''}
                    sx={{mt: 2}}
                    InputLabelProps={{ shrink: true }}
                    disabled
                />
                <Button
                    onClick={handleLoad}
                    sx={{mt: 2}}
                    variant='contained'
                >
                    Load Data
                </Button>
                <Button
                    onClick={() => setLoadedData(null)}
                    sx={{mt: 1}}
                    variant='contained'
                >
                    Clear Data
                </Button>
            </Box>
        </Box>
    );
}