

import React, { useEffect, useState, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Chart, ChartItem } from 'chart.js/auto';
import { StatisticsService } from '../services/StatisticsService';
import logger from '../utils/logger';
import { Territory } from '../types';
import { useData } from '../context/DataContext';

export default function ReportsPage() {
  const { t } = useTranslation();
  const { territory } = useOutletContext<{ territory: Territory }>();
  const { appData } = useData();

  const [parishStats, setParishStats] = useState<any>(null);
  const [zoneStats, setZoneStats] = useState<any[]>([]);

  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!territory?.id) return;

    logger.info(`ReportsPage: Fetching stats for parish ${territory.id}`);
    const stats = StatisticsService.getParishStatsById(territory.id, appData.believers);
    const zones = StatisticsService.getZoneStatsByParishId(territory.id, appData);
    setParishStats(stats);
    setZoneStats(zones);
  }, [territory, appData]);

  useEffect(() => {
    if (!chartRef.current || !parishStats) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d') as ChartItem;
    
    chartInstanceRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [t('sacrament.believer_plural'), t('sacrament.baptism'), t('sacrament.confirmation'), t('sacrament.marriage')],
        datasets: [{
          label: t('reports.parish_statistics_for', { parishName: territory.name }),
          data: [
            parishStats.totalInParishBelievers,
            parishStats.totalInParishbaptized,
            parishStats.totalInParishConfirmed,
            parishStats.totalInParishMarried
          ],
          backgroundColor: ['#005493', '#B31917', '#FFD700', '#800080'],
          borderColor: '#fff',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: { display: true, text: t('reports.sacrament_overview'), font: { size: 16 } },
          legend: { display: false }
        },
        scales: { y: { beginAtZero: true } }
      }
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [parishStats, t, territory.name]);

  if (!territory || !parishStats) {
    return <div className="text-center p-8">{t('common.loading')}</div>;
  }

  return (
    <section className="space-y-8">
        <header className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">{t('reports.title_for', { parishName: territory.name })}</h2>
        </header>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold text-center mb-4">{t('reports.sacrament_overview')}</h3>
            <div className="relative h-96">
            <canvas ref={chartRef}></canvas>
            </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold mb-4">{t('reports.statistics_by_zone')}</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('common.zone')}</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('common.believers')}</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('common.families')}</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('common.apvs')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {zoneStats.length > 0 ? (
                        zoneStats.map(zone => (
                            <tr key={zone.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{zone.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-right">{zone.believersCount}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-right">{zone.familiesCount}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-right">{zone.apvs.length}</td>
                            </tr>
                        ))
                        ) : (
                        <tr>
                            <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">{t('common.no_data_available')}</td>
                        </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </section>
  );
}