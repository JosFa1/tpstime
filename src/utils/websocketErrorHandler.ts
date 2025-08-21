/**
 * WebSocket Error Handler for Development Server
 * Prevents crashes from WebSocket RSV1 errors and other connection issues
 */

// Override the global WebSocket error handling in development
if (process.env.NODE_ENV === 'development') {
  // Capture and handle WebSocket errors gracefully
  const originalWebSocket = window.WebSocket;
  
  // Create a new WebSocket constructor with error handling
  const WebSocketWithErrorHandling = function(
    this: WebSocket, 
    url: string | URL, 
    protocols?: string | string[]
  ) {
    console.log('Creating WebSocket connection to:', url);
    
    try {
      const ws = new originalWebSocket(url, protocols);
      
      // Add error handling for common WebSocket issues
      ws.addEventListener('error', (event) => {
        console.warn('WebSocket error occurred:', event);
        // Don't let WebSocket errors crash the app
        event.preventDefault();
        event.stopPropagation();
      });
      
      // Handle unexpected closures
      ws.addEventListener('close', (event) => {
        if (event.code === 1002) {
          console.warn('WebSocket closed due to protocol error (RSV1). This is usually harmless in development.');
        } else if (event.code === 1006) {
          console.warn('WebSocket connection closed abnormally. This might be due to network issues.');
        }
        // Prevent automatic reconnection in problematic cases
        event.preventDefault();
      });
      
      // Handle open events
      ws.addEventListener('open', (event) => {
        console.log('WebSocket connection established successfully');
      });
      
      return ws;
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      // Return a mock WebSocket that doesn't crash
      return {
        addEventListener: () => {},
        removeEventListener: () => {},
        send: () => {},
        close: () => {},
        readyState: 3, // CLOSED
        CONNECTING: 0,
        OPEN: 1,
        CLOSING: 2,
        CLOSED: 3
      } as any;
    }
  } as any;
  
  // Copy over static properties and prototype
  WebSocketWithErrorHandling.prototype = originalWebSocket.prototype;
  WebSocketWithErrorHandling.CONNECTING = originalWebSocket.CONNECTING;
  WebSocketWithErrorHandling.OPEN = originalWebSocket.OPEN;
  WebSocketWithErrorHandling.CLOSING = originalWebSocket.CLOSING;
  WebSocketWithErrorHandling.CLOSED = originalWebSocket.CLOSED;
  
  window.WebSocket = WebSocketWithErrorHandling;
}

// Error boundary for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.message && 
      (event.reason.message.includes('RSV1') || 
       event.reason.message.includes('WebSocket') ||
       event.reason.code === 'WS_ERR_UNEXPECTED_RSV_1')) {
    console.warn('Caught unhandled WebSocket error:', event.reason);
    event.preventDefault();
  }
});

// Global error handler for WebSocket-related errors
window.addEventListener('error', (event) => {
  if (event.error && 
      (event.error.code === 'WS_ERR_UNEXPECTED_RSV_1' || 
       event.error.message?.includes('RSV1') ||
       event.error.message?.includes('WebSocket frame'))) {
    console.warn('Caught WebSocket frame error:', event.error);
    event.preventDefault();
    return true; // Prevent default error handling
  }
});

// Handle Node.js process errors if running in Electron or similar environment
if (typeof process !== 'undefined' && process.on) {
  process.on('uncaughtException', (error: any) => {
    if (error.code === 'WS_ERR_UNEXPECTED_RSV_1' || 
        error.message?.includes('RSV1') ||
        error.message?.includes('Invalid WebSocket frame')) {
      console.warn('Caught uncaught WebSocket exception:', error);
      return; // Don't crash the process
    }
  });
}

export {};
