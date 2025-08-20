module.exports = {
  devServer: {
    // Disable WebSocket compression to prevent RSV1 errors
    compress: false,
    
    // Configure WebSocket settings
    webSocketServer: {
      options: {
        // Disable compression on WebSocket frames
        perMessageDeflate: false,
        // Set maximum payload size to prevent frame issues
        maxPayload: 1024 * 1024 * 10, // 10MB
      }
    },
    
    // Additional stability configurations
    hot: true,
    liveReload: false,
    
    // Client configuration for better error handling
    client: {
      // Reduce reconnection attempts
      reconnect: 3,
      // Show overlay only for errors, not warnings
      overlay: {
        errors: true,
        warnings: false,
      },
      // Configure WebSocket URL to avoid connection issues
      webSocketURL: {
        hostname: '0.0.0.0',
        pathname: '/ws',
        port: '',
        protocol: 'ws',
      },
    },
    
    // Host configuration
    host: '0.0.0.0',
    allowedHosts: 'all',
    
    // Headers to prevent issues with proxies
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
    },
  },
  
  webpack: {
    configure: (webpackConfig) => {
      // Additional webpack optimizations for stability
      webpackConfig.watchOptions = {
        ...webpackConfig.watchOptions,
        poll: 1000,
        ignored: ['node_modules/**'],
      };
      
      return webpackConfig;
    },
  },
};
