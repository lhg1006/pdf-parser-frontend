"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import Header from '@/components/Header';
import PDFViewer from '@/components/PDFViewer';
import ParsedText from '@/components/ParsedText';
import { Box } from '@/types/box';
import { ActionButtonStyle } from '@/styles/buttonStyles';
import Footer from '@/components/Footer';

// 타입 정의 추가
type BoxState = {
  [pageNumber: number]: Box[];
};

// PDF.js 워커 설정
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// 스타일 정의
const controlPanelStyles = {
  container: {
    padding: '16px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    marginBottom: '16px'
  },
  mainBox: {
    marginBottom: '16px',
    padding: '12px',
    backgroundColor: '#fff',
    borderRadius: '6px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  subBox: {
    marginLeft: '20px',
    marginTop: '8px',
    padding: '8px',
    backgroundColor: '#f8f8f8',
    borderRadius: '4px',
    border: '1px solid #eee'
  },
  button: {
    ...ActionButtonStyle,
    padding: '6px 12px',
    fontSize: '14px',
    marginRight: '8px'
  },
  boxHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  boxTitle: {
    fontWeight: 'bold',
    fontSize: '14px'
  }
};

// BoxControlPanel 컴포넌트
const BoxControlPanel = ({ 
  boxes, 
  pageNumber,
  onAddMainBox,
  onAddSubBox,
  onRemoveBox,
  onSubmit
}: {
  boxes: BoxState;
  pageNumber: number;
  onAddMainBox: () => void;
  onAddSubBox: (parentId: string, parentIndex: number, targetPage: number) => void;
  onRemoveBox: (id: string) => void;
  onSubmit: () => void;
}) => {
  // 모든 페이지의 메인박스를 가져와서 정렬
  const allMainBoxes = Object.entries(boxes)
    .flatMap(([pageNum, pageBoxes]) => 
      pageBoxes
        .filter(box => box.isMain)
        .map(box => ({
          ...box,
          pageNum: parseInt(pageNum)
        }))
    )
    .sort((a, b) => a.boxIndex - b.boxIndex);

  return (
    <div style={controlPanelStyles.container}>
      <div style={{ 
        display: 'flex',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <button 
          onClick={onAddMainBox}
          style={ActionButtonStyle}
        >
          + 메인박스 추가
        </button>
        <button 
          onClick={onSubmit}
          disabled={Object.keys(boxes).length === 0}
          style={{
            ...ActionButtonStyle,
            opacity: Object.keys(boxes).length === 0 ? 0.5 : 1
          }}
        >
          선택 영역 파싱
        </button>
      </div>

      {allMainBoxes.map(mainBox => {
        // 해당 메인박스의 모든 서브박스 찾기
        const subBoxes = Object.entries(boxes)
          .flatMap(([pageNum, pageBoxes]) =>
            pageBoxes
              .filter(box => box.parentId === mainBox.id)
              .map(box => ({
                ...box,
                pageNum: parseInt(pageNum)
              }))
          )
          .sort((a, b) => a.boxIndex - b.boxIndex);

        return (
          <div key={mainBox.id} style={controlPanelStyles.mainBox}>
            <div style={controlPanelStyles.boxHeader}>
              <span style={controlPanelStyles.boxTitle}>
                메인박스 {mainBox.boxIndex}번 (페이지 {mainBox.pageNum})
              </span>
              <div>
                <button
                  onClick={() => onAddSubBox(mainBox.id, mainBox.boxIndex, pageNumber)}
                  style={controlPanelStyles.button}
                >
                  + 서브박스
                </button>
                <button
                  onClick={() => onRemoveBox(mainBox.id)}
                  style={{...controlPanelStyles.button, backgroundColor: '#ff4444'}}
                >
                  삭제
                </button>
              </div>
            </div>
            
            {subBoxes.map(subBox => (
              <div key={subBox.id} style={controlPanelStyles.subBox}>
                <div style={controlPanelStyles.boxHeader}>
                  <span style={controlPanelStyles.boxTitle}>
                    서브박스 {mainBox.boxIndex}-{subBox.boxIndex}번 (페이지 {subBox.pageNum})
                  </span>
                  <button
                    onClick={() => onRemoveBox(subBox.id)}
                    style={{...controlPanelStyles.button, backgroundColor: '#ff4444'}}
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [pageSize, setPageSize] = useState({ width: 0, height: 0 });
  const [pdfDimensions, setPdfDimensions] = useState({ width: 0, height: 0 });
  const [boxes, setBoxes] = useState<BoxState>({});
  const [mainBoxCount, setMainBoxCount] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setFileUrl(url);
      setPageNumber(1);
      setBoxes({});
      setMainBoxCount(0);
    }
  };

  const calculateActualCoordinates = (box: Box) => {
    const scale = pdfDimensions.width / pageSize.width;
    return {
      x: Math.round(box.x * scale),
      y: Math.round(box.y * scale),
      width: Math.round(box.width * scale),
      height: Math.round(box.height * scale)
    };
  };

  const addMainBox = () => {
    const newMainBox: Box = {
      id: Date.now().toString(),
      boxIndex: mainBoxCount + 1,
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      isMain: true
    };
    
    setBoxes((prev: BoxState) => ({
      ...prev,
      [pageNumber]: [...(prev[pageNumber] || []), newMainBox]
    }));
    setMainBoxCount((prev: number) => prev + 1);
  };

  const addSubBox = (parentId: string, parentIndex: number, targetPage: number) => {
    const allBoxes = Object.values(boxes).flat();
    const subBoxCount = allBoxes.filter((box: Box) => box.parentId === parentId).length;
    
    const newSubBox: Box = {
      id: Date.now().toString(),
      boxIndex: subBoxCount + 1,
      x: 0,
      y: 0,
      width: 80,
      height: 80,
      isMain: false,
      parentId
    };

    setBoxes((prev: BoxState) => ({
      ...prev,
      [targetPage]: [...(prev[targetPage] || []), newSubBox]
    }));
  };

  const removeBox = (id: string) => {
    setBoxes((prev: BoxState) => {
      const newBoxes = { ...prev };
      const currentPageBoxes = newBoxes[pageNumber] || [];
      const box = currentPageBoxes.find((b: Box) => b.id === id);
      
      if (box?.isMain) {
        // 메인 박스와 관련된 서브 박스들도 모두 제거
        newBoxes[pageNumber] = currentPageBoxes.filter((b: Box) => b.id !== id && b.parentId !== id);

        // 메인 박스가 제거된 경우에만 인덱스 재조정
        let mainBoxIndex = 1;
        Object.keys(newBoxes).forEach((page) => {
          const pageNum = parseInt(page);
          newBoxes[pageNum] = newBoxes[pageNum].map((b: Box) => {
            if (b.isMain) {
              return { ...b, boxIndex: mainBoxIndex++ };
            }
            return b;
          });
        });

        // 메인 박스 카운트 업데이트
        setMainBoxCount((prev) => {
          const allMainBoxes = Object.values(newBoxes).flat().filter(b => b.isMain);
          return allMainBoxes.length;
        });
      } else {
        // 서브 박스만 제거
        newBoxes[pageNumber] = currentPageBoxes.filter((b: Box) => b.id !== id);
      }

      return newBoxes;
    });
  };

  const handleSubmit = async () => {
    if (!file || Object.keys(boxes).length === 0) return;
  
    // 모든 메인박스와 서브박스를 통합하여 처리
    const allMainBoxes = Object.entries(boxes).flatMap(([pageNum, pageBoxes]) => 
      pageBoxes.filter(box => box.isMain).map(box => ({
        ...box,
        pageNumber: parseInt(pageNum) - 1
      }))
    ).sort((a, b) => a.boxIndex - b.boxIndex);

    const processedBoxes = allMainBoxes.map(mainBox => {
      // 해당 메인박스의 모든 서브박스 찾기 (각 서브박스의 실제 페이지 번호 유지)
      const subBoxes = Object.entries(boxes).flatMap(([pageNum, pageBoxes]) =>
        pageBoxes
          .filter(box => box.parentId === mainBox.id)
          .map(subBox => ({
            ...calculateActualCoordinates(subBox),
            id: subBox.id,
            boxIndex: subBox.boxIndex,
            pageNumber: parseInt(pageNum) - 1  // 서브박스의 실제 페이지 번호 사용
          }))
      ).sort((a, b) => a.boxIndex - b.boxIndex);

      return {
        ...calculateActualCoordinates(mainBox),
        id: mainBox.id,
        boxIndex: mainBox.boxIndex,
        pageNumber: mainBox.pageNumber,
        subBoxes
      };
    });
  
    const formData = new FormData();
    formData.append("file", file);
    formData.append("boxes", JSON.stringify(processedBoxes));
  
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_API_PATH}`
      const response = await axios.post(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log('서버 응답:', response.data);

      let formattedText = '';
      
      if (Array.isArray(response.data)) {
        let responseIndex = 0;
        processedBoxes.forEach((mainBox) => {
          if (response.data[responseIndex]) {
            formattedText += `메인박스 ${mainBox.boxIndex}번 (페이지 ${mainBox.pageNumber + 1}):\n${response.data[responseIndex]}\n\n`;
            responseIndex++;
            
            mainBox.subBoxes.forEach((subBox) => {
              if (response.data[responseIndex]) {
                formattedText += `서브박스 ${mainBox.boxIndex}-${subBox.boxIndex}번 (페이지 ${subBox.pageNumber + 1}):\n${response.data[responseIndex]}\n\n`;
                responseIndex++;
              }
            });
          }
        });
      } else {
        processedBoxes.forEach(mainBox => {
          formattedText += `메인박스 ${mainBox.boxIndex}번 (페이지 ${mainBox.pageNumber + 1}):\n`;
          if (response.data[mainBox.id]) {
            formattedText += `${response.data[mainBox.id]}\n`;
          } else if (response.data.results?.[mainBox.id]) {
            formattedText += `${response.data.results[mainBox.id]}\n`;
          }
          formattedText += '\n';

          mainBox.subBoxes.forEach(subBox => {
            formattedText += `서브박스 ${mainBox.boxIndex}-${subBox.boxIndex}번 (페이지 ${subBox.pageNumber + 1}):\n`;
            if (response.data[subBox.id]) {
              formattedText += `${response.data[subBox.id]}\n`;
            } else if (response.data.results?.[subBox.id]) {
              formattedText += `${response.data.results[subBox.id]}\n`;
            }
            formattedText += '\n';
          });
        });
      }

      setText(formattedText.trim());
    } catch (error) {
      console.error("Error parsing PDF:", error);
      setText("PDF 파싱 중 오류가 발생했습니다.");
    }
  };

  const onDocumentLoadSuccess = ({ numPages: nextNumPages }: { numPages: number }) => {
    setNumPages(nextNumPages);
  };

  const onPageLoadSuccess = (page: any) => {
    const viewport = page.getViewport({ scale: 1.0 });
    setPdfDimensions({ width: viewport.width, height: viewport.height });
    const containerWidth = 500;
    const displayScale = containerWidth / viewport.width;
    const scaledHeight = viewport.height * displayScale;
    setPageSize({ 
      width: containerWidth, 
      height: scaledHeight 
    });
  };

  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => {
      const newPageNumber = prevPageNumber + offset;
      return Math.min(Math.max(1, newPageNumber), numPages || 1);
    });
  };

  const goToPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const page = parseInt(event.target.value);
    if (page && page > 0 && page <= (numPages || 1)) {
      setPageNumber(page);
    }
  };

  useEffect(() => {
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [fileUrl]);

  return (
    <div style={{ 
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Header 
        onFileChange={handleFileChange}
      />

      <main style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '24px',
        alignItems: 'start',
        flex: 1
      }}>
        <section>
          <PDFViewer
            fileUrl={fileUrl}
            pageNumber={pageNumber}
            numPages={numPages}
            scale={scale}
            boxes={boxes[pageNumber] || []}
            allBoxes={boxes}
            pageSize={pageSize}
            onDocumentLoadSuccess={onDocumentLoadSuccess}
            onPageLoadSuccess={onPageLoadSuccess}
            onScaleChange={setScale}
            onPageChange={changePage}
            onGoToPage={goToPage}
            onBoxUpdate={(updatedBoxes) => setBoxes(prev => ({ ...prev, [pageNumber]: updatedBoxes }))}
            onAddSubBox={(parentId, parentIndex) => addSubBox(parentId, parentIndex, pageNumber)}
            onRemoveBox={removeBox}
          />
        </section>

        <section>
          <BoxControlPanel
            boxes={boxes}
            pageNumber={pageNumber}
            onAddMainBox={addMainBox}
            onAddSubBox={addSubBox}
            onRemoveBox={removeBox}
            onSubmit={handleSubmit}
          />
          <ParsedText text={text} />
        </section>
      </main>

      <Footer />
    </div>
  );
}