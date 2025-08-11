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
        // Comprehensive US states data
        const data = [
          { state: 'Alabama', state_code: 'AL' },
          { state: 'Alaska', state_code: 'AK' },
          { state: 'Arizona', state_code: 'AZ' },
          { state: 'Arkansas', state_code: 'AR' },
          { state: 'California', state_code: 'CA' },
          { state: 'Colorado', state_code: 'CO' },
          { state: 'Connecticut', state_code: 'CT' },
          { state: 'Delaware', state_code: 'DE' },
          { state: 'Florida', state_code: 'FL' },
          { state: 'Georgia', state_code: 'GA' },
          { state: 'Hawaii', state_code: 'HI' },
          { state: 'Idaho', state_code: 'ID' },
          { state: 'Illinois', state_code: 'IL' },
          { state: 'Indiana', state_code: 'IN' },
          { state: 'Iowa', state_code: 'IA' },
          { state: 'Kansas', state_code: 'KS' },
          { state: 'Kentucky', state_code: 'KY' },
          { state: 'Louisiana', state_code: 'LA' },
          { state: 'Maine', state_code: 'ME' },
          { state: 'Maryland', state_code: 'MD' },
          { state: 'Massachusetts', state_code: 'MA' },
          { state: 'Michigan', state_code: 'MI' },
          { state: 'Minnesota', state_code: 'MN' },
          { state: 'Mississippi', state_code: 'MS' },
          { state: 'Missouri', state_code: 'MO' },
          { state: 'Montana', state_code: 'MT' },
          { state: 'Nebraska', state_code: 'NE' },
          { state: 'Nevada', state_code: 'NV' },
          { state: 'New Hampshire', state_code: 'NH' },
          { state: 'New Jersey', state_code: 'NJ' },
          { state: 'New Mexico', state_code: 'NM' },
          { state: 'New York', state_code: 'NY' },
          { state: 'North Carolina', state_code: 'NC' },
          { state: 'North Dakota', state_code: 'ND' },
          { state: 'Ohio', state_code: 'OH' },
          { state: 'Oklahoma', state_code: 'OK' },
          { state: 'Oregon', state_code: 'OR' },
          { state: 'Pennsylvania', state_code: 'PA' },
          { state: 'Rhode Island', state_code: 'RI' },
          { state: 'South Carolina', state_code: 'SC' },
          { state: 'South Dakota', state_code: 'SD' },
          { state: 'Tennessee', state_code: 'TN' },
          { state: 'Texas', state_code: 'TX' },
          { state: 'Utah', state_code: 'UT' },
          { state: 'Vermont', state_code: 'VT' },
          { state: 'Virginia', state_code: 'VA' },
          { state: 'Washington', state_code: 'WA' },
          { state: 'West Virginia', state_code: 'WV' },
          { state: 'Wisconsin', state_code: 'WI' },
          { state: 'Wyoming', state_code: 'WY' }
        ];
        const error = null;

        if (error) {
          console.error('Error loading states:', error);
          return;
        }

        // Already unique data - no duplicates to remove
        setStates(data);

        
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
        // Major cities by state
        const citiesByState: Record<string, string[]> = {
          'California': ['Los Angeles', 'San Francisco', 'San Diego', 'San Jose', 'Oakland', 'Sacramento', 'Long Beach', 'Fresno', 'Santa Ana', 'Anaheim'],
          'New York': ['New York City', 'Buffalo', 'Rochester', 'Yonkers', 'Syracuse', 'Albany', 'New Rochelle', 'Mount Vernon'],
          'Texas': ['Houston', 'San Antonio', 'Dallas', 'Austin', 'Fort Worth', 'El Paso', 'Arlington', 'Corpus Christi', 'Plano', 'Lubbock'],
          'Florida': ['Jacksonville', 'Miami', 'Tampa', 'Orlando', 'St. Petersburg', 'Hialeah', 'Tallahassee', 'Fort Lauderdale', 'Port St. Lucie'],
          'Illinois': ['Chicago', 'Aurora', 'Rockford', 'Joliet', 'Naperville', 'Springfield', 'Peoria', 'Elgin', 'Waukegan'],
          'Pennsylvania': ['Philadelphia', 'Pittsburgh', 'Allentown', 'Erie', 'Reading', 'Scranton', 'Bethlehem', 'Lancaster'],
          'Ohio': ['Columbus', 'Cleveland', 'Cincinnati', 'Toledo', 'Akron', 'Dayton', 'Parma', 'Canton', 'Youngstown'],
          'Georgia': ['Atlanta', 'Columbus', 'Augusta', 'Macon', 'Savannah', 'Athens', 'Sandy Springs', 'Roswell', 'Johns Creek'],
          'North Carolina': ['Charlotte', 'Raleigh', 'Greensboro', 'Durham', 'Winston-Salem', 'Fayetteville', 'Cary', 'Wilmington'],
          'Michigan': ['Detroit', 'Grand Rapids', 'Warren', 'Sterling Heights', 'Lansing', 'Ann Arbor', 'Flint', 'Dearborn'],
          'New Jersey': ['Newark', 'Jersey City', 'Paterson', 'Elizabeth', 'Edison', 'Woodbridge', 'Lakewood', 'Toms River'],
          'Virginia': ['Virginia Beach', 'Norfolk', 'Chesapeake', 'Richmond', 'Newport News', 'Alexandria', 'Hampton', 'Portsmouth'],
          'Washington': ['Seattle', 'Spokane', 'Tacoma', 'Vancouver', 'Bellevue', 'Kent', 'Everett', 'Renton', 'Spokane Valley'],
          'Arizona': ['Phoenix', 'Tucson', 'Mesa', 'Chandler', 'Glendale', 'Scottsdale', 'Gilbert', 'Tempe', 'Peoria'],
          'Massachusetts': ['Boston', 'Worcester', 'Springfield', 'Lowell', 'Cambridge', 'New Bedford', 'Brockton', 'Quincy'],
          'Tennessee': ['Nashville', 'Memphis', 'Knoxville', 'Chattanooga', 'Clarksville', 'Murfreesboro', 'Franklin', 'Jackson'],
          'Indiana': ['Indianapolis', 'Fort Wayne', 'Evansville', 'South Bend', 'Carmel', 'Fishers', 'Bloomington', 'Hammond'],
          'Missouri': ['Kansas City', 'St. Louis', 'Springfield', 'Independence', 'Columbia', 'Lee\'s Summit', 'O\'Fallon'],
          'Maryland': ['Baltimore', 'Frederick', 'Rockville', 'Gaithersburg', 'Bowie', 'Hagerstown', 'Annapolis', 'College Park'],
          'Wisconsin': ['Milwaukee', 'Madison', 'Green Bay', 'Kenosha', 'Racine', 'Appleton', 'Waukesha', 'Eau Claire'],
          'Colorado': ['Denver', 'Colorado Springs', 'Aurora', 'Fort Collins', 'Lakewood', 'Thornton', 'Arvada', 'Westminster'],
          'Minnesota': ['Minneapolis', 'St. Paul', 'Rochester', 'Duluth', 'Bloomington', 'Brooklyn Park', 'Plymouth', 'St. Cloud'],
          'South Carolina': ['Charleston', 'Columbia', 'North Charleston', 'Mount Pleasant', 'Rock Hill', 'Greenville', 'Summerville'],
          'Alabama': ['Birmingham', 'Montgomery', 'Mobile', 'Huntsville', 'Tuscaloosa', 'Hoover', 'Dothan', 'Auburn'],
          'Louisiana': ['New Orleans', 'Baton Rouge', 'Shreveport', 'Lafayette', 'Lake Charles', 'Kenner', 'Bossier City'],
          'Kentucky': ['Louisville', 'Lexington', 'Bowling Green', 'Owensboro', 'Covington', 'Richmond', 'Georgetown'],
          'Oregon': ['Portland', 'Eugene', 'Salem', 'Gresham', 'Hillsboro', 'Bend', 'Beaverton', 'Medford'],
          'Oklahoma': ['Oklahoma City', 'Tulsa', 'Norman', 'Broken Arrow', 'Lawton', 'Edmond', 'Moore', 'Midwest City'],
          'Connecticut': ['Bridgeport', 'New Haven', 'Hartford', 'Stamford', 'Waterbury', 'Norwalk', 'Danbury', 'New Britain'],
          'Utah': ['Salt Lake City', 'West Valley City', 'Provo', 'West Jordan', 'Orem', 'Sandy', 'Ogden', 'St. George'],
          'Nevada': ['Las Vegas', 'Henderson', 'Reno', 'North Las Vegas', 'Sparks', 'Carson City', 'Fernley'],
          'Arkansas': ['Little Rock', 'Fort Smith', 'Fayetteville', 'Springdale', 'Jonesboro', 'North Little Rock', 'Conway'],
          'Mississippi': ['Jackson', 'Gulfport', 'Southaven', 'Hattiesburg', 'Biloxi', 'Meridian', 'Tupelo', 'Greenville'],
          'Kansas': ['Wichita', 'Overland Park', 'Kansas City', 'Topeka', 'Olathe', 'Lawrence', 'Shawnee', 'Manhattan'],
          'New Mexico': ['Albuquerque', 'Las Cruces', 'Rio Rancho', 'Santa Fe', 'Roswell', 'Farmington', 'Clovis'],
          'Nebraska': ['Omaha', 'Lincoln', 'Bellevue', 'Grand Island', 'Kearney', 'Fremont', 'Hastings', 'Norfolk'],
          'West Virginia': ['Charleston', 'Huntington', 'Parkersburg', 'Morgantown', 'Wheeling', 'Martinsburg'],
          'Idaho': ['Boise', 'Meridian', 'Nampa', 'Idaho Falls', 'Pocatello', 'Caldwell', 'Coeur d\'Alene'],
          'Hawaii': ['Honolulu', 'East Honolulu', 'Pearl City', 'Hilo', 'Kailua', 'Waipahu', 'Kaneohe'],
          'New Hampshire': ['Manchester', 'Nashua', 'Concord', 'Derry', 'Rochester', 'Salem', 'Dover'],
          'Maine': ['Portland', 'Lewiston', 'Bangor', 'South Portland', 'Auburn', 'Biddeford', 'Sanford'],
          'Montana': ['Billings', 'Missoula', 'Great Falls', 'Bozeman', 'Butte', 'Helena', 'Kalispell'],
          'Rhode Island': ['Providence', 'Warwick', 'Cranston', 'Pawtucket', 'East Providence', 'Woonsocket'],
          'Delaware': ['Wilmington', 'Dover', 'Newark', 'Middletown', 'Smyrna', 'Milford', 'Seaford'],
          'South Dakota': ['Sioux Falls', 'Rapid City', 'Aberdeen', 'Brookings', 'Watertown', 'Mitchell'],
          'North Dakota': ['Fargo', 'Bismarck', 'Grand Forks', 'Minot', 'West Fargo', 'Williston', 'Dickinson'],
          'Alaska': ['Anchorage', 'Juneau', 'Fairbanks', 'Sitka', 'Ketchikan', 'Wasilla', 'Kenai'],
          'Vermont': ['Burlington', 'Essex', 'South Burlington', 'Colchester', 'Rutland', 'Brattleboro'],
          'Wyoming': ['Cheyenne', 'Casper', 'Laramie', 'Gillette', 'Rock Springs', 'Sheridan', 'Green River']
        };
        
        const stateCities = citiesByState[selectedState] || [];
        const data = stateCities.map(city => ({ city }));
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