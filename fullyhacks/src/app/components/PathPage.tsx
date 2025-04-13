'use client';                 

// import Graph from './Graph'; 
import React from 'react';

interface PathPageProps {
    width?: number;
    height?: number;
}

const PathPage: React.FC<PathPageProps> = ({ width = 800, height = 500 }) => {
    /* 👇  IMPORTANT – we **return** JSX  */
    return (
    <div className="flex items-center justify-center">
        {/* <Graph width={width} height={height} /> */}
    </div>
    );
};

export default PathPage;
   