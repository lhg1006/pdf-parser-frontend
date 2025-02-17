export const ButtonStyle = {
  padding: '8px 16px',
  margin: '0 4px',
  borderRadius: '4px',
  border: '1px solid #ddd',
  backgroundColor: '#fff',
  cursor: 'pointer',
  fontSize: '14px',
  transition: 'all 0.2s',
  ':hover': {
    backgroundColor: '#f0f0f0'
  }
};

export const ActionButtonStyle = {
  ...ButtonStyle,
  backgroundColor: '#1a73e8',
  color: 'white',
  border: 'none',
  ':hover': {
    backgroundColor: '#1557b0'
  }
}; 