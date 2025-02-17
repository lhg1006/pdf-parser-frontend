import { Document, Page } from 'react-pdf';
import { ButtonStyle } from '@/styles/buttonStyles';
import SelectionBox from './SelectionBox';
import { Box } from '@/types/box';

interface PDFViewerProps {
  fileUrl: string | null;
  pageNumber: number;
  numPages: number | null;
  scale: number;
  boxes: Box[];
  pageSize: { width: number; height: number };
  onDocumentLoadSuccess: ({ numPages }: { numPages: number }) => void;
  onPageLoadSuccess: (page: any) => void;
  onScaleChange: (newScale: number) => void;
  onPageChange: (offset: number) => void;
  onGoToPage: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBoxUpdate: (boxes: Box[]) => void;
  onAddSubBox: (parentId: string, parentIndex: number) => void;
  onRemoveBox: (id: string) => void;
}

export default function PDFViewer({
  fileUrl,
  pageNumber,
  numPages,
  scale,
  boxes,
  pageSize,
  onDocumentLoadSuccess,
  onPageLoadSuccess,
  onScaleChange,
  onPageChange,
  onGoToPage,
  onBoxUpdate,
  onAddSubBox,
  onRemoveBox
}: PDFViewerProps) {
  return (
    <div style={{ 
      backgroundColor: '#f5f5f5',
      padding: '16px',
      borderRadius: '8px',
      marginBottom: '16px'
    }}>
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '16px',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => onScaleChange(scale + 0.1)}
            style={ButtonStyle}
          >
            확대
          </button>
          <button 
            onClick={() => onScaleChange(scale - 0.1)}
            style={ButtonStyle}
          >
            축소
          </button>
        </div>
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <button 
            onClick={() => onPageChange(-1)} 
            disabled={pageNumber <= 1}
            style={ButtonStyle}
          >
            이전
          </button>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <input 
              type="number" 
              value={pageNumber}
              onChange={onGoToPage}
              min={1}
              max={numPages || 1}
              style={{
                width: '60px',
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                textAlign: 'center'
              }}
            />
            <span style={{ color: '#666' }}>/ {numPages || 1}</span>
          </div>
          <button 
            onClick={() => onPageChange(1)} 
            disabled={pageNumber >= (numPages || 1)}
            style={ButtonStyle}
          >
            다음
          </button>
        </div>
      </div>

      <div style={{ 
        position: 'relative',
        backgroundColor: 'white',
        borderRadius: '4px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        {fileUrl && (
          <div style={{ 
            position: 'relative',
            width: '500px',
            margin: '0 auto'
          }}>
            <Document
              file={fileUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={(error) => console.error('PDF 로드 에러:', error)}
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                width={500}
                onLoadSuccess={onPageLoadSuccess}
              />
            </Document>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%'
            }}>
              {boxes.map(box => (
                <SelectionBox
                  key={box.id}
                  box={box}
                  boxes={boxes}
                  pageSize={pageSize}
                  onBoxUpdate={onBoxUpdate}
                  onAddSubBox={onAddSubBox}
                  onRemoveBox={onRemoveBox}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 