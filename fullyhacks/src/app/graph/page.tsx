"use client"
import * as d3 from 'd3';
import React, { useEffect, useRef, useState } from 'react';
import "./graph.css";
import { getFriendNames } from '../lib/supabase_helper';
import SideBar from '../components/SideBar';

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  isMainUser: boolean;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
}

const GraphPage = () => {
  /*
  <section className="wrapper">
    <div id="stars"></div>
    <div id="stars2"></div>
    <div id="stars3"></div>
  </section> */

  const graphRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [links, setLinks] = useState<GraphLink[]>([]);

  const addNode = (name: string) => {
    const newNode: GraphNode = {
      id: `node_${nodes.length}`,
      name,
      isMainUser: false,
    };
    setNodes((prevNodes) => [...prevNodes, newNode]);
    setLinks((prevLinks) => [
      ...prevLinks,
      { source: "jacob", target: newNode.id },
    ]);
  };

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth * 0.97,
        height: window.innerHeight * 0.9
      });
    };

    //HELLO

    updateDimensions();

    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);
  

  useEffect(() => {
    if (!graphRef.current || dimensions.width === 0) return;

    d3.select(graphRef.current).selectAll("svg").remove();
    d3.select(graphRef.current).selectAll(".tooltip").remove();

    // Create SVG
    const svg = d3.select(graphRef.current)
      .append("svg")
      .attr("width", dimensions.width)
      .attr("height", dimensions.height);
    
    const starfield = svg.append("g").attr("class", "starfield");
    
    
    function animateStar(star: d3.Selection<SVGCircleElement, unknown, null, undefined>, baseOpacity: number, duration: number) {
      star.transition()
        .duration(duration)
        .attr("opacity", baseOpacity * (0.3 + Math.random() * 0.7))
        .on("end", function() {
          animateStar(star, baseOpacity, duration);
        });
    }
    
    // Create tooltip
    const tooltip = d3.select(graphRef.current)
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    // Fetch friend data and create graph
    const setupGraphData = async () => {
      try {
        const userId = 15;
        const friendNames = await getFriendNames(userId);
        
        console.log("Friend names:", friendNames); // Debug log
        
        // Create nodes array with Jacob as the central node
        const initialNodes: GraphNode[] = [
          { 
            id: "jacob", 
            name: "Jacob", 
            isMainUser: true
          },
          ...friendNames.map((name, idx) => ({
            id: `friend_${idx}`,
            name: name,
            isMainUser: false
          }))
        ];

        // Create links - all friends connect to Jacob
        const initialLinks: GraphLink[] = friendNames.map((_, idx) => ({
          source: "jacob",
          target: `friend_${idx}`
        }));

        setNodes(initialNodes);
        setLinks(initialLinks);

        // Create a simple force simulation
        const simulation = d3.forceSimulation<GraphNode>()
          .force("link", d3.forceLink<GraphNode, GraphLink>().id(d => d.id).distance(150))
          .force("charge", d3.forceManyBody().strength(-300))
          .force("center", d3.forceCenter(dimensions.width / 2, dimensions.height / 2))
          .force("collision", d3.forceCollide().radius(100));

        // Create links
        const link = svg.append("g")
          .selectAll("line")
          .data(links)
          .enter().append("line")
          .attr("stroke-width", "2")
          .attr("class", "links")
          .attr("stroke", "#4a4a8a")
          .attr("stroke-dasharray", "5,5")
          .attr("stroke-dashoffset", function() {
            return Math.random() * 10;
          });
        
        // Add cosmic particles along the links
        const particles = svg.append("g")
          .selectAll("circle")
          .data(links.flatMap(link => {
            // Create multiple particles per link
            const count = 3;
            return Array(count).fill(0).map((_, i) => ({
              link,
              position: i / count
            }));
          }))
          .enter()
          .append("circle")
          .attr("r", 2)
          .attr("fill", "#fff")
          .attr("opacity", 0.7)
          .attr("filter", "url(#glow)");
        
        // Animate links
        function animateLinks() {
          link.attr("stroke-dashoffset", function() {
            const current = parseFloat(d3.select(this).attr("stroke-dashoffset"));
            return (current - 0.5) % 10;
          });
          
          // Animate particles along the links
          particles.attr("cx", function(d) {
            const link = d.link;
            const source = link.source as GraphNode;
            const target = link.target as GraphNode;
            const position = d.position;
            const sourceX = source.x || 0;
            const targetX = target.x || 0;
            return sourceX + (targetX - sourceX) * position;
          })
          .attr("cy", function(d) {
            const link = d.link;
            const source = link.source as GraphNode;
            const target = link.target as GraphNode;
            const position = d.position;
            const sourceY = source.y || 0;
            const targetY = target.y || 0;
            return sourceY + (targetY - sourceY) * position;
          });
          
          requestAnimationFrame(animateLinks);
        }
        animateLinks();
        
        // Create nodes
        const node = svg.append("g")
          .selectAll("g")
          .data(nodes)
          .enter()
          .append("g");
        
        // Add glow filter definition
        const defs = svg.append("defs");
        const filter = defs.append("filter")
          .attr("id", "glow")
          .attr("x", "-50%")
          .attr("y", "-50%")
          .attr("width", "200%")
          .attr("height", "200%");
        
        filter.append("feGaussianBlur")
          .attr("stdDeviation", "3")
          .attr("result", "coloredBlur");
        
        const feMerge = filter.append("feMerge");
        feMerge.append("feMergeNode")
          .attr("in", "coloredBlur");
        feMerge.append("feMergeNode")
          .attr("in", "SourceGraphic");
        
        // Add circles to nodes
        node.append("circle")
          .attr("r", d => d.isMainUser ? 40 : 25)  // Make Jacob's node larger
          .attr("fill", d => d.isMainUser ? "#6a5acd" : "#4169e1")  // Cosmic colors
          .attr("stroke", "#fff")
          .attr("stroke-width", "1.5")
          .attr("filter", "url(#glow)");
        
        // Add cosmic pattern to nodes
        node.append("circle")
          .attr("r", d => d.isMainUser ? 35 : 20)  // Slightly smaller than the main circle
          .attr("fill", "none")
          .attr("stroke", "#fff")
          .attr("stroke-width", "0.5")
          .attr("stroke-dasharray", "2,2")
          .attr("opacity", "0.7");
        
        // Add text labels
        node.append("text")
          .text(d => d.name)
          .attr("text-anchor", "middle")
          .attr("dy", 35)
          .style("fill", "#fff")
          .style("font-weight", d => d.isMainUser ? "bold" : "normal")
          .style("font-family", "var(--font-family)")
          .style("text-shadow", "0 0 5px rgba(255, 255, 255, 0.7)");
        
        // Add drag behavior
        const drag = d3.drag<SVGGElement, GraphNode>()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          });
        
        node.call(drag);
        
        // Add event handlers
        node.on("mouseover", function(event, d) {
          tooltip.transition()
            .duration(200)
            .style("opacity", .9);
          tooltip.html(`<div>${d.name}</div>`)
            .style("left", (event.pageX + 5) + "px")
            .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
          tooltip.transition()
            .duration(500)
            .style("opacity", 0);
        });
        
        // Define ticked function
        function ticked() {
          link
            .attr("x1", d => (d.source as GraphNode).x || 0)
            .attr("y1", d => (d.source as GraphNode).y || 0)
            .attr("x2", d => (d.target as GraphNode).x || 0)
            .attr("y2", d => (d.target as GraphNode).y || 0);

          node
            .attr("transform", d => `translate(${d.x || 0},${d.y || 0})`);
        }
        
        // Set up simulation
        simulation
          .nodes(nodes)
          .on("tick", ticked);
        
        // Fix the type error by using type assertion
        const linkForce = simulation.force("link") as d3.ForceLink<GraphNode, GraphLink>;
        linkForce.links(links);
        
        // Restart the simulation with higher alpha to ensure movement
        simulation.alpha(1).restart();
      } catch (error) {
        console.error("Error setting up graph data:", error);
      }
    };

    setupGraphData();
    
    // Cleanup function
    return () => {
      // No need to stop simulation here as it will be garbage collected
    };
  }, [dimensions]);

  useEffect(() => {
    if (!graphRef.current || dimensions.width === 0) return;

    d3.select(graphRef.current).selectAll("svg").remove();
    d3.select(graphRef.current).selectAll(".tooltip").remove();

    // Create SVG
    const svg = d3.select(graphRef.current)
      .append("svg")
      .attr("width", dimensions.width)
      .attr("height", dimensions.height);
    
    const starfield = svg.append("g").attr("class", "starfield");
    
    
    function animateStar(star: d3.Selection<SVGCircleElement, unknown, null, undefined>, baseOpacity: number, duration: number) {
      star.transition()
        .duration(duration)
        .attr("opacity", baseOpacity * (0.3 + Math.random() * 0.7))
        .on("end", function() {
          animateStar(star, baseOpacity, duration);
        });
    }
    
    // Create tooltip
    const tooltip = d3.select(graphRef.current)
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    // Create a simple force simulation
    const simulation = d3.forceSimulation<GraphNode>()
      .force("link", d3.forceLink<GraphNode, GraphLink>().id(d => d.id).distance(150))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(dimensions.width / 2, dimensions.height / 2))
      .force("collision", d3.forceCollide().radius(100));

    // Create links
    const link = svg.append("g")
      .selectAll("line")
      .data(links)
      .enter().append("line")
      .attr("stroke-width", "2")
      .attr("class", "links")
      .attr("stroke", "#4a4a8a")
      .attr("stroke-dasharray", "5,5")
      .attr("stroke-dashoffset", function() {
        return Math.random() * 10;
      });
    
    // Add cosmic particles along the links
    const particles = svg.append("g")
      .selectAll("circle")
      .data(links.flatMap(link => {
        // Create multiple particles per link
        const count = 3;
        return Array(count).fill(0).map((_, i) => ({
          link,
          position: i / count
        }));
      }))
      .enter()
      .append("circle")
      .attr("r", 2)
      .attr("fill", "#fff")
      .attr("opacity", 0.7)
      .attr("filter", "url(#glow)");
    
    // Animate links
    function animateLinks() {
      link.attr("stroke-dashoffset", function() {
        const current = parseFloat(d3.select(this).attr("stroke-dashoffset"));
        return (current - 0.5) % 10;
      });
      
      // Animate particles along the links
      particles.attr("cx", function(d) {
        const link = d.link;
        const source = link.source as GraphNode;
        const target = link.target as GraphNode;
        const position = d.position;
        const sourceX = source.x || 0;
        const targetX = target.x || 0;
        return sourceX + (targetX - sourceX) * position;
      })
      .attr("cy", function(d) {
        const link = d.link;
        const source = link.source as GraphNode;
        const target = link.target as GraphNode;
        const position = d.position;
        const sourceY = source.y || 0;
        const targetY = target.y || 0;
        return sourceY + (targetY - sourceY) * position;
      });
      
      requestAnimationFrame(animateLinks);
    }
    animateLinks();
    
    // Create nodes
    const node = svg.append("g")
      .selectAll("g")
      .data(nodes)
      .enter()
      .append("g");
    
    // Add glow filter definition
    const defs = svg.append("defs");
    const filter = defs.append("filter")
      .attr("id", "glow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");
    
    filter.append("feGaussianBlur")
      .attr("stdDeviation", "3")
      .attr("result", "coloredBlur");
    
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode")
      .attr("in", "coloredBlur");
    feMerge.append("feMergeNode")
      .attr("in", "SourceGraphic");
    
    // Add circles to nodes
    node.append("circle")
      .attr("r", d => d.isMainUser ? 40 : 25)  // Make Jacob's node larger
      .attr("fill", d => d.isMainUser ? "#6a5acd" : "#4169e1")  // Cosmic colors
      .attr("stroke", "#fff")
      .attr("stroke-width", "1.5")
      .attr("filter", "url(#glow)");
    
    // Add cosmic pattern to nodes
    node.append("circle")
      .attr("r", d => d.isMainUser ? 35 : 20)  // Slightly smaller than the main circle
      .attr("fill", "none")
      .attr("stroke", "#fff")
      .attr("stroke-width", "0.5")
      .attr("stroke-dasharray", "2,2")
      .attr("opacity", "0.7");
    
    // Add text labels
    node.append("text")
      .text(d => d.name)
      .attr("text-anchor", "middle")
      .attr("dy", 35)
      .style("fill", "#fff")
      .style("font-weight", d => d.isMainUser ? "bold" : "normal")
      .style("font-family", "var(--font-family)")
      .style("text-shadow", "0 0 5px rgba(255, 255, 255, 0.7)");
    
    // Add drag behavior
    const drag = d3.drag<SVGGElement, GraphNode>()
      .on("start", (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });
    
    node.call(drag);
    
    // Add event handlers
    node.on("mouseover", function(event, d) {
      tooltip.transition()
        .duration(200)
        .style("opacity", .9);
      tooltip.html(`<div>${d.name}</div>`)
        .style("left", (event.pageX + 5) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function() {
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    });
    
    // Define ticked function
    function ticked() {
      link
        .attr("x1", d => (d.source as GraphNode).x || 0)
        .attr("y1", d => (d.source as GraphNode).y || 0)
        .attr("x2", d => (d.target as GraphNode).x || 0)
        .attr("y2", d => (d.target as GraphNode).y || 0);

      node
        .attr("transform", d => `translate(${d.x || 0},${d.y || 0})`);
    }
    
    // Set up simulation
    simulation
      .nodes(nodes)
      .on("tick", ticked);
    
    // Fix the type error by using type assertion
    const linkForce = simulation.force("link") as d3.ForceLink<GraphNode, GraphLink>;
    linkForce.links(links);
    
    // Restart the simulation with higher alpha to ensure movement
    simulation.alpha(1).restart();
  }, [nodes, links, dimensions]);

  return (
    <div className="graph-container">
      <SideBar onAddNode={addNode} /> {/* Ensure addNode is passed here */}
      <h2 className="space-title">STARS NEAR YOU</h2>
      <div id="graph" ref={graphRef} className="graph-svg-container"></div>
    </div>
  );
};

export default GraphPage;