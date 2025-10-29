import fs from 'fs';
import { promisify } from 'util';

export default (config, { strapi }) => {
  return async (ctx, next) => {
    // Override strapi.log.error to suppress EPERM unlink errors
    const originalLogError = strapi.log.error;
    
    strapi.log.error = (...args) => {
      const errorString = args.join(' ');
      if (errorString.includes('EPERM') && errorString.includes('unlink')) {
        // Silently ignore Windows file permission errors
        return;
      }
      originalLogError(...args);
    };

    // Also override console.error as backup
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const errorString = args.join(' ');
      if (errorString.includes('EPERM') && errorString.includes('unlink')) {
        return;
      }
      originalConsoleError(...args);
    };

    // Store original functions
    const originalUnlink = fs.unlink;
    const originalUnlinkSync = fs.unlinkSync;
    
    // Create patched unlink function
    const patchedUnlink = (path, callback) => {
      originalUnlink(path, (err) => {
        if (err && (err.code === 'EPERM' || err.code === 'EBUSY')) {
          // Silently ignore Windows permission errors
          if (callback) callback(null);
        } else {
          if (callback) callback(err);
        }
      });
    };

    // Add the __promisify__ property to maintain compatibility
    patchedUnlink.__promisify__ = promisify(patchedUnlink);

    // Override fs functions
    fs.unlink = patchedUnlink as typeof fs.unlink;
    
    fs.unlinkSync = (path) => {
      try {
        originalUnlinkSync(path);
      } catch (error) {
        if (error.code !== 'EPERM' && error.code !== 'EBUSY') {
          throw error;
        }
        // Silently ignore Windows permission errors
      }
    };

    await next();
    
    // Restore original functions after request
    setTimeout(() => {
      fs.unlink = originalUnlink;
      fs.unlinkSync = originalUnlinkSync;
    }, 3000);
    
    // Restore original functions after a delay
    setTimeout(() => {
      strapi.log.error = originalLogError;
      console.error = originalConsoleError;
    }, 1000);
  };
};