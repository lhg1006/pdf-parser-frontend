import { ActionButtonStyle } from '@/styles/buttonStyles';

interface HeaderProps {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Header({ onFileChange }: HeaderProps) {
  return (
    <header style={{
      marginBottom: '24px',
      borderBottom: '1px solid #eee',
      paddingBottom: '16px'
    }}>
      <h1 style={{ 
        fontSize: '24px',
        color: '#333',
        margin: '0 0 16px 0'
      }}>PDF Parser</h1>
      
      <div style={{
        display: 'flex',
        gap: '16px',
        alignItems: 'center'
      }}>
        <input 
          type="file" 
          accept="application/pdf" 
          onChange={onFileChange}
          style={{
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            flex: '1'
          }}
        />
      </div>
    </header>
  );
} 