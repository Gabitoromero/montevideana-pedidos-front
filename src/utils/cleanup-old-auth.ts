// Migration Script: Clean up old localStorage data
// Run this once after deploying the cookie-based authentication

(function cleanupOldAuthStorage() {
  console.log('🧹 Cleaning up old localStorage authentication data...');
  
  // Remove old auth-storage key (from Zustand persist)
  const oldAuthKey = 'auth-storage';
  const oldData = localStorage.getItem(oldAuthKey);
  
  if (oldData) {
    console.log('Found old auth data:', oldData);
    localStorage.removeItem(oldAuthKey);
    console.log('✅ Removed old auth-storage from localStorage');
  } else {
    console.log('ℹ️ No old auth data found');
  }
  
  console.log('✅ Migration cleanup complete!');
  console.log('ℹ️ Authentication now uses HTTP-only cookies');
})();
