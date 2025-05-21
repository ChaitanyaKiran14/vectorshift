// integration-form.js

import { useState } from 'react';
import {
    Box,
    Autocomplete,
    TextField,
} from '@mui/material';
import { IntegrationComponent } from './integrations/integration-component';
import { DataForm } from './data-form';

// In src/integration-form.js
const integrationMapping = {
    'Notion': { component: IntegrationComponent, props: { type: 'Notion', endpoint: 'notion', label: 'Notion' } },
    'Airtable': { component: IntegrationComponent, props: { type: 'Airtable', endpoint: 'airtable', label: 'Airtable' } },
    'Hubspot': { component: IntegrationComponent, props: { type: 'Hubspot', endpoint: 'hubspot', label: 'HubSpot' } }, // Change 'HubSpot' to 'Hubspot'
};

export const IntegrationForm = () => {
    const [integrationParams, setIntegrationParams] = useState({});
    const [user, setUser] = useState('TestUser');
    const [org, setOrg] = useState('TestOrg');
    const [currType, setCurrType] = useState(null);
    const currIntegration = integrationMapping[currType];

    const handleIntegrationTypeChange = (e, value) => {
        setCurrType(value);
        setIntegrationParams({});
    };

    const isFormValid = user.trim() && org.trim();

    return (
        <Box display='flex' justifyContent='center' alignItems='center' flexDirection='column' sx={{ width: '100%' }}>
            <Box display='flex' flexDirection='column'>
                <TextField
                    label="User"
                    value={user}
                    onChange={(e) => setUser(e.target.value)}
                    sx={{ mt: 2 }}
                    error={!user.trim()}
                    helperText={!user.trim() ? 'User is required' : ''}
                    inputProps={{ 'aria-label': 'User' }}
                />
                <TextField
                    label="Organization"
                    value={org}
                    onChange={(e) => setOrg(e.target.value)}
                    sx={{ mt: 2 }}
                    error={!org.trim()}
                    helperText={!org.trim() ? 'Organization is required' : ''}
                    inputProps={{ 'aria-label': 'Organization' }}
                />
                <Autocomplete
                    id="integration-type"
                    options={Object.keys(integrationMapping)}
                    sx={{ width: 300, mt: 2 }}
                    renderInput={(params) => <TextField {...params} label="Integration Type" />}
                    onChange={handleIntegrationTypeChange}
                    disabled={!isFormValid}
                    aria-label="Integration Type"
                />
            </Box>
            {currType && isFormValid && (
                <Box>
                    <currIntegration.component
                        user={user}
                        org={org}
                        integrationParams={integrationParams}
                        setIntegrationParams={setIntegrationParams}
                        {...currIntegration.props}
                    />
                </Box>
            )}
            {integrationParams?.credentials && (
                <Box sx={{ mt: 2 }}>
                    <DataForm
                        integrationType={integrationParams?.type}
                        credentials={integrationParams?.credentials}
                        setIntegrationParams={setIntegrationParams}
                    />
                </Box>
            )}
        </Box>
    );
};