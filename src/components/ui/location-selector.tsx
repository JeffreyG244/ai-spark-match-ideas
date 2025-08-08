import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';

interface LocationSelectorProps {
  selectedState?: string;
  selectedCity?: string;
  selectedZipcode?: string;
  onStateChange: (state: string) => void;
  onCityChange: (city: string) => void;
  onZipcodeChange?: (zipcode: string) => void;
  showZipcode?: boolean;
}

interface StateOption {
  state: string;
  state_code: string;
}

interface CityOption {
  city: string;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  selectedState,
  selectedCity,
  selectedZipcode,
  onStateChange,
  onCityChange,
  onZipcodeChange,
  showZipcode = false
}) => {
  const [states, setStates] = useState<StateOption[]>([]);
  const [cities, setCities] = useState<CityOption[]>([]);
  const [loadingStates, setLoadingStates] = useState(true);
  const [loadingCities, setLoadingCities] = useState(false);

  // Load states on component mount
  useEffect(() => {
    const loadStates = async () => {
      try {
        // Mock states data since the table doesn't exist
        const data = [
          { state: 'California', state_code: 'CA' },
          { state: 'New York', state_code: 'NY' },
          { state: 'Texas', state_code: 'TX' },
          { state: 'Florida', state_code: 'FL' }
        ];
        const error = null;

        if (error) {
          console.error('Error loading states:', error);
          return;
        }

        // Remove duplicates
        const uniqueStates = data.reduce((acc: StateOption[], current) => {
          if (!acc.find(state => state.state_code === current.state_code)) {
            acc.push(current);
          }
          return acc;
        }, []);

        setStates(uniqueStates);
      } catch (error) {
        console.error('Error loading states:', error);
      } finally {
        setLoadingStates(false);
      }
    };

    loadStates();
  }, []);

  // Load cities when state changes
  useEffect(() => {
    if (!selectedState) {
      setCities([]);
      return;
    }

    const loadCities = async () => {
      setLoadingCities(true);
      try {
        // Mock cities data since the table doesn't exist
        const data = [
          { city: 'Los Angeles' },
          { city: 'San Francisco' },
          { city: 'New York City' },
          { city: 'Buffalo' }
        ];
        const error = null;

        if (error) {
          console.error('Error loading cities:', error);
          return;
        }

        setCities(data || []);
      } catch (error) {
        console.error('Error loading cities:', error);
      } finally {
        setLoadingCities(false);
      }
    };

    loadCities();
  }, [selectedState]);

  const handleStateChange = (state: string) => {
    onStateChange(state);
    onCityChange(''); // Reset city when state changes
  };

  const handleZipcodeChange = (zipcode: string) => {
    if (onZipcodeChange) {
      onZipcodeChange(zipcode);
      
      // Auto-populate city and state if zipcode matches (simplified for now)
      if (zipcode.length === 5) {
        // This would typically connect to a zipcode lookup service
        console.log('Zipcode entered:', zipcode);
      }
    }
  };


  return (
    <div className={`grid grid-cols-1 ${showZipcode ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4`}>
      {showZipcode && (
        <div>
          <label className="text-sm font-medium mb-2 block">Zipcode</label>
          <Input
            type="text"
            placeholder="Enter zipcode"
            value={selectedZipcode || ''}
            onChange={(e) => handleZipcodeChange(e.target.value)}
            maxLength={5}
            className="border-love-primary/20 focus:border-love-primary"
          />
        </div>
      )}
      
      <div>
        <label className="text-sm font-medium mb-2 block">State *</label>
        <Select 
          value={selectedState || ''} 
          onValueChange={handleStateChange}
          disabled={loadingStates}
        >
          <SelectTrigger>
            <SelectValue placeholder={loadingStates ? "Loading states..." : "Select your state"} />
          </SelectTrigger>
          <SelectContent>
            {states.map((state) => (
              <SelectItem key={state.state_code} value={state.state}>
                {state.state}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label className="text-sm font-medium mb-2 block">City *</label>
        <Select 
          value={selectedCity || ''} 
          onValueChange={onCityChange}
          disabled={!selectedState || loadingCities}
        >
          <SelectTrigger>
            <SelectValue 
              placeholder={
                !selectedState 
                  ? "Select state first" 
                  : loadingCities 
                    ? "Loading cities..." 
                    : "Select your city"
              } 
            />
          </SelectTrigger>
          <SelectContent>
            {cities.map((city) => (
              <SelectItem key={city.city} value={city.city}>
                {city.city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};