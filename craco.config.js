module.exports = {
  devServer: {
    // Use sockjs instead of ws to avoid RSV1 compression issues
    webSocketServer: {
      type: 'sockjs',
    },
    
    // Enable hot reloading but with safer settings
    hot: true,
    liveReload: false, // Disable live reload when hot is enabled
    
    // Disable compression which can cause WebSocket issues
    compress: false,
    
    // Client configuration
    client: {
      // Use sockjs transport which is more stable
      webSocketTransport: 'sockjs',
      // Allow some reconnection attempts but not too many
      reconnect: 3,
      // Show overlay only for errors
      overlay: {
        errors: true,
        warnings: false,
      },
    },
        
    // Host configuration - simplified
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: 'all',
    // Same-origin access to the official feed during local development.
    proxy: {
      '/api/lightning-alert': {
        target: 'https://cdn-oas.api.earthnetworks.com',
        changeOrigin: true,
        pathRewrite: { '^/api/lightning-alert': '/OASWidget.ashx?widgetId=6d55256e-909d-461e-80a3-8f8ae8dcb635&firstCall=1' },
        proxyTimeout: 9000,
      },
    },
        
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
