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
      }
    });
    
    return ws;
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
  if (event.reason && event.reason.message && event.reason.message.includes('RSV1')) {
    console.warn('Caught unhandled WebSocket RSV1 error:', event.reason);
    event.preventDefault();
  }
});

// Global error handler for WebSocket-related errors
window.addEventListener('error', (event) => {
  if (event.error && event.error.code === 'WS_ERR_UNEXPECTED_RSV_1') {
    console.warn('Caught WebSocket RSV1 error:', event.error);
    event.preventDefault();
  }
});

export {};
