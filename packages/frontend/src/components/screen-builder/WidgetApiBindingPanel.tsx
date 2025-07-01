import React from 'react';
import {
  Box,
  Typography,
  Divider,
  FormControlLabel,
  Switch,
  Paper,
  Chip
} from '@mui/material';
import ApiBindingButton from './ApiBindingButton';
import { ApiBindingOptions } from '../../services/apiBinding';

interface WidgetApiBindingPanelProps {
  widgetType: string;
  apiBinding?: ApiBindingOptions;
  onApiBindingChange: (apiBinding: ApiBindingOptions) => void;
}

const WidgetApiBindingPanel: React.FC<WidgetApiBindingPanelProps> = ({
  widgetType,
  apiBinding,
  onApiBindingChange
}) => {
  const handleApiBindingSave = (newApiBinding: ApiBindingOptions) => {
    onApiBindingChange(newApiBinding);
  };

  const handleLoadOnRenderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onApiBindingChange({
      ...apiBinding,
      loadOnRender: event.target.checked
    });
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        API Data Binding
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="body2">Configure API data source</Typography>
        <ApiBindingButton
          widgetType={widgetType}
          initialApiBinding={apiBinding}
          onSave={handleApiBindingSave}
        />
      </Box>
      
      {apiBinding?.apiConfig?.url && (
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="body2" fontWeight="bold" gutterBottom>
            API Configuration
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Endpoint:
              </Typography>
              <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                {apiBinding.apiConfig.method} {apiBinding.apiConfig.url}
              </Typography>
            </Box>
            
            {apiBinding.apiConfig.useMock && (
              <Chip 
                label="Using Mock Data" 
                color="warning" 
                size="small" 
                sx={{ alignSelf: 'flex-start' }}
              />
            )}
            
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={apiBinding.loadOnRender || false}
                  onChange={handleLoadOnRenderChange}
                />
              }
              label="Load data when screen renders"
            />
          </Box>
          
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            Click the API button to edit configuration
          </Typography>
        </Paper>
      )}
      
      {!apiBinding?.apiConfig?.url && (
        <Typography variant="body2" color="text.secondary">
          No API binding configured. Click the API button to set up data binding.
        </Typography>
      )}
    </Box>
  );
};

export default WidgetApiBindingPanel;
