// Utility functions shared between frontend and backend

/**
 * Validates a screen configuration object against the expected schema
 * @param config The screen configuration to validate
 * @returns An object with validation result and errors if any
 */
export function validateScreenConfig(config: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check if config is an object
  if (!config || typeof config !== 'object') {
    errors.push('Screen configuration must be an object');
    return { valid: false, errors };
  }
  
  // Check if accordions is an array
  if (!Array.isArray(config.accordions)) {
    errors.push('Screen configuration must contain an accordions array');
    return { valid: false, errors };
  }
  
  // Validate each accordion
  config.accordions.forEach((accordion: any, index: number) => {
    if (!accordion.id) {
      errors.push(`Accordion at index ${index} is missing an id`);
    }
    
    if (!accordion.title) {
      errors.push(`Accordion at index ${index} is missing a title`);
    }
    
    if (!Array.isArray(accordion.sections)) {
      errors.push(`Accordion at index ${index} is missing sections array`);
    } else {
      // Validate each section
      accordion.sections.forEach((section: any, sectionIndex: number) => {
        if (!section.id) {
          errors.push(`Section at index ${sectionIndex} in accordion ${accordion.title || index} is missing an id`);
        }
        
        if (!section.title) {
          errors.push(`Section at index ${sectionIndex} in accordion ${accordion.title || index} is missing a title`);
        }
        
        if (typeof section.columns !== 'number') {
          errors.push(`Section at index ${sectionIndex} in accordion ${accordion.title || index} is missing columns property`);
        }
        
        if (!Array.isArray(section.widgets)) {
          errors.push(`Section at index ${sectionIndex} in accordion ${accordion.title || index} is missing widgets array`);
        } else {
          // Validate each widget
          section.widgets.forEach((widget: any, widgetIndex: number) => {
            if (!widget.id) {
              errors.push(`Widget at index ${widgetIndex} in section ${section.title || sectionIndex} is missing an id`);
            }
            
            if (!widget.type) {
              errors.push(`Widget at index ${widgetIndex} in section ${section.title || sectionIndex} is missing a type`);
            }
            
            if (!widget.field) {
              errors.push(`Widget at index ${widgetIndex} in section ${section.title || sectionIndex} is missing a field`);
            }
          });
        }
      });
    }
  });
  
  return { valid: errors.length === 0, errors };
}

/**
 * Generates a unique ID for new elements
 * @returns A unique string ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * Creates a deep clone of an object
 * @param obj The object to clone
 * @returns A deep clone of the object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Creates an empty screen configuration template
 * @returns A basic empty screen configuration
 */
export function createEmptyScreenConfig() {
  return {
    accordions: [
      {
        id: generateId(),
        title: 'New Accordion',
        isOpen: true,
        sections: [
          {
            id: generateId(),
            title: 'New Section',
            columns: 2,
            widgets: []
          }
        ]
      }
    ],
    metadata: {}
  };
}
