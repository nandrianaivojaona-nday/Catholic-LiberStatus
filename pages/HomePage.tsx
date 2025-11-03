import React, { useEffect, useState, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Chart, ChartItem } from 'chart.js/auto';
import { StatisticsService } from '../services/StatisticsService';
import { prepareGrowthData } from '../utils/chartDataUtils';
import ErrorBoundary from '../utils/ErrorBoundary';
import logger from '../utils/logger';
import ZonesCardHandView from '../components/ZonesCardHandView';
import { Territory, User, ROLES } from '../types';
import { useData } from '../context/DataContext';
import { hasPermission } from '../utils/permissionUtils';
import AdminModal from '../components/AdminModal';

const useDashboardStats = (parish: Territory | null) => {
    const { appData } = useData();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { t } = useTranslation();

    useEffect(() => {
        if (!parish) {
            setLoading(false);
            return;
        }

        const fetchStats = () => {
            logger.info(`HomePage: Fetching dashboard stats for parish ${parish.id}...`);
            setLoading(true);
            setError(null);
            try {
                const newStats = StatisticsService.getDashboardStats(parish, appData);
                if (!newStats) {
                    throw new Error(t('common.no_data_available'));
                }
                logger.info(`HomePage: Successfully fetched stats for parish ${parish.id}.`);
                
                setStats(newStats);

            } catch (err: any) {
                logger.error(`HomePage: Failed to get statistics for parish ${parish.id}.`, err);
                setError(err.message || t('common.error_occurred'));
            } finally {
                setLoading(false);
            }
        };

        fetchStats();

    }, [parish, t, appData]);

    return { stats, loading, error };
};

const StatCard: React.FC<{ title: string; value: string | number }> = ({ title, value }) => (
    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md text-center">
        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">{title}</h3>
        <p className="text-3xl font-bold text-papal-red dark:text-vatican-gold mt-2">{value}</p>
    </div>
);

const GroupSection: React.FC<{ title: string; groups?: any[], icon?: string }> = ({ title, groups, icon = "👥" }) => {
    if (!groups || groups.length === 0) return null;
    return (
        <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-center mb-4 text-swiss-guard-blue dark:text-vatican-gold">{icon} {title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groups.map(group => (
                    <div key={group.id} className="p-4 bg-gray-50 dark:bg-gray-600 rounded-md shadow-sm">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-100">{group.name}</h3>
                        {/* Here you could display the leader if that data is available */}
                    </div>
                ))}
            </div>
        </div>
    );
};

