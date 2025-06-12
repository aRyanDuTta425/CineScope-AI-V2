// Dataset Configuration and Adapter Pattern
// This allows for easy swapping of different datasets while maintaining the same interface

/**
 * Base Dataset Schema - All datasets must conform to this interface
 */
export const BaseDatasetSchema = {
  // Required fields for all datasets
  required: {
    id: 'string',           // Unique identifier
    title: 'string',        // Display name
    description: 'string',  // Brief description
    year: 'number',         // Release/creation year
    embedding: 'array',     // Vector embedding for similarity search
  },
  
  // Optional fields that can be mapped from dataset-specific fields
  optional: {
    rating: 'number',       // Rating/score (0-10)
    genres: 'array',        // Categories/tags
    director: 'string',     // Creator/director
    cast: 'array',          // Main participants/actors
    poster_url: 'string',   // Image URL
    metadata: 'object',     // Additional dataset-specific data
  }
};

/**
 * Dataset Adapter - Transforms dataset-specific format to standardized format
 */
export class DatasetAdapter {
  constructor(config) {
    this.config = config;
    this.type = config.type;
    this.name = config.name;
    this.fieldMappings = config.fieldMappings;
    this.processors = config.processors || {};
  }

  /**
   * Transform a raw item from the dataset to the standard format
   */
  transform(rawItem) {
    const standardItem = {};
    
    // Map required fields
    Object.keys(BaseDatasetSchema.required).forEach(field => {
      const mapping = this.fieldMappings[field];
      if (mapping) {
        standardItem[field] = this.extractValue(rawItem, mapping);
      }
    });

    // Map optional fields
    Object.keys(BaseDatasetSchema.optional).forEach(field => {
      const mapping = this.fieldMappings[field];
      if (mapping) {
        const value = this.extractValue(rawItem, mapping);
        if (value !== undefined && value !== null) {
          standardItem[field] = value;
        }
      }
    });

    // Apply field processors
    Object.keys(this.processors).forEach(field => {
      if (standardItem[field] !== undefined) {
        standardItem[field] = this.processors[field](standardItem[field], rawItem);
      }
    });

    // Store original data in metadata
    standardItem.metadata = {
      ...standardItem.metadata,
      originalData: rawItem,
      datasetType: this.type
    };

    return standardItem;
  }

  /**
   * Extract value from raw item using mapping
   */
  extractValue(item, mapping) {
    if (typeof mapping === 'string') {
      return item[mapping];
    } else if (typeof mapping === 'function') {
      return mapping(item);
    } else if (Array.isArray(mapping)) {
      // Try multiple field names until one is found
      for (const field of mapping) {
        if (item[field] !== undefined) {
          return item[field];
        }
      }
    }
    return undefined;
  }

