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
type BoxState = Box[];
type SetBoxesFunction = React.Dispatch<React.SetStateAction<BoxState>>;

// PDF.js 워커 설정
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [pageSize, setPageSize] = useState({ width: 0, height: 0 });
  const [pdfDimensions, setPdfDimensions] = useState({ width: 0, height: 0 });
  const [boxes, setBoxes] = useState<BoxState>([]);
  const [mainBoxCount, setMainBoxCount] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setFileUrl(url);
      setPageNumber(1);
      setBoxes([]);
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
    setBoxes((prev: BoxState) => [...prev, newMainBox]);
    setMainBoxCount((prev: number) => prev + 1);
  };

  const addSubBox = (parentId: string, parentIndex: number) => {
    const subBoxCount = boxes.filter((box: Box) => box.parentId === parentId).length;
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
    setBoxes((prev: BoxState) => [...prev, newSubBox]);
  };

  const removeBox = (id: string) => {
    setBoxes((prev: BoxState) => {
      const box = prev.find((b: Box) => b.id === id);
      if (box?.isMain) {
        return prev.filter((b: Box) => b.id !== id && b.parentId !== id);
      }
      return prev.filter((b: Box) => b.id !== id);
    });
  };

  const handleSubmit = async () => {
    if (!file || boxes.length === 0) return;
  
    const mainBoxes = boxes.filter(box => box.isMain).map(mainBox => {
      const subBoxes = boxes
        .filter(box => box.parentId === mainBox.id)
        .map(subBox => ({
          ...calculateActualCoordinates(subBox),
          id: subBox.id,
          boxIndex: subBox.boxIndex,
          pageNumber: pageNumber - 1
        }));
  
      return {
        ...calculateActualCoordinates(mainBox),
        id: mainBox.id,
        boxIndex: mainBox.boxIndex,
        pageNumber: pageNumber - 1,
        subBoxes
      };
    });
  
    const formData = new FormData();
    formData.append("file", file);
    formData.append("boxes", JSON.stringify(mainBoxes));
  
    try {
      // 백엔드 URL 변경
      const url = `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_API_PATH}`
      const response = await axios.post(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log('서버 응답:', response.data);

      let formattedText = '';
      
      if (Array.isArray(response.data)) {
        response.data.forEach((text, index) => {
          const box = boxes[index];
          if (box) {
            const prefix = box.isMain 
              ? `메인박스 ${box.boxIndex}번`
              : `서브박스 ${boxes.find(b => b.id === box.parentId)?.boxIndex}-${box.boxIndex}번`;
            formattedText += `${prefix}:\n${text}\n\n`;
          }
        });
      } else {
        mainBoxes.forEach(mainBox => {
          formattedText += `메인박스 ${mainBox.boxIndex}번:\n`;
          if (response.data[mainBox.id]) {
            formattedText += `${response.data[mainBox.id]}\n`;
          } else if (response.data.results?.[mainBox.id]) {
            formattedText += `${response.data.results[mainBox.id]}\n`;
          }
          formattedText += '\n';

          mainBox.subBoxes.forEach(subBox => {
            formattedText += `서브박스 ${mainBox.boxIndex}-${subBox.boxIndex}번:\n`;
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
        onAddMainBox={addMainBox}
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
            boxes={boxes}
            pageSize={pageSize}
            onDocumentLoadSuccess={onDocumentLoadSuccess}
            onPageLoadSuccess={onPageLoadSuccess}
            onScaleChange={setScale}
            onPageChange={changePage}
            onGoToPage={goToPage}
            onBoxUpdate={setBoxes}
            onAddSubBox={addSubBox}
            onRemoveBox={removeBox}
          />
          
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end'
          }}>
            <button 
              onClick={handleSubmit} 
              disabled={boxes.length === 0}
              style={{
                ...ActionButtonStyle,
                opacity: boxes.length === 0 ? 0.5 : 1
              }}
            >
              선택 영역 파싱
            </button>
          </div>
        </section>

        <ParsedText text={text} />
      </main>

      <Footer />
    </div>
  );
}