

import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import { StatisticsService } from '../services/StatisticsService';
import ExportButton from '../components/ExportButton';
import logger from '../utils/logger';
import { Territory } from '../types';
import { useData } from '../context/DataContext';

export default function ContributionsPage() {
  const { t } = useTranslation();
  const { territory } = useOutletContext<{ territory: Territory }>();
  const { appData } = useData();
  const [contributions, setContributions] = useState<any[]>([]);

  useEffect(() => {
    if (!territory?.id) return;
    logger.info(`ContributionsPage: Fetching contribution data for parish ${territory.id}`);
    const parishContributions = StatisticsService.getContributionsByParishId(territory.id, appData);
    setContributions(parishContributions);
  }, [territory, appData]);

  const totalAmount = useMemo(() => {
    return contributions.reduce((sum, contribution) => sum + contribution.amount, 0);
  }, [contributions]);

  if (!territory) {
    return <div className="text-center p-8">{t('common.loading')}</div>;
  }

  return (
    <section className="space-y-8">
        <header className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">{t('contributions.summary_for', { parishName: territory.name })}</h2>
            <p className="text-md text-gray-500 dark:text-gray-400 mt-2">{t('contributions.summary_description')}</p>
        </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">{t('contributions.totalTitle')}</h3>
            <p className="text-4xl font-bold text-green-600 dark:text-green-400 mt-4">
                {totalAmount.toLocaleString()} Ar
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{t('contributions.totalText')}</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/50 p-6 rounded-lg border border-blue-200 dark:border-blue-800 flex items-center">
            <p className="text-blue-800 dark:text-blue-200">{t('contributions.management_info')}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-2xl font-bold mb-4">{t('contributions.tableTitle')}</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('contributions.table_header_category')}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('contributions.table_header_family')}</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('contributions.table_header_amount')}</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {contributions.length > 0 ? (
                contributions.map((c, index) => (
                  <tr key={`${c.memberId}-${c.category}-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{c.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{c.familyName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-right">{c.amount.toLocaleString()} Ar</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">{t('common.no_data_available')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-center">
        <ExportButton 
          stats={contributions} 
          filename={`contributions_${territory.id}_${new Date().toISOString().split('T')[0]}`} 
        />
      </div>
    </section>
  );
}