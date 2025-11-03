
import React from 'react';

interface ExportButtonProps {
  stats: any;
  filename: string;
}

const ExportButton: React.FC<ExportButtonProps> = ({ stats, filename }) => {
  const handleExport = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(stats, null, 2)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = `${filename}.json`;
    link.click();
  };

  return (
    <button
      onClick={handleExport}
      className="mt-6 px-4 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
    >
      Export to JSON
    </button>
  );
};

export default ExportButton;
