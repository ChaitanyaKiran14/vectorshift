import React, { useState } from 'react';
import { Button, TextField, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Alert, CircularProgress } from '@mui/material';
import axios from 'axios';

const DataForm = ({ integrationType, credentials }) => {
  const [loadedData, setLoadedData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const endpointMapping = {
    Notion: 'notion',
    Airtable: 'airtable',
    Hubspot: 'hubspot',
  };

  const endpoint = endpointMapping[integrationType];

  const handleLoad = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!endpoint) {
        throw new Error(`Invalid integration type: ${integrationType}`);
      }
      const formData = new FormData();
      formData.append('credentials', JSON.stringify(credentials));
      const response = await axios.post(`http://localhost:8000/integrations/${endpoint}/load`, formData);
      console.log(response.data)
      setLoadedData(response.data);
      
    } catch (e) {
      console.error('Load error:', e);
      setError(e?.response?.data?.detail || e.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 4, p: 2, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleLoad}
          disabled={loading || !credentials}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Load Data'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loadedData && loadedData.length > 0 ? (
        <TableContainer component={Paper} sx={{ maxHeight: 400, overflow: 'auto' }}>
          <Table stickyHeader aria-label="integration data table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.100' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.100' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.100' }}>Type</TableCell>
                
              </TableRow>
            </TableHead>
            <TableBody>
              {loadedData.map((item, index) => (
                <TableRow
                  key={item.id || index}
                  sx={{ '&:nth-of-type(odd)': { bgcolor: 'grey.50' } }}
                >
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.type}</TableCell>
                  
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : loadedData && loadedData.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          No data found for {integrationType}.
        </Alert>
      ) : null}
    </Box>
  );
};

export default DataForm;