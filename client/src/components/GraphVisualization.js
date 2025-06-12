import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { useTheme } from '../context/ThemeContext';
import '../styles/GraphVisualization.css';

const GraphVisualization = ({ movies = [], onNodeClick }) => {
  const { theme } = useTheme();
  const svgRef = useRef();
  const [selectedNode, setSelectedNode] = useState(null);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });

  // Process movies data into graph format
  useEffect(() => {
    if (!movies.length) return;

    const nodes = [];
    const links = [];
    const nodeMap = new Map();

    // Add movie nodes
    movies.forEach((movie, index) => {
      const movieNode = {
        id: `movie-${movie._id}`,
        name: movie.title,
        type: 'movie',
        data: movie,
        year: movie.year,
        rating: movie.imdb_rating || 0,
        size: Math.max(8, (movie.imdb_rating || 5) * 2),
        color: getMovieColor(movie)
      };
      nodes.push(movieNode);
      nodeMap.set(movieNode.id, movieNode);
    });

    // Add genre nodes and connections
    const genreMap = new Map();
    movies.forEach(movie => {
      if (movie.genres) {
        movie.genres.forEach(genre => {
          let genreNode = genreMap.get(genre);
          if (!genreNode) {
            genreNode = {
              id: `genre-${genre}`,
              name: genre,
              type: 'genre',
              size: 6,
              color: '#ff6b6b',
              count: 0
            };
            genreMap.set(genre, genreNode);
            nodes.push(genreNode);
          }
          genreNode.count++;
          genreNode.size = Math.max(6, genreNode.count * 3);

          // Link movie to genre
          links.push({
            source: `movie-${movie._id}`,
            target: `genre-${genre}`,
            type: 'genre-connection',
            strength: 0.3
          });
        });
      }
    });

    // Add director nodes and connections
    const directorMap = new Map();
    movies.forEach(movie => {
      if (movie.director) {
        let directorNode = directorMap.get(movie.director);
        if (!directorNode) {
          directorNode = {
            id: `director-${movie.director}`,
            name: movie.director,
            type: 'director',
            size: 8,
            color: '#4ecdc4',
            count: 0
          };
          directorMap.set(movie.director, directorNode);
          nodes.push(directorNode);
        }
        directorNode.count++;
        directorNode.size = Math.max(8, directorNode.count * 4);

        // Link movie to director
        links.push({
          source: `movie-${movie._id}`,
          target: `director-${movie.director}`,
          type: 'director-connection',
          strength: 0.5
        });
      }
    });

    // Add actor nodes and connections (limit to main actors)
    const actorMap = new Map();
    movies.forEach(movie => {
      if (movie.cast && Array.isArray(movie.cast)) {
        movie.cast.slice(0, 3).forEach(actor => { // Only top 3 actors
          let actorNode = actorMap.get(actor);
          if (!actorNode) {
            actorNode = {
              id: `actor-${actor}`,
              name: actor,
              type: 'actor',
              size: 6,
              color: '#45b7d1',
              count: 0
            };
            actorMap.set(actor, actorNode);
            nodes.push(actorNode);
          }
          actorNode.count++;
          actorNode.size = Math.max(6, actorNode.count * 2);

          // Link movie to actor
          links.push({
            source: `movie-${movie._id}`,
            target: `actor-${actor}`,
            type: 'actor-connection',
            strength: 0.2
          });
        });
      }
    });

    setGraphData({ nodes, links });
  }, [movies]);

  // Get color for movie node based on rating
  const getMovieColor = (movie) => {
    const rating = movie.imdb_rating || 5;
    if (rating >= 8) return '#f39c12';
    if (rating >= 7) return '#e74c3c';
    if (rating >= 6) return '#9b59b6';
    return '#95a5a6';
  };

  // Initialize D3 force simulation
  useEffect(() => {
    if (!graphData.nodes.length) return;

    const svg = d3.select(svgRef.current);
    const width = 800;
    const height = 600;

    // Clear previous content
    svg.selectAll('*').remove();

    // Create container group
    const container = svg.append('g');

    // Create zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Create force simulation
    const simulation = d3.forceSimulation(graphData.nodes)
      .force('link', d3.forceLink(graphData.links).id(d => d.id).strength(d => d.strength))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => d.size + 2));

    // Create links
    const link = container.append('g')
      .selectAll('line')
      .data(graphData.links)
      .join('line')
      .attr('class', 'graph-link')
      .attr('stroke', theme === 'dark' ? '#555' : '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 1);

    // Create nodes
    const node = container.append('g')
      .selectAll('circle')
      .data(graphData.nodes)
      .join('circle')
      .attr('class', 'graph-node')
      .attr('r', d => d.size)
      .attr('fill', d => d.color)
      .attr('stroke', theme === 'dark' ? '#fff' : '#333')
      .attr('stroke-width', 1.5)
      .style('cursor', 'pointer')
      .call(d3.drag()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }));

    // Create labels
    const label = container.append('g')
      .selectAll('text')
      .data(graphData.nodes)
      .join('text')
      .attr('class', 'graph-label')
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('font-size', d => Math.max(10, d.size / 2))
      .attr('fill', theme === 'dark' ? '#fff' : '#333')
      .text(d => d.name.length > 15 ? d.name.substring(0, 15) + '...' : d.name)
      .style('pointer-events', 'none');

    // Add node interactions
    node
      .on('click', (event, d) => {
        setSelectedNode(d);
        if (onNodeClick && d.type === 'movie') {
          onNodeClick(d.data);
        }
      })
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', d.size * 1.5)
          .attr('stroke-width', 3);

        // Highlight connected nodes and links
        const connectedLinks = graphData.links.filter(l => l.source.id === d.id || l.target.id === d.id);
        const connectedNodeIds = new Set(connectedLinks.flatMap(l => [l.source.id, l.target.id]));

        link
          .attr('stroke-opacity', l => connectedLinks.includes(l) ? 1 : 0.1)
          .attr('stroke-width', l => connectedLinks.includes(l) ? 3 : 1);

        node
          .attr('opacity', n => connectedNodeIds.has(n.id) ? 1 : 0.3);

        label
          .attr('opacity', n => connectedNodeIds.has(n.id) ? 1 : 0.3);
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', d.size)
          .attr('stroke-width', 1.5);

        // Reset all nodes and links
        link
          .attr('stroke-opacity', 0.6)
          .attr('stroke-width', 1);

        node.attr('opacity', 1);
        label.attr('opacity', 1);
      });

    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);

      label
        .attr('x', d => d.x)
        .attr('y', d => d.y);
    });

    // Add legend
    const legend = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', 'translate(20, 20)');

    const legendData = [
      { type: 'movie', color: '#f39c12', label: 'Movies' },
      { type: 'genre', color: '#ff6b6b', label: 'Genres' },
      { type: 'director', color: '#4ecdc4', label: 'Directors' },
      { type: 'actor', color: '#45b7d1', label: 'Actors' }
    ];

    const legendItems = legend.selectAll('.legend-item')
      .data(legendData)
      .join('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * 25})`);

    legendItems.append('circle')
      .attr('r', 8)
      .attr('fill', d => d.color);

    legendItems.append('text')
      .attr('x', 20)
      .attr('y', 5)
      .attr('fill', theme === 'dark' ? '#fff' : '#333')
      .text(d => d.label);

  }, [graphData, theme, onNodeClick]);

  return (
    <div className={`graph-visualization ${theme}`}>
      <div className="graph-header">
        <h3>🕸️ Movie Network Graph</h3>
        <p>Explore relationships between movies, genres, directors, and actors</p>
      </div>
      
      <div className="graph-container">
        <svg
          ref={svgRef}
          width="100%"
          height="600"
          viewBox="0 0 800 600"
          className="graph-svg"
        />
      </div>

      {selectedNode && (
        <div className="node-info">
          <h4>{selectedNode.name}</h4>
          <p>Type: {selectedNode.type}</p>
          {selectedNode.type === 'movie' && selectedNode.data && (
            <>
              <p>Year: {selectedNode.data.year}</p>
              <p>Rating: {selectedNode.data.imdb_rating || 'N/A'}</p>
              <p>Genres: {selectedNode.data.genres?.join(', ') || 'N/A'}</p>
            </>
          )}
          {selectedNode.count && (
            <p>Connected Movies: {selectedNode.count}</p>
          )}
          <button onClick={() => setSelectedNode(null)}>Close</button>
        </div>
      )}

      <div className="graph-controls">
        <p>💡 <strong>Tip:</strong> Drag nodes to explore, hover to highlight connections, click movies for details</p>
      </div>
    </div>
  );
};

export default GraphVisualization;