  /**
   * Validate that the transformed item meets the schema requirements
   */
  validate(transformedItem) {
    const errors = [];
    
    Object.keys(BaseDatasetSchema.required).forEach(field => {
      if (transformedItem[field] === undefined || transformedItem[field] === null) {
        errors.push(`Missing required field: ${field}`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

/**
 * Movie Dataset Configuration
 */
export const MovieDatasetConfig = {
  type: 'movies',
  name: 'Movie Database',
  fieldMappings: {
    id: '_id',
    title: 'title',
    description: ['overview', 'plot', 'description'],
    year: 'year',
    embedding: 'embedding',
    rating: 'imdb_rating',
    genres: 'genres',
    director: 'director',
    cast: 'cast',
    poster_url: 'poster_url'
  },
  processors: {
    rating: (rating) => rating ? parseFloat(rating) : 0,
    year: (year) => year ? parseInt(year) : 0,
    genres: (genres) => Array.isArray(genres) ? genres : genres ? [genres] : [],
    cast: (cast) => Array.isArray(cast) ? cast : cast ? [cast] : []
  }
};

/**
 * Climate Dataset Configuration Template
 */
export const ClimateDatasetConfig = {
  type: 'climate',
  name: 'Climate Research Data',
  fieldMappings: {
    id: '_id',
    title: 'study_title',
    description: 'abstract',
    year: 'publication_year',
    embedding: 'embedding',
    rating: 'impact_score',
    genres: 'research_areas',
    director: 'lead_researcher',
    cast: 'research_team',
    poster_url: 'visualization_url'
  },
  processors: {
    rating: (score) => score ? parseFloat(score) / 100 * 10 : 0, // Convert 0-100 to 0-10
    year: (year) => parseInt(year),
    genres: (areas) => Array.isArray(areas) ? areas : areas ? areas.split(',').map(a => a.trim()) : [],
    cast: (team) => Array.isArray(team) ? team : team ? team.split(',').map(t => t.trim()) : []
  }
};

/**
 * Social Issues Dataset Configuration Template
 */
export const SocialDatasetConfig = {
  type: 'social',
  name: 'Social Issues Research',
  fieldMappings: {
    id: '_id',
    title: 'issue_title',
    description: 'issue_description',
    year: 'reported_year',
    embedding: 'embedding',
    rating: 'urgency_score',
    genres: 'issue_categories',
    director: 'organization',
    cast: 'affected_communities',
    poster_url: 'info_graphic_url'
  },
  processors: {
    rating: (urgency) => urgency ? parseFloat(urgency) : 0,
    year: (year) => parseInt(year),
    genres: (categories) => Array.isArray(categories) ? categories : categories ? [categories] : [],
    cast: (communities) => Array.isArray(communities) ? communities : communities ? [communities] : []
  }
};

/**
 * Dataset Registry - Manages available datasets
 */
export class DatasetRegistry {
  constructor() {
    this.datasets = new Map();
    this.activeDataset = null;
    
    // Register default datasets
    this.register(new DatasetAdapter(MovieDatasetConfig));
  }

  /**
   * Register a new dataset adapter
   */
  register(adapter) {
    this.datasets.set(adapter.type, adapter);
  }

  /**
   * Get available dataset types
   */
  getAvailableDatasets() {
    return Array.from(this.datasets.values()).map(adapter => ({
      type: adapter.type,
      name: adapter.name
    }));
  }

  /**
   * Set the active dataset
   */
  setActiveDataset(type) {
    const adapter = this.datasets.get(type);
    if (!adapter) {
      throw new Error(`Dataset type '${type}' not found`);
    }
    this.activeDataset = adapter;
    return adapter;
  }

  /**
   * Get the current active dataset adapter
   */
  getActiveDataset() {
    return this.activeDataset;
  }

  /**
   * Transform raw data using the active dataset adapter
   */
  transform(rawItems) {
    if (!this.activeDataset) {
      throw new Error('No active dataset set');
    }

    return rawItems.map(item => {
      const transformed = this.activeDataset.transform(item);
      const validation = this.activeDataset.validate(transformed);
      
      if (!validation.valid) {
        console.warn(`Invalid item transformation:`, validation.errors, item);
      }
      
      return transformed;
    }).filter(item => this.activeDataset.validate(item).valid);
  }
}

/**
 * UI Configuration for different dataset types
 */
export const DatasetUIConfig = {
  movies: {
    searchPlaceholder: "Search for movies, actors, directors, or genres...",
    itemName: "movie",
    itemNamePlural: "movies",
    primaryField: "title",
    secondaryField: "year",
    ratingLabel: "IMDb Rating",
    categoriesLabel: "Genres",
    creatorLabel: "Director",
    participantsLabel: "Cast",
    chartLabels: {
      genres: "Genre Distribution",
      talent: "Top Directors",
      yearly: "Movies by Year"
    }
  },
  climate: {
    searchPlaceholder: "Search climate research, topics, or researchers...",
    itemName: "study",
    itemNamePlural: "studies",
    primaryField: "title",
    secondaryField: "year",
    ratingLabel: "Impact Score",
    categoriesLabel: "Research Areas",
    creatorLabel: "Lead Researcher",
    participantsLabel: "Research Team",
    chartLabels: {
      genres: "Research Area Distribution",
      talent: "Top Researchers",
      yearly: "Studies by Year"
    }
  },
  social: {
    searchPlaceholder: "Search social issues, organizations, or communities...",
    itemName: "issue",
    itemNamePlural: "issues",
    primaryField: "title",
    secondaryField: "year",
    ratingLabel: "Urgency Score",
    categoriesLabel: "Issue Categories",
    creatorLabel: "Organization",
    participantsLabel: "Affected Communities",
    chartLabels: {
      genres: "Issue Category Distribution",
      talent: "Top Organizations",
      yearly: "Issues by Year"
    }
  }
};

// Create singleton instance
export const datasetRegistry = new DatasetRegistry();
