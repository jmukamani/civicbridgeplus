import React, { useState } from 'react';
import { Search, X, FileText, MessageSquare, TrendingUp, BarChart3 } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { policies } from '../../data/mockData';

const PolicyAnalysis = ({ language }) => {
  const { t } = useTranslation(language);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Policy Overview</h1>
        <p className="text-gray-600 mt-2">Explore and compare key policies impacting your community.</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button className="border-b-2 border-blue-500 py-2 px-1 text-blue-600 font-medium">
            All Policies
          </button>
          <button className="py-2 px-1 text-gray-500 hover:text-gray-700">Active</button>
          <button className="py-2 px-1 text-gray-500 hover:text-gray-700">Drafts</button>
          <button className="py-2 px-1 text-gray-500 hover:text-gray-700">Archived</button>
        </nav>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
          <div className="bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="h-6 w-6 text-white" />
          </div>
          <h3 className="font-semibold mb-2">Policy Feedback</h3>
          <p className="text-gray-600 text-sm">Track citizen responses to current policies.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
          <div className="bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <h3 className="font-semibold mb-2">Community Impact</h3>
          <p className="text-gray-600 text-sm">See which policies drive the most change.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
          <div className="bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <h3 className="font-semibold mb-2">Policy Comparison</h3>
          <p className="text-gray-600 text-sm">Analyze differences between similar policies.</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search policies..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Recent Policy Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Recent Policy Activity</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {policies.map((policy) => (
            <div key={policy.id} className="p-6 hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedPolicy(policy)}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <h4 className="font-medium text-gray-900">{policy.title}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      policy.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {policy.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{policy.description}</p>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <p>{policy.comments} comments</p>
                  <p>Last updated: {policy.lastUpdated}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Engagement Trends by Policy Area */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Engagement Trends</h3>
        <div className="flex items-end space-x-2 h-40">
          {['Health', 'Edu', 'Energy', 'Water', 'Infra', 'Safety', 'Agri', 'Tech', 'Trade', 'Youth', 'Women', 'Enviro'].map((category, index) => (
            <div key={category} className="flex flex-col items-center flex-1">
              <div 
                className="bg-blue-600 w-full rounded-t"
                style={{ height: `${Math.random() * 100 + 20}%` }}
              ></div>
              <span className="text-xs text-gray-600 mt-1 transform -rotate-45 origin-left">{category}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Policy Detail Modal */}
      {selectedPolicy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedPolicy.title}</h2>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${
                    selectedPolicy.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedPolicy.status}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedPolicy(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-6">{selectedPolicy.description}</p>
              
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Key Points:</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Improved access to services for all citizens</li>
                  <li>Enhanced quality standards and regulations</li>
                  <li>Sustainable funding mechanisms</li>
                  <li>Community participation and feedback integration</li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold mb-2">Community Feedback ({selectedPolicy.comments} comments):</h3>
                <div className="space-y-3">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700">"This policy addresses critical needs in our community. I support the proposed changes."</p>
                    <p className="text-xs text-gray-500 mt-1">- Mary K., Nairobi East</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700">"More consultation needed with rural communities before implementation."</p>
                    <p className="text-xs text-gray-500 mt-1">- John M., Turkana</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                  Add Comment
                </button>
                <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200">
                  Share Policy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PolicyAnalysis;