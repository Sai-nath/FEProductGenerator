import React, { useState } from 'react';
import { IconButton, Tooltip, Badge } from '@mui/material';
import ApiIcon from '@mui/icons-material/Api';
import ApiBindingDialog from './ApiBindingDialog';
import { ApiBindingOptions } from '../../services/apiBinding';

interface ApiBindingButtonProps {
  widgetType: string;
  initialApiBinding?: ApiBindingOptions;
  onSave: (apiBinding: ApiBindingOptions) => void;
}

const ApiBindingButton: React.FC<ApiBindingButtonProps> = ({
  widgetType,
  initialApiBinding,
  onSave
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleSaveApiBinding = (apiBinding: ApiBindingOptions) => {
    onSave(apiBinding);
    setDialogOpen(false);
  };

  const hasApiBinding = !!initialApiBinding?.apiConfig?.url;

  return (
    <>
      <Tooltip title="Configure API Binding">
        <Badge
          color="primary"
          variant="dot"
          invisible={!hasApiBinding}
        >
          <IconButton
            size="small"
            onClick={handleOpenDialog}
            color={hasApiBinding ? "primary" : "default"}
          >
            <ApiIcon fontSize="small" />
          </IconButton>
        </Badge>
      </Tooltip>
      
      <ApiBindingDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSaveApiBinding}
        initialApiBinding={initialApiBinding}
        widgetType={widgetType}
      />
    </>
  );
};

export default ApiBindingButton;
