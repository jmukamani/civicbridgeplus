import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, MessageSquare, FileText, Users } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">CivicBridge Pulse Kenya</h1>
          <p className="text-xl max-w-3xl mx-auto text-gray-600">
            Connecting citizens with their representatives for better governance and policy engagement
          </p>
          <div className="mt-10 flex justify-center space-x-4">
            <Link
              to="/register"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold border border-blue-600 hover:bg-blue-50 transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How It Works</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><MapPin className="w-8 h-8 text-white" /></div>,
                title: "Find Your Representatives",
                desc: "Locate and connect with your elected officials based on your location"
              },
              {
                icon: <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><MessageSquare className="w-8 h-8 text-white" /></div>,
                title: "Direct Messaging",
                desc: "Communicate directly with your representatives about community issues"
              },
              {
                icon: <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><FileText className="w-8 h-8 text-white" /></div>,
                title: "Policy Tracking",
                desc: "Stay informed about new policies and legislation in your county"
              },
              {
                icon: <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><Users className="w-8 h-8 text-white" /></div>,
                title: "Community Engagement",
                desc: "Participate in discussions with other citizens in your area"
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-6 text-center">
                {feature.icon}
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-white rounded-lg shadow-lg mx-4 max-w-4xl mx-auto py-16 my-12">
        <div className="px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-900">Ready to engage with your community?</h2>
          <p className="text-xl mb-8 text-gray-600">
            Join thousands of Kenyans who are making their voices heard through CivicBridge
          </p>
          <Link
            to="/register"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors inline-block"
          >
            Create Your Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-kenya-black text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold">CivicBridge Pulse Kenya</h3>
              <p className="text-gray-400">Bridging the gap between citizens and government</p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="hover:text-blue-400">About</a>
              <a href="#" className="hover:text-blue-400">Contact</a>
              <a href="#" className="hover:text-blue-400">Privacy</a>
              <a href="#" className="hover:text-blue-400">Terms</a>
            </div>
          </div>
          <div className="mt-8 text-center text-gray-400 text-sm">
            © {new Date().getFullYear()} CivicBridge Pulse Kenya. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;