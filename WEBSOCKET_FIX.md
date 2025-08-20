# WebSocket Error Fix

This project has been configured to handle WebSocket errors that can occur during development, particularly the "Invalid WebSocket frame: RSV1 must be clear" error.

## What was fixed:

1. **CRACO Configuration**: Added `craco.config.js` to override webpack-dev-server settings:
   - Disabled WebSocket compression (`compress: false`)
   - Configured WebSocket server with `perMessageDeflate: false`
   - Added better error handling and reconnection settings

2. **Environment Variables**: Added WebSocket configuration in `.env.local`:
   - `WDS_SOCKET_HOST=localhost`
   - `WDS_SOCKET_PORT=0`
   - `FAST_REFRESH=false`
   - `WATCHPACK_POLLING=true`

3. **WebSocket Error Handler**: Created `src/utils/websocketErrorHandler.ts` to catch and handle WebSocket errors gracefully in development mode.

4. **Package.json Updates**: Changed scripts to use CRACO instead of react-scripts:
   - `npm start` now uses `craco start`
   - `npm run build` now uses `craco build`

## Running the project:

```bash
npm start
```

The development server should now be much more stable and won't crash due to WebSocket protocol errors.

## If you still experience issues:

1. Try clearing the cache: `npm start -- --reset-cache`
2. Check your network/proxy configuration
3. Ensure no other services are using the same ports
4. Consider running on a different port: `PORT=3001 npm start`

## Production deployment:

For production deployment, use:
```bash
npm run build
```

The WebSocket error handling only applies to development mode and won't affect production builds.
