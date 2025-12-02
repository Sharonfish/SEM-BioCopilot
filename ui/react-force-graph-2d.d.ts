declare module 'react-force-graph-2d' {
  import { FC } from 'react';

  interface ForceGraph2DProps {
    ref?: any;
    graphData: {
      nodes: any[];
      links: any[];
    };
    nodeLabel?: (node: any) => string;
    nodeVal?: (node: any) => number;
    nodeColor?: (node: any) => string;
    nodeCanvasObject?: (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => void;
    linkColor?: (link: any) => string;
    linkWidth?: number;
    linkDirectionalParticles?: number;
    onNodeHover?: (node: any) => void;
    onNodeClick?: (node: any) => void;
    cooldownTicks?: number;
    d3VelocityDecay?: number;
    enableNodeDrag?: boolean;
    enableZoomInteraction?: boolean;
    enablePanInteraction?: boolean;
    [key: string]: any;
  }

  const ForceGraph2D: FC<ForceGraph2DProps>;
  export default ForceGraph2D;
}
