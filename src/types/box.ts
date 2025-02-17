export interface Box {
  id: string;
  boxIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  isMain: boolean;
  parentId?: string;
} 