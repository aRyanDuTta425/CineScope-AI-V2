import React, { useState, useEffect } from 'react';
import { datasetRegistry, DatasetAdapter, ClimateDatasetConfig, SocialDatasetConfig, DatasetUIConfig } from '../utils/DatasetAdapter';
import { useTheme } from '../context/ThemeContext';
import '../styles/DatasetSwitcher.css';

const DatasetSwitcher = ({ onDatasetChange, currentDataset = 'movies' }) => {
  const { theme } = useTheme();
  const [availableDatasets, setAvailableDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState(currentDataset);
  const [showModal, setShowModal] = useState(false);
  const [newDatasetConfig, setNewDatasetConfig] = useState({
    type: '',
    name: '',
    mongoCollection: '',
    fieldMappings: {
      id: '',
      title: '',
      description: '',
      year: '',
      embedding: '',
      rating: '',
      genres: '',
      director: '',
      cast: '',
      poster_url: ''
    }
  });

  useEffect(() => {
    // Register additional dataset templates
    if (!datasetRegistry.datasets.has('climate')) {
      datasetRegistry.register(new DatasetAdapter(ClimateDatasetConfig));
    }
    if (!datasetRegistry.datasets.has('social')) {
      datasetRegistry.register(new DatasetAdapter(SocialDatasetConfig));
    }

    // Set initial active dataset
    datasetRegistry.setActiveDataset(currentDataset);
    
    // Update available datasets
    setAvailableDatasets(datasetRegistry.getAvailableDatasets());
  }, [currentDataset]);

  const handleDatasetChange = (datasetType) => {
    try {
      datasetRegistry.setActiveDataset(datasetType);
      setSelectedDataset(datasetType);
      
      if (onDatasetChange) {
        onDatasetChange(datasetType, DatasetUIConfig[datasetType]);
      }
    } catch (error) {
      console.error('Failed to switch dataset:', error);
    }
  };

  const handleAddCustomDataset = () => {
    if (!newDatasetConfig.type || !newDatasetConfig.name) {
      alert('Please provide dataset type and name');
      return;
    }

    try {
      const customConfig = {
        type: newDatasetConfig.type,
        name: newDatasetConfig.name,
        fieldMappings: { ...newDatasetConfig.fieldMappings },
        processors: {
          rating: (rating) => rating ? parseFloat(rating) : 0,
          year: (year) => year ? parseInt(year) : 0,
          genres: (genres) => Array.isArray(genres) ? genres : genres ? [genres] : [],
          cast: (cast) => Array.isArray(cast) ? cast : cast ? [cast] : []
        }
      };

      datasetRegistry.register(new DatasetAdapter(customConfig));
      setAvailableDatasets(datasetRegistry.getAvailableDatasets());
      setShowModal(false);
      
      // Reset form
      setNewDatasetConfig({
        type: '',
        name: '',
        mongoCollection: '',
        fieldMappings: {
          id: '',
          title: '',
          description: '',
          year: '',
          embedding: '',
          rating: '',
          genres: '',
          director: '',
          cast: '',
          poster_url: ''
        }
      });

      alert(`Dataset "${customConfig.name}" added successfully!`);
    } catch (error) {
      console.error('Failed to add custom dataset:', error);
      alert('Failed to add custom dataset');
    }
  };

  const getCurrentDatasetInfo = () => {
    const dataset = availableDatasets.find(d => d.type === selectedDataset);
    const uiConfig = DatasetUIConfig[selectedDataset];
    return { dataset, uiConfig };
  };

  const { dataset: currentDatasetInfo, uiConfig } = getCurrentDatasetInfo();

  return (
    <div className={`dataset-switcher ${theme}`}>
      <div className="switcher-header">
        <h3>🔄 Dataset Switcher</h3>
        <p>Switch between different data sources or add your own</p>
      </div>

      <div className="current-dataset">
        <h4>Current Dataset</h4>
        <div className="dataset-card active">
          <div className="dataset-icon">
            {selectedDataset === 'movies' && '🎬'}
            {selectedDataset === 'climate' && '🌍'}
            {selectedDataset === 'social' && '🤝'}
          </div>
          <div className="dataset-info">
            <h5>{currentDatasetInfo?.name || 'Unknown Dataset'}</h5>
            <p>{uiConfig?.searchPlaceholder || 'No description available'}</p>
            <span className="dataset-type">{selectedDataset}</span>
          </div>
        </div>
      </div>

      <div className="available-datasets">
        <h4>Available Datasets</h4>
        <div className="datasets-grid">
          {availableDatasets.map(dataset => (
            <div
              key={dataset.type}
              className={`dataset-card ${dataset.type === selectedDataset ? 'active' : ''}`}
              onClick={() => handleDatasetChange(dataset.type)}
            >
              <div className="dataset-icon">
                {dataset.type === 'movies' && '🎬'}
                {dataset.type === 'climate' && '🌍'}
                {dataset.type === 'social' && '🤝'}
                {!['movies', 'climate', 'social'].includes(dataset.type) && '📊'}
              </div>
              <div className="dataset-info">
                <h5>{dataset.name}</h5>
                <p>{DatasetUIConfig[dataset.type]?.searchPlaceholder || 'Custom dataset'}</p>
                <span className="dataset-type">{dataset.type}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="add-dataset">
        <button 
          className="add-dataset-btn"
          onClick={() => setShowModal(true)}
        >
          ➕ Add Custom Dataset
        </button>
      </div>

      {showModal && (
        <div className="dataset-modal-overlay">
          <div className="dataset-modal">
            <div className="modal-header">
              <h3>Add Custom Dataset</h3>
              <button 
                className="close-btn"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-content">
              <div className="form-section">
                <h4>Basic Information</h4>
                <div className="form-group">
                  <label>Dataset Type (ID)</label>
                  <input
                    type="text"
                    value={newDatasetConfig.type}
                    onChange={(e) => setNewDatasetConfig(prev => ({
                      ...prev,
                      type: e.target.value
                    }))}
                    placeholder="e.g., books, products, research"
                  />
                </div>

                <div className="form-group">
                  <label>Dataset Name</label>
                  <input
                    type="text"
                    value={newDatasetConfig.name}
                    onChange={(e) => setNewDatasetConfig(prev => ({
                      ...prev,
                      name: e.target.value
                    }))}
                    placeholder="e.g., Book Database"
                  />
                </div>

                <div className="form-group">
                  <label>MongoDB Collection</label>
                  <input
                    type="text"
                    value={newDatasetConfig.mongoCollection}
                    onChange={(e) => setNewDatasetConfig(prev => ({
                      ...prev,
                      mongoCollection: e.target.value
                    }))}
                    placeholder="e.g., books_collection"
                  />
                </div>
              </div>

              <div className="form-section">
                <h4>Field Mappings</h4>
                <p>Map your dataset fields to the standard schema:</p>
                
                {Object.keys(newDatasetConfig.fieldMappings).map(field => (
                  <div key={field} className="form-group">
                    <label>{field} {['id', 'title', 'description', 'year', 'embedding'].includes(field) && '*'}</label>
                    <input
                      type="text"
                      value={newDatasetConfig.fieldMappings[field]}
                      onChange={(e) => setNewDatasetConfig(prev => ({
                        ...prev,
                        fieldMappings: {
                          ...prev.fieldMappings,
                          [field]: e.target.value
                        }
                      }))}
                      placeholder={`Your dataset's ${field} field name`}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-actions">
              <button 
                className="cancel-btn"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button 
                className="add-btn"
                onClick={handleAddCustomDataset}
              >
                Add Dataset
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="dataset-guide">
        <h4>📋 Developer Guide</h4>
        <div className="guide-content">
          <h5>Adding Your Own Dataset:</h5>
          <ol>
            <li><strong>Prepare your data:</strong> Ensure it has required fields (id, title, description, year, embedding)</li>
            <li><strong>Upload to MongoDB:</strong> Create a collection in your MongoDB database</li>
            <li><strong>Configure mapping:</strong> Use the form above to map your fields to the standard schema</li>
            <li><strong>Generate embeddings:</strong> Use the server's embedding generation script for vector search</li>
          </ol>
          
          <h5>Example Dataset Schema:</h5>
          <pre className="code-block">
{`{
  "_id": "unique_id",
  "title": "Item Name", 
  "description": "Detailed description",
  "year": 2024,
  "embedding": [0.1, 0.2, ...], // 768-dim vector
  "custom_rating": 8.5,
  "categories": ["category1", "category2"],
  "creator": "Creator Name",
  "participants": ["person1", "person2"]
}`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default DatasetSwitcher;
