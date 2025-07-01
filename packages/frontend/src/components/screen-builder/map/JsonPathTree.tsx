import React, { useState } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
} from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { getValueByPath } from '../../../services/apiBinding';

interface JsonPathTreeProps {
  jsonPaths: string[];
  expandedPaths: Record<string, boolean>;
  mappedFields: Record<string, { path: string; field: string; subField: string }>;
  selectedPath: string;
  onTogglePathExpansion: (path: string) => void;
  onPathSelect: (path: string) => void;
  renderPathValue: (path: string) => React.ReactNode;
}

const JsonPathTree: React.FC<JsonPathTreeProps> = ({
  jsonPaths,
  expandedPaths,
  mappedFields,
  selectedPath,
  onTogglePathExpansion,
  onPathSelect,
  renderPathValue,
}) => {
  // Helper function to group paths by their parent path
  const groupPathsByParent = (paths: string[], parentPath: string = '') => {
    const result: Record<string, string[]> = {};
    
    paths.forEach(path => {
      if (parentPath === '') {
        // For root level, get the first segment
        const parts = path.split('.');
        const firstSegment = parts[0];
        if (!result[firstSegment]) {
          result[firstSegment] = [];
        }
        if (!result[firstSegment].includes(path)) {
          result[firstSegment].push(path);
        }
      } else if (path.startsWith(parentPath + '.')) {
        // For nested paths, get the next segment after the parent
        const remainingPath = path.substring(parentPath.length + 1);
        const parts = remainingPath.split('.');
        const nextSegment = parts[0];
        const fullPath = `${parentPath}.${nextSegment}`;
        
        if (!result[fullPath]) {
          result[fullPath] = [];
        }
        if (!result[fullPath].includes(path)) {
          result[fullPath].push(path);
        }
      }
    });
    
    return result;
  };

  // Render a group of paths
  const renderGroup = (parentPath: string, depth: number = 0) => {
    const groups = groupPathsByParent(jsonPaths, parentPath);
    const groupPaths = Object.keys(groups).sort();
    
    return (
      <List dense component="div" disablePadding sx={{ pl: depth > 0 ? 2 : 0 }}>
        {groupPaths.map(path => {
          const isExpanded = expandedPaths[path] || false;
          const isMapped = Object.values(mappedFields).some(field => field.path === path);
          const isSelected = selectedPath === path;
          const hasChildren = groups[path].some(childPath => childPath !== path);
          
          return (
            <React.Fragment key={path}>
              <ListItem 
                dense
                sx={{ 
                  pl: depth * 2,
                  bgcolor: isSelected ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                  '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' },
                  borderLeft: isMapped ? '3px solid #4caf50' : 'none',
                }}
              >
                <ListItemIcon sx={{ minWidth: 24 }}>
                  {hasChildren ? (
                    <IconButton 
                      edge="start" 
                      size="small" 
                      onClick={() => onTogglePathExpansion(path)}
                    >
                      {isExpanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
                    </IconButton>
                  ) : null}
                </ListItemIcon>
                <ListItemText 
                  primary={path.split('.').pop() || path} 
                  secondary={renderPathValue(path)}
                  primaryTypographyProps={{ 
                    variant: 'body2',
                    sx: { 
                      fontWeight: isMapped ? 'bold' : 'normal',
                      color: isMapped ? 'primary.main' : 'text.primary',
                    }
                  }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                  onClick={() => onPathSelect(path)}
                  sx={{ cursor: 'pointer' }}
                />
                {isMapped && (
                  <Tooltip title="This path is mapped">
                    <CheckCircleIcon color="success" fontSize="small" />
                  </Tooltip>
                )}
              </ListItem>
              {isExpanded && hasChildren && renderGroup(path, depth + 1)}
            </React.Fragment>
          );
        })}
      </List>
    );
  };

  return renderGroup('');
};

export default JsonPathTree;
