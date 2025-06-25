import React, { useState } from 'react';
import { Box, Container, Typography, Paper, Button } from '@mui/material';
import FormRenderer from '../components/screen-builder/FormRenderer';

// User's sample screen configuration with dependencies
const sampleConfig = {
  accordions: [
    {
      id: "rqgy34lebqtlqpgadwkff",
      title: "New Accordion",
      isOpen: true,
      sections: [
        {
          id: "7lmk6zq4gv5hdpq5d8h2g8",
          title: "New Section",
          columns: 2,
          widgets: [
            {
              id: "6ajemg2t3h9r8k1m30rkf",
              type: "text",
              label: "Text Field",
              field: "field_vr5wekzl",
              required: false,
              disabled: false,
              hidden: false
            },
            {
              id: "02b7dbmw5p6m5xw93ug37g9",
              type: "radio",
              label: "Show/Hide Demo",
              field: "field_javk8ye8",
              required: false,
              disabled: false,
              hidden: false,
              options: [
                {
                  value: "1",
                  label: "Yes"
                },
                {
                  value: "2",
                  label: "No"
                }
              ]
            },
            {
              id: "vwmnyym6wqomtfk9k4pyj",
              type: "text",
              label: "This field appears when 'Yes' is selected",
              field: "field_mi8giolh",
              required: false,
              disabled: false,
              hidden: false,
              dependency: {
                parentFieldId: "field_javk8ye8",
                condition: "equals",
                action: "show",
                value: "1"
              }
            },
            {
              id: "24yrv7cml5pw84mpifyxoc",
              type: "text",
              label: "Required Field",
              field: "field_dqyot7te",
              required: true,
              disabled: false,
              hidden: false
            }
          ]
        }
      ]
    }
  ]
};

const FormTest: React.FC = () => {
  const [formValues, setFormValues] = useState<Record<string, any>>({
    contactMethod: 'email',
    newsletter: 'true'
  });
  const [submittedValues, setSubmittedValues] = useState<Record<string, any> | null>(null);

  const handleFormChange = (values: Record<string, any>) => {
    setFormValues(values);
  };

  const handleSubmit = () => {
    setSubmittedValues(formValues);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Form Dependency Test
      </Typography>
      <Typography variant="body1" paragraph>
        This page demonstrates how form elements can depend on each other. Try changing the "Preferred Contact Method" 
        and "Subscribe to Newsletter" options to see how other fields appear or disappear based on your selection.
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <FormRenderer
          config={sampleConfig}
          initialValues={formValues}
          onValueChange={handleFormChange}
        />

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Submit
          </Button>
        </Box>
      </Paper>

      {submittedValues && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Submitted Values:
          </Typography>
          <pre style={{ backgroundColor: '#f5f5f5', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
            {JSON.stringify(submittedValues, null, 2)}
          </pre>
        </Paper>
      )}
    </Container>
  );
};

export default FormTest;
