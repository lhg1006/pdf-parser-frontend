import { Rnd } from 'react-rnd';
import { Box } from '@/types/box';

type BoxState = {
  [pageNumber: number]: Box[];
};

interface SelectionBoxProps {
  box: Box;
  boxes: Box[];
  allBoxes: BoxState;
  pageSize: { width: number; height: number };
  onBoxUpdate: (boxes: Box[]) => void;
  onAddSubBox: (parentId: string, parentIndex: number) => void;
  onRemoveBox: (id: string) => void;
}

export default function SelectionBox({
  box,
  boxes,
  allBoxes,
  pageSize,
  onBoxUpdate,
  onAddSubBox,
  onRemoveBox
}: SelectionBoxProps) {
  // 모든 페이지에서 메인박스 찾기
  const findMainBox = (parentId: string) => {
    for (const pageBoxes of Object.values(allBoxes)) {
      const mainBox = pageBoxes.find(b => b.id === parentId);
      if (mainBox) return mainBox;
    }
    return undefined;
  };

  return (
    <Rnd
      style={{
        border: `2px solid ${box.isMain ? '#1a73e8' : '#ea4335'}`,
        background: box.isMain ? 'rgba(26, 115, 232, 0.1)' : 'rgba(234, 67, 53, 0.1)',
        position: 'absolute',
        zIndex: 1000,
      }}
      bounds="parent"
      default={{
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
      }}
      onDragStop={(e, d) => {
        onBoxUpdate(boxes.map(b => 
          b.id === box.id ? {
            ...b,
            x: Math.max(0, Math.min(d.x, pageSize.width - b.width)),
            y: Math.max(0, Math.min(d.y, pageSize.height - b.height))
          } : b
        ));
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        const newWidth = parseInt(ref.style.width);
        const newHeight = parseInt(ref.style.height);
        const newX = Math.max(0, Math.min(position.x, pageSize.width - newWidth));
        const newY = Math.max(0, Math.min(position.y, pageSize.height - newHeight));

        onBoxUpdate(boxes.map(b => 
          b.id === box.id ? {
            ...b,
            x: newX,
            y: newY,
            width: Math.min(newWidth, pageSize.width - newX),
            height: Math.min(newHeight, pageSize.height - newY)
          } : b
        ));
      }}
    >
      <div style={{ 
        position: 'absolute', 
        top: '-24px', 
        right: '-4px',
        display: 'flex',
        gap: '4px'
      }}>
        {box.isMain && (
          <button
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              border: '1px solid #1a73e8',
              background: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
            onClick={() => onAddSubBox(box.id, box.boxIndex)}
          >
            +
          </button>
        )}
        <button
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            border: `1px solid ${box.isMain ? '#1a73e8' : '#ea4335'}`,
            background: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}
          onClick={() => onRemoveBox(box.id)}
        >
          ×
        </button>
      </div>
      <div style={{
        position: 'absolute',
        top: '-24px',
        left: '0',
        fontSize: '12px',
        color: box.isMain ? '#1a73e8' : '#ea4335',
        background: 'white',
        padding: '2px 6px',
        borderRadius: '4px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        {box.isMain 
          ? box.boxIndex 
          : `${findMainBox(box.parentId!)?.boxIndex}-${box.boxIndex}`
        }
      </div>
    </Rnd>
  );
} 