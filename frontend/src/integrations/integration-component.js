// integrations/integration-component.js

import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    CircularProgress,
    Snackbar,
    Alert
} from '@mui/material';
import axios from 'axios';

export const IntegrationComponent = ({ user, org, integrationParams, setIntegrationParams, type, endpoint, label }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState(null);

    const handleConnectClick = async () => {
        try {
            setIsConnecting(true);
            setError(null);
            const formData = new FormData();
            formData.append('user_id', user);
            formData.append('org_id', org);
            const response = await axios.post(`http://localhost:8000/integrations/${endpoint}/authorize`, formData);
            const authURL = response?.data;

            const newWindow = window.open(authURL, `${label} Authorization`, 'width=600, height=600');

            const pollTimer = window.setInterval(() => {
                if (newWindow?.closed !== false) {
                    window.clearInterval(pollTimer);
                    handleWindowClosed();
                }
            }, 200);
        } catch (e) {
            setIsConnecting(false);
            setError(e?.response?.data?.detail || `Failed to authorize ${label}`);
        }
    };

    const handleWindowClosed = async () => {
        try {
            const formData = new FormData();
            formData.append('user_id', user);
            formData.append('org_id', org);
            const response = await axios.post(`http://localhost:8000/integrations/${endpoint}/credentials`, formData);
            const credentials = response.data;
            if (credentials) {
                setIsConnected(true);
                setIntegrationParams(prev => ({ ...prev, credentials: credentials, type }));
            }
            setIsConnecting(false);
        } catch (e) {
            setError(e?.response?.data?.detail || `Failed to retrieve ${label} credentials`);
            setIsConnecting(false);
        }
    };

    useEffect(() => {
        setIsConnected(!!integrationParams?.credentials);
    }, [integrationParams]);

    return (
        <Box sx={{ mt: 2 }}>
            Parameters
            <Box display='flex' alignItems='center' justifyContent='center' sx={{ mt: 2 }}>
                <Button
                    variant='contained'
                    onClick={isConnected ? () => {} : handleConnectClick}
                    color={isConnected ? 'success' : 'primary'}
                    disabled={isConnecting}
                    style={{
                        pointerEvents: isConnected ? 'none' : 'auto',
                        cursor: isConnected ? 'default' : 'pointer',
                        opacity: isConnected ? 1 : undefined
                    }}
                    aria-label={isConnected ? `${label} Connected` : `Connect to ${label}`}
                >
                    {isConnected ? `${label} Connected` : isConnecting ? <CircularProgress size={20} /> : `Connect to ${label}`}
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