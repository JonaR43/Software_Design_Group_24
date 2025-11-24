import { useState } from 'react';
import { HttpClient } from '~/services/api';
import { showSuccess, showError, showLoading } from "~/utils/toast";
import toast from 'react-hot-toast';

const ReportingPage = () => {
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});

  const handleDownload = async (reportType: string, format: string) => {
    const loadingKey = `${reportType}-${format}`;
    setLoading(prev => ({ ...prev, [loadingKey]: true }));

    const toastId = showLoading(`Generating ${reportType} report...`);

    try {
      const blob = await HttpClient.download(`/admin/reporting/${reportType}?format=${format}`);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.dismiss(toastId);
      showSuccess(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report downloaded successfully!`);
    } catch (error) {
      toast.dismiss(toastId);
      console.error('Download error:', error);
      showError(`Failed to generate ${reportType} report. Please try again.`);
    } finally {
      setLoading(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  const reportTypes = [
    {
      id: 'volunteers',
      title: 'Volunteer Participation Reports',
      description: 'Comprehensive reports on volunteer participation history, hours worked, and event attendance.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      gradient: 'from-blue-500 to-cyan-500',
      stats: [
        { label: 'Total Volunteers', value: 'All', color: 'text-blue-600' },
        { label: 'Participation Records', value: 'Detailed', color: 'text-cyan-600' },
        { label: 'Hours Tracked', value: 'Complete', color: 'text-blue-500' }
      ]
    },
    {
      id: 'events',
      title: 'Event Assignment Reports',
      description: 'Detailed reports on event details, volunteer assignments, and event statuses across your organization.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      gradient: 'from-violet-500 to-purple-500',
      stats: [
        { label: 'All Events', value: 'Full', color: 'text-violet-600' },
        { label: 'Assignments', value: 'Tracked', color: 'text-purple-600' },
        { label: 'Event Status', value: 'Current', color: 'text-violet-500' }
      ]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-indigo-100 to-violet-100 rounded-lg">
            <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Reports & Analytics</h1>
            <p className="text-slate-600 mt-1">Generate comprehensive reports in PDF or CSV format</p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm text-slate-700">
                <span className="font-semibold">Export Options:</span> Download reports as PDF for professional presentations or CSV for data analysis in Excel/Sheets.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {reportTypes.map((report) => (
          <div key={report.id} className="card overflow-hidden group hover:shadow-xl transition-all duration-300">
            {/* Card Header with Gradient */}
            <div className={`bg-gradient-to-r ${report.gradient} p-6 text-white`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-lg">
                    {report.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{report.title}</h2>
                    <p className="text-white/90 text-sm mt-1 max-w-md">{report.description}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 border-b border-slate-100">
              {report.stats.map((stat, idx) => (
                <div key={idx} className="text-center">
                  <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="p-6">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* PDF Button */}
                <button
                  onClick={() => handleDownload(report.id, 'pdf')}
                  disabled={loading[`${report.id}-pdf`]}
                  className="flex-1 group/btn flex items-center justify-center gap-3 px-5 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg font-medium hover:from-red-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                  </svg>
                  {loading[`${report.id}-pdf`] ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Generating PDF...</span>
                    </>
                  ) : (
                    <span>Download PDF</span>
                  )}
                </button>

                {/* CSV Button */}
                <button
                  onClick={() => handleDownload(report.id, 'csv')}
                  disabled={loading[`${report.id}-csv`]}
                  className="flex-1 group/btn flex items-center justify-center gap-3 px-5 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  {loading[`${report.id}-csv`] ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Generating CSV...</span>
                    </>
                  ) : (
                    <span>Download CSV</span>
                  )}
                </button>
              </div>

              {/* Format Info */}
              <div className="mt-4 flex items-start gap-2 text-sm text-slate-600">
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <p className="text-xs">
                  <span className="font-medium">PDF:</span> Styled report with charts & branding •
                  <span className="font-medium ml-2">CSV:</span> Raw data for Excel/Sheets analysis
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Info Section */}
      <div className="card p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-100 rounded-lg">
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Report Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
              <div>
                <p className="font-medium text-slate-700 mb-1">Volunteer Reports Include:</p>
                <ul className="space-y-1">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                    Complete participation history
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                    Hours worked per volunteer
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                    Event attendance records
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                    Volunteer contact information
                  </li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-slate-700 mb-1">Event Reports Include:</p>
                <ul className="space-y-1">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-violet-500 rounded-full"></span>
                    All event details and dates
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-violet-500 rounded-full"></span>
                    Volunteer assignments per event
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-violet-500 rounded-full"></span>
                    Event status tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-violet-500 rounded-full"></span>
                    Assignment status breakdown
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportingPage;
