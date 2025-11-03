import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { StatisticsService } from '../services/StatisticsService';

const logoBase64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAJAAkADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1VXV1hZWmNkZWZnaGlqc3R1dnd4eXqCg4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIydLT1NXW19jZ2uLj5OXm5+jp6vLz9PX2+Pn6v/aAAwDAQACEQMRAD8A/v4ooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigA-";

// Define simple types for territory dropdowns
type BasicTerritory = { id: string; name: string; };
type Diocese = BasicTerritory & { vicariates?: Vicariate[] };
type Vicariate = BasicTerritory & { districts?: District[] };
type District = BasicTerritory & { parishes?: BasicTerritory[] };
type Archdiocese = BasicTerritory & { dioceses?: Diocese[] };

const SelectField: React.FC<{
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: BasicTerritory[];
  placeholder: string;
}> = ({ label, value, onChange, options, placeholder }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}:</label>
    <select value={value} onChange={onChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-vatican-gold focus:border-vatican-gold dark:bg-gray-700 dark:border-gray-600 dark:text-white">
      <option value="">-- {placeholder} --</option>
      {options.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
    </select>
  </div>
);

export default function LandingPage() {
  const { t } = useTranslation();
  const { openLoginModal, currentUser } = useAuth();
  const { appData } = useData();

  const [archdioceses, setArchdioceses] = useState<Archdiocese[]>([]);
  const [selectedArchdiocese, setSelectedArchdiocese] = useState('');
  const [dioceses, setDioceses] = useState<Diocese[]>([]);
  const [selectedDiocese, setSelectedDiocese] = useState('');
  const [vicariates, setVicariates] = useState<Vicariate[]>([]);
  const [selectedVicariate, setSelectedVicariate] = useState('');
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [parishes, setParishes] = useState<BasicTerritory[]>([]);
  const [selectedParishId, setSelectedParishId] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    if (appData.territories?.archdioceses) {
      setArchdioceses(appData.territories.archdioceses as Archdiocese[]);
    }
  }, [appData]);

  useEffect(() => {
    if (currentUser?.territoryId) {
      window.location.hash = `/app/${currentUser.territoryId}`;
    }
  }, [currentUser]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchQuery.length > 2) {
        const results = StatisticsService.searchParishes(searchQuery, appData.territories.archdioceses);
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    }, 300); // Debounce search
    return () => clearTimeout(handler);
  }, [searchQuery, appData.territories.archdioceses]);

  const handleArchdioceseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const archId = e.target.value;
    const arch = archdioceses.find(a => a.id === archId);
    setSelectedArchdiocese(archId);
    setDioceses(arch?.dioceses || []);
    setSelectedDiocese('');
    setVicariates([]);
    setSelectedVicariate('');
    setDistricts([]);
    setSelectedDistrict('');
    setParishes([]);
    setSelectedParishId('');
  };
  
    const handleDioceseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const dioceseId = e.target.value;
    const diocese = dioceses.find(d => d.id === dioceseId);
    setSelectedDiocese(dioceseId);
    setVicariates(diocese?.vicariates || []);
    setSelectedVicariate('');
    setDistricts([]);
    setSelectedDistrict('');
    setParishes([]);
    setSelectedParishId('');
  };

  const handleVicariateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const vicariateId = e.target.value;
    const vicariate = vicariates.find(v => v.id === vicariateId);
    setSelectedVicariate(vicariateId);
    setDistricts(vicariate?.districts || []);
    setSelectedDistrict('');
    setParishes([]);
    setSelectedParishId('');
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const districtId = e.target.value;
    const district = districts.find(d => d.id === districtId);
    setSelectedDistrict(districtId);
    setParishes(district?.parishes || []);
    setSelectedParishId('');
  };

  const handleParishChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedParishId(e.target.value);
  };
  
  const handleContinue = () => {
    if (selectedParishId) {
      window.location.hash = `/app/${selectedParishId}`;
    }
  };
  
  const handleSearchResultClick = (result: any) => {
    const [archId, dioceseId, vicariateId, districtId, parishId] = result.pathIds;

    setSelectedArchdiocese(archId);
    const arch = archdioceses.find(a => a.id === archId);
    const newDioceses = arch?.dioceses || [];
    setDioceses(newDioceses);

    setSelectedDiocese(dioceseId);
    const diocese = newDioceses.find(d => d.id === dioceseId);
    const newVicariates = diocese?.vicariates || [];
    setVicariates(newVicariates);

    setSelectedVicariate(vicariateId);
    const vicariate = newVicariates.find(v => v.id === vicariateId);
    const newDistricts = vicariate?.districts || [];
    setDistricts(newDistricts);

    setSelectedDistrict(districtId);
    const district = newDistricts.find(d => d.id === districtId);
    const newParishes = district?.parishes || [];
    setParishes(newParishes);
    
    setSelectedParishId(parishId);
    
    setSearchQuery(result.name);
    setSearchResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
        <header className="absolute top-0 right-0 p-6 flex items-center space-x-4">
            <LanguageSwitcher />
            <button onClick={openLoginModal} className="px-4 py-2 bg-swiss-guard-blue text-vatican-white font-semibold rounded-lg shadow-md hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-vatican-gold focus:ring-opacity-75">
                {t('landingPage.signIn')}
            </button>
        </header>
        <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl">
            <div className="text-center mb-8">
                <img src={logoBase64} alt="Liberstatus Catholic Logo" className="w-40 h-40 mx-auto mb-4" />
                <h1 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">{t('landingPage.selectYourParish')}</h1>
            </div>

            <div className="mb-4 relative">
              <input 
                type="text"
                placeholder="Or search for your parish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-vatican-gold focus:border-vatican-gold dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              {searchResults.length > 0 && (
                <ul className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                  {searchResults.map(result => (
                    <li 
                      key={result.id} 
                      onClick={() => handleSearchResultClick(result)}
                      className="px-4 py-2 hover:bg-vatican-gold/20 dark:hover:bg-vatican-gold/30 cursor-pointer"
                    >
                      <div className="font-semibold">{result.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{result.fullPath}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <SelectField label={t('common.archdiocese')} value={selectedArchdiocese} onChange={handleArchdioceseChange} options={archdioceses} placeholder={t('landingPage.selectArchdiocese')} />
            {dioceses.length > 0 && <SelectField label={t('common.diocese')} value={selectedDiocese} onChange={handleDioceseChange} options={dioceses} placeholder={`Select ${t('common.diocese')}`} />}
            {vicariates.length > 0 && <SelectField label={t('common.vicariate')} value={selectedVicariate} onChange={handleVicariateChange} options={vicariates} placeholder={`Select ${t('common.vicariate')}`} />}
            {districts.length > 0 && <SelectField label={t('common.district')} value={selectedDistrict} onChange={handleDistrictChange} options={districts} placeholder={`Select ${t('common.district')}`} />}
            {parishes.length > 0 && <SelectField label={t('common.parish')} value={selectedParishId} onChange={handleParishChange} options={parishes} placeholder={`Select ${t('common.parish')}`} />}

            <button
              onClick={handleContinue}
              disabled={!selectedParishId}
              className="w-full mt-4 px-4 py-3 bg-papal-red text-vatican-white font-bold rounded-lg shadow-lg hover:bg-red-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
            >
                {t('common.continue')} &rarr;
            </button>
        </div>
    </div>
  );
}