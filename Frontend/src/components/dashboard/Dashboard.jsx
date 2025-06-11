import React from 'react';
import { Bell, MessageSquare, Vote, FileText, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';

const Dashboard = ({ currentUser, language }) => {
  const { t } = useTranslation(language);
  const navigate = useNavigate();

  const handleMessageRep = () => {
    navigate('/representatives');
  };

  const handleReportIssue = () => {
    navigate('/policy-analysis');
  };

  const handleViewPolls = () => {
    navigate('/policy-analysis');
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {t('welcome')}, {currentUser?.name || 'Jane'}
        </h1>
        <p className="text-gray-600 mt-2">{t('yourCivicEngagement')}</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button className="border-b-2 border-blue-500 py-2 px-1 text-blue-600 font-medium">
            Overview
          </button>
          <button className="py-2 px-1 text-gray-500 hover:text-gray-700">
            Messages
          </button>
          <button className="py-2 px-1 text-gray-500 hover:text-gray-700">
            Policy Analysis
          </button>
        </nav>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('quickActions')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
            <div className="bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold mb-2">{t('reportIssue')}</h3>
            <p className="text-gray-600 text-sm mb-4">Raise a concern to your representative.</p>
            <button 
              onClick={handleReportIssue}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
            >
              Report
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
            <div className="bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold mb-2">{t('messageRep')}</h3>
            <p className="text-gray-600 text-sm mb-4">Start a conversation with your official.</p>
            <button 
              onClick={handleMessageRep}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
            >
              Message
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
            <div className="bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Vote className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold mb-2">{t('viewPolls')}</h3>
            <p className="text-gray-600 text-sm mb-4">Participate in ongoing policy polls.</p>
            <button 
              onClick={handleViewPolls}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
            >
              Vote
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
            <div className="bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold mb-2">{t('policyPage')}</h3>
            <p className="text-gray-600 text-sm mb-4">Explore and analyze policies.</p>
            <Link 
              to="/policy-analysis"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
            >
              Go to Policy
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">{t('recentActivity')}</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                👨‍💼
              </div>
              <div className="flex-1">
                <p className="font-medium">Message from Rep. Otieno</p>
                <p className="text-sm text-gray-600">Today • 1 new message</p>
              </div>
              <MessageSquare className="h-5 w-5 text-gray-400" />
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Vote className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Participated in Health Policy Poll</p>
                <p className="text-sm text-gray-600">Yesterday</p>
              </div>
              <Eye className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Engagement Trends Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">{t('engagementTrends')}</h3>
          <div className="flex items-end space-x-2 h-40">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => (
              <div key={month} className="flex flex-col items-center flex-1">
                <div 
                  className="bg-blue-600 w-full rounded-t"
                  style={{ height: `${Math.random() * 100 + 20}%` }}
                ></div>
                <span className="text-xs text-gray-600 mt-1">{month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;