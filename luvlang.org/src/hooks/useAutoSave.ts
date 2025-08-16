import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface UseAutoSaveOptions {
  table: string;
  data: Record<string, any>;
  delay?: number; // Debounce delay in milliseconds
  enabled?: boolean;
}

export const useAutoSave = ({ table, data, delay = 2000, enabled = true }: UseAutoSaveOptions) => {
  const { user } = useAuth();
  const [status, setStatus] = useState<AutoSaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const initialLoadRef = useRef(true);

  const autoSave = async (saveData: Record<string, any>) => {
    if (!user || !enabled) return;

    setStatus('saving');

    try {
      const payload = {
        user_id: user.id,
        ...saveData,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from(table)
        .upsert(payload, { onConflict: 'user_id' });

      if (error) throw error;

      setStatus('saved');
      setLastSaved(new Date());

      // Reset to idle after 3 seconds
      setTimeout(() => setStatus('idle'), 3000);

    } catch (error) {
      console.error(`Auto-save error for ${table}:`, error);
      setStatus('error');

      // Reset to idle after 5 seconds
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  useEffect(() => {
    if (!user || !enabled) return;

    // Skip auto-save on initial load
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      return;
    }

    // Skip if data is empty
    const hasData = Object.values(data).some(value => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'string') return value.trim() !== '';
      return value !== null && value !== undefined;
    });

    if (!hasData) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for debounced save
    timeoutRef.current = setTimeout(() => {
      autoSave(data);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, user, enabled, delay, table]);

  return {
    status,
    lastSaved,
    manualSave: () => autoSave(data)
  };
};

// Auto-save status indicator component
export const AutoSaveIndicator = ({ 
  status, 
  lastSaved, 
  className = '' 
}: { 
  status: AutoSaveStatus; 
  lastSaved: Date | null; 
  className?: string;
}) => {
  if (status === 'idle' && !lastSaved) return null;

  const getStatusInfo = () => {
    switch (status) {
      case 'saving':
        return {
          icon: '⏳',
          text: 'Saving...',
          color: 'text-yellow-600'
        };
      case 'saved':
        return {
          icon: '✅',
          text: `Saved ${lastSaved ? new Date(lastSaved).toLocaleTimeString() : ''}`,
          color: 'text-green-600'
        };
      case 'error':
        return {
          icon: '❌',
          text: 'Save failed',
          color: 'text-red-600'
        };
      case 'idle':
        return {
          icon: '💾',
          text: `Last saved ${lastSaved ? new Date(lastSaved).toLocaleTimeString() : ''}`,
          color: 'text-gray-600'
        };
      default:
        return null;
    }
  };

  const statusInfo = getStatusInfo();
  if (!statusInfo) return null;

  return (
    <div className={`flex items-center gap-2 text-sm ${statusInfo.color} ${className}`}>
      <span>{statusInfo.icon}</span>
      <span>{statusInfo.text}</span>
    </div>
  );
};