export const newTheme = {
  colors: {
    primary: '#4e9c88', // Teal
    secondary: '#ffcf3d', // Yellow  
    accent: '#f68078', // Coral
    background: '#f5f5f5', // Light gray
    surface: '#ffffff', // Pure white
    text: {
      primary: '#212121', // Dark text
      secondary: '#8a8a8a', // Medium gray
      light: '#8a8a8a',
    },
    border: '#e0e0e0',
    success: '#4e9c88',
    warning: '#ffcf3d', 
    error: '#f68078',
    
    // Status colors
    status: {
      new: '#f68078', // Coral for new
      inProgress: '#ffcf3d', // Yellow for in progress  
      resolved: '#4e9c88', // Teal for resolved
    },
    
    // Category colors
    categories: {
      road: '#ffcf3d', // Yellow
      lighting: '#f68078', // Coral
      sanitation: '#4e9c88', // Teal
      parks: '#8a8a8a', // Gray
      water: '#4e9c88', // Teal
      other: '#8a8a8a', // Gray
    },
    
    // Sidebar
    sidebar: {
      background: '#4e9c88',
      text: '#ffffff',
      textSecondary: 'rgba(255,255,255,0.7)',
      hover: 'rgba(255,255,255,0.1)',
      border: 'rgba(255,255,255,0.1)',
    }
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
  
  borderRadius: {
    sm: '4px',
    md: '8px', 
    lg: '12px',
    xl: '16px',
    full: '9999px',
  }
};