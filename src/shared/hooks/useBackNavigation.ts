import { useAuthStore } from '../../store/auth.store';

/**
 * Get the appropriate back navigation route based on user sector
 * EXPEDICION users should go to /assembly instead of homepage
 */
export const useBackNavigation = () => {
  const user = useAuthStore(state => state.user);
  const userSector = user?.sector;

  // EXPEDICION users go to assembly, others go to homepage
  const getBackRoute = () => {
    return userSector === 'EXPEDICION' ? '/assembly' : '/';
  };

  return { getBackRoute };
};
