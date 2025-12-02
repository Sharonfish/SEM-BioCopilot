import { useEffect, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

interface Node {
  id: string;
  name: string;
  year: number;
  val: number;
  highlighted?: boolean;
}

interface Link {
  source: string;
  target: string;
}

interface GraphData {
  nodes: Node[];
  links: Link[];
}

const NetworkGraph = () => {
  const fgRef = useRef<any>();
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);

  useEffect(() => {
    // Research paper data matching the image
    const nodes: Node[] = [
      { id: "kessler1963", name: "Kessler", year: 1963, val: 180 },
      { id: "small1973", name: "Small", year: 1973, val: 150 },
      { id: "callon1983", name: "Callon", year: 1983, val: 120 },
      { id: "callon1991", name: "Callon", year: 1991, val: 140 },
      { id: "coulter1998", name: "Coulter", year: 1998, val: 110 },
      { id: "small1999", name: "Small", year: 1999, val: 130 },
      { id: "noyons1999", name: "Noyons", year: 1999, val: 140 },
      { id: "boyack2004", name: "Boyack", year: 2004, val: 160 },
      { id: "borner2005", name: "Borner", year: 2005, val: 145 },
      { id: "eck2009", name: "Eck", year: 2009, val: 200 },
      { id: "eck2010", name: "Eck", year: 2010, val: 165 },
      { id: "waltman2010", name: "Waltman", year: 2010, val: 155 },
      { id: "cobo2011", name: "Cobo", year: 2011, val: 190, highlighted: true },
      { id: "cobo2011b", name: "Cobo", year: 2011, val: 175 },
      { id: "cobo2012", name: "Cobo", year: 2012, val: 180 },
      { id: "eck2014", name: "Eck", year: 2014, val: 170 },
      { id: "martinez2014", name: "Martinez", year: 2014, val: 135 },
      { id: "martinez2015", name: "Martinez", year: 2015, val: 155 },
      { id: "murgado2014", name: "Murgado-Armenteros", year: 2014, val: 165 },
      { id: "moral2014", name: "Moral-Munoz", year: 2014, val: 125 },
      { id: "cobo2015", name: "Cobo", year: 2015, val: 160 },
      { id: "herrera2016", name: "Herrera-Viedma", year: 2016, val: 140 },
      { id: "aria2017", name: "Aria", year: 2017, val: 240 },
      { id: "aria2017b", name: "Aria", year: 2017, val: 145 },
      { id: "smyrnova2017", name: "Smyrnova-Trybulska", year: 2017, val: 135 },
      { id: "gutierrez2017", name: "Gutiérrez-Salcedo", year: 2017, val: 175 },
      { id: "cobo2017", name: "Cobo", year: 2017, val: 145 },
      { id: "baier2018", name: "Baier-Fuentes", year: 2018, val: 155 },
      { id: "cobo2018", name: "Cobo", year: 2018, val: 135 },
      { id: "cobo2018b", name: "Cobo", year: 2018, val: 125 },
      { id: "hu2018", name: "Hu", year: 2018, val: 145 },
      { id: "bales2019", name: "Bales", year: 2019, val: 140 },
      { id: "moral2019", name: "Moral-Munoz", year: 2019, val: 150 },
      { id: "guerrero2019", name: "Guerrero", year: 2019, val: 135 },
      { id: "jiang2019", name: "Jiang", year: 2019, val: 160 },
      { id: "lou2020", name: "Lou", year: 2020, val: 140 },
      { id: "moral2020", name: "Moral-Munoz", year: 2020, val: 130 },
      { id: "baier2021", name: "Baier-Fuentes", year: 2021, val: 145 },
      { id: "rusydiana2021", name: "Rusydiana", year: 2021, val: 150 },
      { id: "sajovic2022", name: "Sajovic", year: 2022, val: 135 },
      { id: "velez2022", name: "Vélez-Estévez", year: 2022, val: 125 },
    ];

    const links: Link[] = [
      { source: "kessler1963", target: "small1973" },
      { source: "small1973", target: "small1999" },
      { source: "small1973", target: "callon1983" },
      { source: "callon1983", target: "callon1991" },
      { source: "callon1983", target: "coulter1998" },
      { source: "callon1991", target: "coulter1998" },
      { source: "callon1991", target: "borner2005" },
      { source: "coulter1998", target: "borner2005" },
      { source: "small1999", target: "noyons1999" },
      { source: "noyons1999", target: "eck2009" },
      { source: "noyons1999", target: "waltman2010" },
      { source: "waltman2010", target: "eck2010" },
      { source: "eck2009", target: "eck2010" },
      { source: "eck2009", target: "cobo2011" },
      { source: "eck2010", target: "cobo2011" },
      { source: "eck2010", target: "eck2014" },
      { source: "borner2005", target: "boyack2004" },
      { source: "boyack2004", target: "martinez2014" },
      { source: "cobo2011", target: "cobo2011b" },
      { source: "cobo2011", target: "cobo2012" },
      { source: "cobo2011", target: "aria2017" },
      { source: "cobo2011", target: "eck2014" },
      { source: "cobo2011b", target: "cobo2012" },
      { source: "cobo2012", target: "aria2017" },
      { source: "cobo2012", target: "martinez2015" },
      { source: "cobo2012", target: "gutierrez2017" },
      { source: "aria2017", target: "aria2017b" },
      { source: "aria2017", target: "bales2019" },
      { source: "aria2017", target: "smyrnova2017" },
      { source: "eck2014", target: "smyrnova2017" },
      { source: "smyrnova2017", target: "lou2020" },
      { source: "martinez2014", target: "martinez2015" },
      { source: "martinez2015", target: "gutierrez2017" },
      { source: "martinez2015", target: "murgado2014" },
      { source: "murgado2014", target: "gutierrez2017" },
      { source: "gutierrez2017", target: "cobo2015" },
      { source: "gutierrez2017", target: "moral2014" },
      { source: "cobo2015", target: "cobo2017" },
      { source: "cobo2015", target: "herrera2016" },
      { source: "moral2014", target: "herrera2016" },
      { source: "herrera2016", target: "cobo2017" },
      { source: "cobo2017", target: "cobo2018" },
      { source: "cobo2017", target: "velez2022" },
      { source: "cobo2018", target: "cobo2018b" },
      { source: "cobo2018b", target: "velez2022" },
      { source: "bales2019", target: "moral2019" },
      { source: "bales2019", target: "moral2020" },
      { source: "moral2019", target: "moral2020" },
      { source: "moral2020", target: "baier2018" },
      { source: "baier2018", target: "hu2018" },
      { source: "baier2018", target: "baier2021" },
      { source: "hu2018", target: "guerrero2019" },
      { source: "guerrero2019", target: "sajovic2022" },
      { source: "lou2020", target: "baier2018" },
      { source: "martinez2014", target: "jiang2019" },
      { source: "boyack2004", target: "rusydiana2021" },
    ];

    setGraphData({ nodes, links });
  }, []);

  const getNodeColor = (node: Node) => {
    if (node.highlighted) {
      return "hsl(var(--node-dark))";
    }
    // Vary colors based on node size
    if (node.val > 180) return "hsl(var(--node-darker))";
    if (node.val > 150) return "hsl(var(--node-dark))";
    if (node.val > 130) return "hsl(var(--node-medium))";
    return "hsl(var(--node-light))";
  };

  const handleZoomIn = () => {
    if (fgRef.current) {
      fgRef.current.zoom(fgRef.current.zoom() * 1.2, 400);
    }
  };

  const handleZoomOut = () => {
    if (fgRef.current) {
      fgRef.current.zoom(fgRef.current.zoom() * 0.8, 400);
    }
  };

  const handleResetView = () => {
    if (fgRef.current) {
      fgRef.current.zoomToFit(400, 80);
    }
  };

  return (
    <div className="relative w-full h-screen bg-background">
      <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
        <Button
          onClick={handleZoomIn}
          size="icon"
          variant="secondary"
          className="shadow-lg"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          onClick={handleZoomOut}
          size="icon"
          variant="secondary"
          className="shadow-lg"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          onClick={handleResetView}
          size="icon"
          variant="secondary"
          className="shadow-lg"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>

      {hoveredNode && (
        <div className="absolute top-6 right-6 z-10 bg-card p-4 rounded-lg shadow-lg border border-border">
          <h3 className="font-semibold text-foreground">{hoveredNode.name}</h3>
          <p className="text-sm text-muted-foreground">{hoveredNode.year}</p>
        </div>
      )}

      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        nodeLabel={(node: any) => `${node.name}, ${node.year}`}
        nodeVal={(node: any) => node.val}
        nodeColor={(node: any) => getNodeColor(node as Node)}
        nodeCanvasObject={(node: any, ctx, globalScale) => {
          const label = `${node.name}, ${node.year}`;
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px Inter, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "rgba(255, 255, 255, 0.95)";

          const size = Math.sqrt(node.val) * 0.8;

          // Draw node circle
          ctx.beginPath();
          ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
          ctx.fillStyle = getNodeColor(node);
          ctx.fill();

          // Draw highlight ring if highlighted
          if (node.highlighted) {
            ctx.strokeStyle = "hsl(var(--highlight-ring))";
            ctx.lineWidth = 3 / globalScale;
            ctx.beginPath();
            ctx.arc(node.x, node.y, size + 4 / globalScale, 0, 2 * Math.PI);
            ctx.stroke();
          }

          // Draw label
          ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
          ctx.fillText(label, node.x, node.y);
        }}
        linkColor={() => "hsl(var(--link-color))"}
        linkWidth={1}
        linkDirectionalParticles={0}
        onNodeHover={(node: any) => setHoveredNode(node as Node | null)}
        onNodeClick={(node: any) => {
          if (fgRef.current) {
            fgRef.current.centerAt(node.x, node.y, 1000);
            fgRef.current.zoom(2, 1000);
          }
        }}
        cooldownTicks={100}
        d3VelocityDecay={0.3}
        enableNodeDrag={true}
        enableZoomInteraction={true}
        enablePanInteraction={true}
      />
    </div>
  );
};

export default NetworkGraph;
