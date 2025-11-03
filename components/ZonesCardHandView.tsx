import React, { useState } from 'react';
import { TFunction } from 'i18next';

interface ApvBelieverStat {
  id: string;
  name: string;
  believerCount: number;
  familyCount: number;
}

interface ZoneStat {
  id: string;
  name: string;
  believers: number;
  families: number;
  apvCount: number;
  leaderName?: string;
  apvBelieverBreakdown: ApvBelieverStat[];
}

interface ZonesCardHandViewProps {
  zoneStatsList: ZoneStat[];
  t: TFunction;
}

const UsersIcon = ({ className = "h-4 w-4 inline mr-1" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zm-1.5 5.5a3 3 0 00-3 0V12a2 2 0 002 2h2a2 2 0 002-2v-.5a3 3 0 00-3 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zm-1.5 5.5a3 3 0 00-3 0V12a2 2 0 002 2h2a2 2 0 002-2v-.5a3 3 0 00-3 0z" /></svg>;
const HomeIcon = ({ className = "h-4 w-4 inline mr-1" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>;
const ChevronDownIcon = ({ className = "h-4 w-4 ml-auto transition-transform" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>;

const ZoneCard: React.FC<{ zone: ZoneStat, t: TFunction, index: number, total: number }> = ({ zone, t, index, total }) => {
    const rotation = (index - (total - 1) / 2) * 10;
    const [selectedApvId, setSelectedApvId] = useState<string | null>(null);

    const handleApvClick = (apvId: string) => {
        setSelectedApvId(prevId => (prevId === apvId ? null : apvId));
    };

    return (
        <div
            className="absolute w-64 h-auto min-h-[22rem] bg-white dark:bg-gray-700 rounded-lg shadow-lg p-4 flex flex-col justify-between transition-transform duration-300 hover:scale-110 hover:z-10 border-2 border-vatican-gold"
            style={{
                transform: `rotate(${rotation}deg)`,
                transformOrigin: 'bottom center',
                bottom: 0,
            }}
        >
            <div>
                <div className="text-center mb-3">
                    <h4 className="font-bold text-lg text-primary-800 dark:text-vatican-gold">{zone.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        <UsersIcon className="h-5 w-5 inline-block mr-1 text-primary-700 dark:text-primary-400" />
                        <span className="font-bold text-xl">{zone.believers}</span> {t('common.believers')}
                    </p>
                </div>

                <div className="flex justify-around text-center text-xs text-gray-500 dark:text-gray-400 mb-3 border-y dark:border-gray-600 py-2">
                    <div><span className="font-bold text-base">{zone.apvCount}</span> {t('common.apvs')}</div>
                    <div><span className="font-bold text-base">{zone.families}</span> {t('common.families')}</div>
                </div>

                <div className="space-y-1 text-sm overflow-y-auto max-h-36 pr-1">
                    {zone.apvBelieverBreakdown.map(apv => (
                        <div key={apv.id}>
                            <button 
                                onClick={() => handleApvClick(apv.id)}
                                className="w-full text-left p-2 rounded-md flex items-center transition-colors duration-200 bg-gray-100 dark:bg-gray-600 hover:bg-primary-100 dark:hover:bg-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                aria-expanded={selectedApvId === apv.id}
                            >
                                <span className="font-semibold flex-grow">{apv.name}</span>
                                <ChevronDownIcon className={`${selectedApvId === apv.id ? 'transform rotate-180' : ''}`} />
                            </button>
                            {selectedApvId === apv.id && (
                                <div className="pl-4 pr-2 py-2 mt-1 bg-gray-50 dark:bg-gray-800 rounded-md border-l-4 border-primary-500">
                                    <p className="flex items-center"><UsersIcon /> {apv.believerCount} {t('common.believers')}</p>
                                    <p className="flex items-center mt-1"><HomeIcon /> {apv.familyCount} {t('common.families')}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            
            {zone.leaderName && 
                <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('common.leader')}</p>
                    <p className="font-semibold text-sm">{zone.leaderName}</p>
                </div>
            }
        </div>
    );
}

const ZonesCardHandView: React.FC<ZonesCardHandViewProps> = ({ zoneStatsList, t }) => {
  if (!zoneStatsList || zoneStatsList.length === 0) {
    return <p className="text-center text-gray-500">{t('common.no_data_available')}</p>;
  }
  return (
    <div className="relative w-full h-80 flex justify-center items-end mt-8">
        {zoneStatsList.map((zone, index) => (
            <ZoneCard key={zone.id} zone={zone} t={t} index={index} total={zoneStatsList.length} />
        ))}
    </div>
  );
};

export default ZonesCardHandView;