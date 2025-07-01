import React, { useState } from 'react';

const reportTemplates = [
  {
    id: 'illegal-dumping',
    name: 'Illegal Dumping',
    category: 'Illegal Dumping',
    description: 'Large amounts of waste illegally dumped in unauthorized location',
    priority: 'high',
    severity: 'major',
    tags: ['Environmental', 'Safety Hazard', 'Public Health'],
    estimatedCleanupTime: 120,
    fields: {
      wasteType: '',
      quantity: '',
      locationType: '',
      accessibility: ''
    }
  },
  {
    id: 'overflowing-bin',
    name: 'Overflowing Bin',
    category: 'Overflowing Bin',
    description: 'Garbage bin is full and waste is spilling out',
    priority: 'medium',
    severity: 'moderate',
    tags: ['Aesthetic', 'Public Health'],
    estimatedCleanupTime: 30,
    fields: {
      binType: '',
      overflowLevel: '',
      nearbyFacilities: ''
    }
  },
  {
    id: 'hazardous-waste',
    name: 'Hazardous Waste',
    category: 'Hazardous Waste',
    description: 'Dangerous materials that pose health or environmental risks',
    priority: 'urgent',
    severity: 'critical',
    tags: ['Safety Hazard', 'Environmental', 'Emergency'],
    estimatedCleanupTime: 180,
    fields: {
      materialType: '',
      containerCondition: '',
      safetyConcerns: '',
      immediateRisk: ''
    }
  },
  {
    id: 'broken-infrastructure',
    name: 'Broken Infrastructure',
    category: 'Broken Infrastructure',
    description: 'Damaged public infrastructure like benches, signs, or facilities',
    priority: 'medium',
    severity: 'moderate',
    tags: ['Infrastructure', 'Aesthetic'],
    estimatedCleanupTime: 60,
    fields: {
      infrastructureType: '',
      damageLevel: '',
      safetyImpact: ''
    }
  },
  {
    id: 'graffiti',
    name: 'Graffiti',
    category: 'Graffiti',
    description: 'Unauthorized graffiti or vandalism on public property',
    priority: 'low',
    severity: 'minor',
    tags: ['Aesthetic', 'Vandalism'],
    estimatedCleanupTime: 45,
    fields: {
      surfaceType: '',
      graffitiSize: '',
      contentType: ''
    }
  },
  {
    id: 'litter',
    name: 'General Litter',
    category: 'Litter',
    description: 'Scattered trash and debris in public areas',
    priority: 'low',
    severity: 'minor',
    tags: ['Aesthetic', 'Environmental'],
    estimatedCleanupTime: 20,
    fields: {
      litterType: '',
      coverage: '',
      windFactor: ''
    }
  }
];

export default function ReportTemplates({ onSelectTemplate }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [expandedTemplate, setExpandedTemplate] = useState(null);

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    onSelectTemplate(template);
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': 'text-gray-500',
      'medium': 'text-blue-500',
      'high': 'text-orange-500',
      'urgent': 'text-red-500'
    };
    return colors[priority] || 'text-blue-500';
  };

  const getSeverityColor = (severity) => {
    const colors = {
      'minor': 'text-green-500',
      'moderate': 'text-yellow-500',
      'major': 'text-orange-500',
      'critical': 'text-red-500'
    };
    return colors[severity] || 'text-yellow-500';
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Report Templates</h3>
        <p className="text-gray-600">Choose a template to quickly fill out common report types</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportTemplates.map((template) => (
          <div
            key={template.id}
            className={`bg-white rounded-lg border-2 p-4 cursor-pointer transition-all hover:shadow-md ${
              selectedTemplate?.id === template.id
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-green-300'
            }`}
            onClick={() => handleTemplateSelect(template)}
          >
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-semibold text-gray-800">{template.name}</h4>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium ${getPriorityColor(template.priority)}`}>
                  {template.priority}
                </span>
                <span className={`text-xs font-medium ${getSeverityColor(template.severity)}`}>
                  {template.severity}
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {template.description}
            </p>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Est. Time:</span>
                <span>{template.estimatedCleanupTime} min</span>
              </div>

              <div className="flex flex-wrap gap-1">
                {template.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
                {template.tags.length > 2 && (
                  <span className="text-xs text-gray-500">
                    +{template.tags.length - 2} more
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpandedTemplate(expandedTemplate === template.id ? null : template.id);
              }}
              className="mt-3 text-xs text-green-600 hover:text-green-700 font-medium"
            >
              {expandedTemplate === template.id ? 'Hide Details' : 'View Details'}
            </button>

            {expandedTemplate === template.id && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Template Fields:</h5>
                <div className="space-y-1">
                  {Object.keys(template.fields).map((field) => (
                    <div key={field} className="text-xs text-gray-600">
                      <span className="font-medium">{field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
                      <span className="ml-1 text-gray-500">[User input]</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedTemplate && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-green-800">
                Template Selected: {selectedTemplate.name}
              </h4>
              <p className="text-sm text-green-700 mt-1">
                This template will pre-fill your report form with common values for {selectedTemplate.name.toLowerCase()}.
              </p>
            </div>
            <button
              onClick={() => setSelectedTemplate(null)}
              className="text-green-600 hover:text-green-700 text-sm font-medium"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 