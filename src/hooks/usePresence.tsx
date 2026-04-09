import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export function usePresence() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const setPresence = async (status: 'online' | 'offline') => {
      try {
        const { data, error } = await supabase
          .from('user_presence')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') return; // PGRST116 is not found

        if (data) {
          // Update
          await supabase
            .from('user_presence')
            .update({ status, last_seen: new Date().toISOString(), updated_at: new Date().toISOString() })
            .eq('user_id', user.id);
        } else {
          // Insert
          await supabase
            .from('user_presence')
            .insert({ user_id: user.id, status, last_seen: new Date().toISOString() });
        }
      } catch (err) {
        console.error('Presence update failed', err);
      }
    };

    setPresence('online');

    const handleBeforeUnload = () => {
      // Synchronous beacon fetch to set offline
      navigator.sendBeacon('/api/presence/offline', JSON.stringify({ userId: user.id }));
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      setPresence('offline');
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user]);
}