const EditIcon = ({ className = "" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${className}`} viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>;

export default function HomePage() {
    const { territory: selectedParishObject, currentUser } = useOutletContext<{ territory: Territory; currentUser: User | null }>();
    const { t } = useTranslation();
    const { appData, updateTerritory } = useData();
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstanceRef = useRef<Chart | null>(null);
    const { stats: dashboardStats, loading, error } = useDashboardStats(selectedParishObject);
    const [ancestryPath, setAncestryPath] = useState<Territory[] | null>(null);

    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
    const [messageContent, setMessageContent] = useState('');

    const canEditMessage = hasPermission(currentUser, 'EDIT_PRIEST_MESSAGE', { target: selectedParishObject });

    useEffect(() => {
        if (selectedParishObject) {
            const path = StatisticsService.getPathToTerritory(selectedParishObject.id, appData.territories.archdioceses);
            setAncestryPath(path);
        }
    }, [selectedParishObject, appData.territories.archdioceses]);

    useEffect(() => {
        if (loading || error || !dashboardStats?.historicalGrowth || !chartRef.current) return;
        
        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }

        const chartData = prepareGrowthData(dashboardStats.historicalGrowth);
        if (!chartData || chartData.keys.length === 0) return;

        const colors = ["#B31917", "#FFD700", "#005493", "#800080", "#2E8B57", "#FFA500"];
        const datasets = chartData.keys.map((key, idx) => ({
            label: t(`sacrament.${key}`),
            data: chartData.years.map(year => chartData.historicalTotals[key]?.[year] || 0),
            backgroundColor: colors[idx % colors.length],
        }));

        const ctx = chartRef.current.getContext('2d') as ChartItem;
        chartInstanceRef.current = new Chart(ctx, {
            type: 'bar',
            data: { labels: chartData.years.map(String), datasets },
            options: {
                responsive: true,
                plugins: { title: { display: true, text: t('reports.sacrament_overview') } },
                scales: { y: { beginAtZero: true } },
            },
        });

        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
        };
    }, [loading, error, dashboardStats, t]);

    const handleEditMessage = () => {
        setMessageContent(dashboardStats?.priestMessage || '');
        setIsMessageModalOpen(true);
    };

    const handleSaveMessage = () => {
        if (selectedParishObject) {
            updateTerritory(selectedParishObject.id, { priestMessage: messageContent });
        }
        setIsMessageModalOpen(false);
    };

    if (loading) return <div className="text-center p-8">{t('common.loading')}</div>;
    if (error) return <div className="text-center p-8 text-red-500"><h3>{t('common.error_occurred')}</h3><p>{error}</p></div>;
    if (!dashboardStats) return <div className="text-center p-8"><p>{t('common.no_data_available')}</p></div>;
    
    return (
        <ErrorBoundary>
            <div className="space-y-8">
                <header className="text-center">
                    <h1 className="text-4xl font-bold text-swiss-guard-blue dark:text-vatican-gold">{dashboardStats.parishName}</h1>
                    <p className="text-md text-gray-500 dark:text-gray-400">{dashboardStats.parishAddress} | {t('common.priest')}: {dashboardStats.leadership.priest}</p>
                    {ancestryPath && ancestryPath.length > 1 && (
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            {ancestryPath.slice(0, -1).map((p, index) => (
                                <span key={p.id}>
                                    <strong>{t(`common.${p.type?.toLowerCase()}`)}:</strong> {p.name} ({p.id})
                                    {index < ancestryPath.length - 2 ? ' / ' : ''}
                                </span>
                            ))}
                        </div>
                    )}
                </header>
                
                 {/* Priest Welcome Section */}
                <div className="bg-white dark:bg-gray-700 rounded-lg shadow-xl overflow-hidden flex flex-col md:flex-row">
                    <img src="https://picsum.photos/seed/priest/400/600" alt={t('homePage.priest_of_parish')} className="w-full md:w-1/3 h-64 md:h-auto object-cover" />
                    <div className="p-8 flex flex-col justify-center flex-1">
                        <div className="flex justify-between items-center">
                            <h3 className="text-2xl font-bold text-swiss-guard-blue dark:text-vatican-gold">🙏 {t('homePage.message_from_priest')}</h3>
                            {canEditMessage && (
                                <button onClick={handleEditMessage} className="px-3 py-1 bg-vatican-gold/80 text-black text-sm rounded-md hover:bg-vatican-gold flex items-center gap-1.5 transition-colors">
                                    <EditIcon />
                                    Edit Message
                                </button>
                            )}
                        </div>
                        <p className="mt-2 text-lg font-semibold">{t('homePage.peace_of_christ')}</p>
                        <p className="mt-2 text-gray-600 dark:text-gray-300">
                           {dashboardStats.priestMessage || t('homePage.welcome_to_liberstatus', { parishName: dashboardStats.parishName })}
                        </p>
                        <blockquote className="mt-4 border-l-4 border-vatican-gold pl-4 italic text-gray-500 dark:text-gray-400">
                            "{t('homePage.quote_1_corinthians')}"
                            <cite className="block not-italic mt-1">- {t('homePage.quote_source')}</cite>
                        </blockquote>
                    </div>
                     <div className="p-8 flex items-center justify-center bg-gray-50 dark:bg-gray-700/50">
                        <img src={dashboardStats.parishLogoUrl} alt={`${dashboardStats.parishName} Logo`} className="w-32 h-32 object-contain" onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/defaultlogo/200'; }} />
                    </div>
                </div>

                {/* Sacrament Stats */}
                <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold text-center mb-6 text-swiss-guard-blue dark:text-vatican-gold">{t('homePage.sacrament_stats')}</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard title={t('common.believers')} value={dashboardStats.totals.believers} />
                        <StatCard title={t('sacrament.baptism')} value={dashboardStats.sacraments.baptism} />
                        <StatCard title={t('sacrament.confirmation')} value={dashboardStats.sacraments.confirmation} />
                        <StatCard title={t('sacrament.marriage')} value={dashboardStats.sacraments.marriage} />
                    </div>
                    <div className="mt-6 h-96"><canvas ref={chartRef}></canvas></div>
                </div>

                {/* Zones Section */}
                <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold text-center mb-4 text-swiss-guard-blue dark:text-vatican-gold">🌍 {t('common.zones')}</h2>
                    <ZonesCardHandView zoneStatsList={dashboardStats.zoneBreakdown || []} t={t} />
                </div>
                
                {/* Group Sections */}
                <GroupSection title={t('homePage.holy_associations')} groups={dashboardStats.holyAssociations} icon="🕊️" />
                <GroupSection title={t('homePage.node_groups')} groups={dashboardStats.nodeGroups} icon="🌱" />
                <GroupSection title="Prayers Groups" groups={dashboardStats.prayersGroups} icon="🙏" />
                <GroupSection title="Commissions" groups={dashboardStats.commissions} icon="📋" />


            </div>

            <AdminModal title="Edit Priest's Message" isOpen={isMessageModalOpen} onClose={() => setIsMessageModalOpen(false)}>
                <div className="space-y-4">
                    <textarea 
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        rows={6}
                        className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-vatican-gold focus:border-vatican-gold"
                        placeholder="Enter the priest's welcome message..."
                    />
                    <div className="flex justify-end space-x-2">
                        <button onClick={() => setIsMessageModalOpen(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">
                            Cancel
                        </button>
                        <button onClick={handleSaveMessage} className="px-4 py-2 bg-swiss-guard-blue text-white rounded-md hover:bg-blue-800">
                            Save Message
                        </button>
                    </div>
                </div>
            </AdminModal>
        </ErrorBoundary>
    );
}
