declare module 'd3-flame-graph';

interface FlamegraphNode {
  children: FlamegraphNode[];
  data: {
    name: string;
    value: number;
    children: FlamegraphNode[];
    code: string;
    filepath: string;
    fade: boolean;
    hide: boolean;
    line: number;
  };
  parent: FlamegraphNode;
  value: number;
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}
