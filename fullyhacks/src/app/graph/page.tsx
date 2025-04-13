"use client"
import * as d3 from 'd3';
import React, { useEffect, useRef, useState } from 'react';
import "./graph.css";
import graphData from "./graph.json";
import { getFriendNames } from '../lib/supabase_helper';


const GraphPage = () => {
  const graphRef = useRef<HTMLDivElement>(null);
  const flagsRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // Set dimensions based on window size
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth * 0.97,
        height: window.innerHeight * 0.9
      });
    };

    // Initial dimensions
    updateDimensions();

    // Update dimensions on window resize
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  useEffect(() => {
    if (!graphRef.current || !flagsRef.current || dimensions.width === 0) return;

    // Clear previous SVG if it exists
    d3.select(graphRef.current).selectAll("svg").remove();
    d3.select(graphRef.current).selectAll(".tooltip").remove();

    // Create SVG
    const svg = d3.select(graphRef.current)
      .append("svg")
      .attr("width", dimensions.width)
      .attr("height", dimensions.height);
    
    // Create tooltip
    const tooltip = d3.select(graphRef.current)
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);
    
    // Create simulation
    const simulation = d3.forceSimulation()
      .force("link", d3.forceLink().distance(300).strength(0.7))
      .force("charge", d3.forceManyBody().strength(-200).distanceMax(300).distanceMin(50))
      .force("center", d3.forceCenter(dimensions.width / 2.1, dimensions.height / 2.1))
      .force("collision", d3.forceCollide().radius(40));
    
    // Use the imported graph data directly
    let userId = 123517214
    const friendNames = getFriendNames(userId);
    const graph = graphData;


    
    // Create links
    const link = svg.append("g")
      .selectAll("line")
      .data(graph.links)
      .enter().append("line")
      .attr("stroke-width", "2")
      .attr("class", (d: any) => d.type == null ? "links" : "tunnel-link");
    
    // Create nodes
    const nodes = d3.select(flagsRef.current)
      .selectAll("div")
      .data(graph.nodes)
      .enter()
      .append("div")
      .attr("class", "node-container");
    
    // Add images to nodes
    nodes.each(function(d: any) {
      const container = d3.select(this);
      container.append("img")
        .attr("class", () => "flag flag-" + d.code)
        .attr("alt", () => d.country);
    });
    
    // Add drag behavior
    const drag = d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
    
    nodes.call(drag as any);
    
    // Add event handlers
    nodes.on("mouseover", function(event: any, d: any) {
      tooltip.transition()
        .duration(100)
        .style("opacity", 1);
      tooltip.html("<div>" + d.country + "</div>")
        .style("left", (event.pageX + 5) + "px")
        .style("top", (event.pageY - 25) + "px");
    })
    .on("mouseout", function() {
      tooltip.transition()
        .duration(200)
        .style("opacity", 0);
    });
    
    // Set up simulation
    simulation
      .nodes(graph.nodes)
      .on("tick", ticked);
    
    const linkForce = simulation.force("link") as any;
    linkForce.links(graph.links);
    
    simulation.alphaDecay(0);
    
    function ticked() {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);
      
      nodes.style('left', (d: any) => d.x + 'px')
        .style('top', (d: any) => d.y + 'px');
    }
    
    // Define drag functions
    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    
    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }
    
    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
    
    // Cleanup function
    return () => {
      simulation.stop();
    };
  }, [dimensions]);

  return (
    <div className="graph-container">
      <h2>Country Borders Graph</h2>
      <div id="graph" ref={graphRef} className="graph-svg-container"></div>
      <div id="flags" ref={flagsRef} className="flags-container"></div>
    </div>
  );
};

export default GraphPage;