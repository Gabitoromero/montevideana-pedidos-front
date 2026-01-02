// Migration Script: Clean up old localStorage data
// Run this once after deploying the cookie-based authentication

import { logger } from './logger';

(function cleanupOldAuthStorage() {
  logger.log('🧹 Cleaning up old localStorage authentication data...');
  
  // Remove old auth-storage key (from Zustand persist)
  const oldAuthKey = 'auth-storage';
  const oldData = localStorage.getItem(oldAuthKey);
  
  if (oldData) {
    logger.log('Found old auth data:', oldData);
    localStorage.removeItem(oldAuthKey);
    logger.log('✅ Removed old auth-storage from localStorage');
  } else {
    logger.log('ℹ️ No old auth data found');
  }
  
  logger.log('✅ Migration cleanup complete!');
  logger.log('ℹ️ Authentication now uses HTTP-only cookies');
})();
