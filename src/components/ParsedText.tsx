import { ButtonStyle } from '@/styles/buttonStyles';
import { useState } from 'react';

interface ParsedTextProps {
  text: string;
}

export default function ParsedText({ text }: ParsedTextProps) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch (err) {
      console.error('복사 중 오류가 발생했습니다:', err);
      // 대체 복사 방법 시도
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        setCopyStatus('copied');
        setTimeout(() => setCopyStatus('idle'), 2000);
      } catch (err) {
        console.error('대체 복사 방법도 실패했습니다:', err);
      } finally {
        document.body.removeChild(textarea);
      }
    }
  };

  return (
    <section style={{
      backgroundColor: '#f5f5f5',
      padding: '16px',
      borderRadius: '8px',
      height: 'fit-content',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ 
        fontSize: '18px',
        color: '#1a73e8',
        marginTop: 0,
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <svg 
          width="18" 
          height="18" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
        파싱된 텍스트
      </h2>
      <div style={{
        backgroundColor: 'white',
        padding: '16px',
        borderRadius: '4px',
        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e0e0e0'
      }}>
        {text ? (
          <pre style={{
            margin: 0,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
            maxHeight: '500px',
            overflowY: 'auto',
            fontSize: '14px',
            lineHeight: '1.6',
            color: '#333',
            fontFamily: 'Consolas, Monaco, "Courier New", monospace'
          }}>
            {text.split('\n').map((line, index) => {
              if (line.startsWith('메인박스')) {
                return (
                  <div key={index} style={{ 
                    color: '#1a73e8',
                    fontWeight: 'bold',
                    marginTop: index > 0 ? '16px' : 0
                  }}>
                    {line}
                  </div>
                );
              } else if (line.startsWith('서브박스')) {
                return (
                  <div key={index} style={{ 
                    color: '#ea4335',
                    fontWeight: 'bold',
                    marginTop: '8px'
                  }}>
                    {line}
                  </div>
                );
              }
              return <div key={index}>{line}</div>;
            })}
          </pre>
        ) : (
          <div style={{
            color: '#666',
            fontSize: '14px',
            textAlign: 'center',
            padding: '20px 0',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px',
            border: '1px dashed #ccc'
          }}>
            파싱된 텍스트가 여기에 표시됩니다
          </div>
        )}
      </div>
      {text && (
        <div style={{
          marginTop: '12px',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={handleCopy}
            style={{
              ...ButtonStyle,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              padding: '6px 12px',
              backgroundColor: copyStatus === 'copied' ? '#34d399' : ButtonStyle.backgroundColor,
              transition: 'background-color 0.2s ease'
            }}
          >
            <svg 
              width="14" 
              height="14" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              {copyStatus === 'copied' ? (
                <path d="M20 6L9 17l-5-5" />
              ) : (
                <>
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                </>
              )}
            </svg>
            {copyStatus === 'copied' ? '복사됨' : '복사하기'}
          </button>
        </div>
      )}
    </section>
  );
} 