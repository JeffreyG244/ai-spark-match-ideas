import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

interface LocationSelectorProps {
  selectedState?: string;
  selectedCity?: string;
  onStateChange: (state: string) => void;
  onCityChange: (city: string) => void;
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
  onStateChange,
  onCityChange
}) => {
  const [states, setStates] = useState<StateOption[]>([]);
  const [cities, setCities] = useState<CityOption[]>([]);
  const [loadingStates, setLoadingStates] = useState(true);
  const [loadingCities, setLoadingCities] = useState(false);

  // Load states on component mount
  useEffect(() => {
    const loadStates = async () => {
      try {
        const { data, error } = await supabase
          .from('cities_states')
          .select('state, state_code')
          .order('state');

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
        const { data, error } = await supabase
          .from('cities_states')
          .select('city')
          .eq('state', selectedState)
          .order('city');

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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