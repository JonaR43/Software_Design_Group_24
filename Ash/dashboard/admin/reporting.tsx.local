
import React, { useState } from 'react';
import { HttpClient } from '~/services/api';

const ReportingPage = () => {
  const [loading, setLoading] = useState(false);

  const handleDownload = async (reportType, format) => {
    setLoading(true);
    try {
      const blob = await HttpClient.download(`/admin/reporting/${reportType}?format=${format}`);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}-report.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error('Download error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Reporting</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Volunteer Reports</h2>
          <p className="mb-4">Generate reports on volunteer participation history.</p>
          <div className="flex gap-2">
            <button
              onClick={() => handleDownload('volunteers', 'csv')}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Download CSV'}
            </button>
            <button
              onClick={() => handleDownload('volunteers', 'pdf')}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Download PDF'}
            </button>
          </div>
        </div>

        <div className="border p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Event Reports</h2>
          <p className="mb-4">Generate reports on event details and volunteer assignments.</p>
          <div className="flex gap-2">
            <button
              onClick={() => handleDownload('events', 'csv')}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Download CSV'}
            </button>
            <button
              onClick={() => handleDownload('events', 'pdf')}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Download PDF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportingPage;
