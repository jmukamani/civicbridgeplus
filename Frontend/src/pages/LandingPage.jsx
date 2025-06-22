import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, MessageSquare, FileText, Users } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <header className="bg-kenya-red text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">CivicBridge Pulse Kenya</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Connecting citizens with their representatives for better governance and policy engagement
          </p>
          <div className="mt-10 flex justify-center space-x-4">
            <Link
              to="/register"
              className="btn-secondary px-8 py-3 text-lg font-medium"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="bg-white text-kenya-red px-8 py-3 text-lg font-medium rounded-md hover:bg-gray-100"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-kenya-black mb-12">How It Works</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <MapPin className="w-10 h-10 text-kenya-red" />,
                title: "Find Your Representatives",
                desc: "Locate and connect with your elected officials based on your location"
              },
              {
                icon: <MessageSquare className="w-10 h-10 text-kenya-red" />,
                title: "Direct Messaging",
                desc: "Communicate directly with your representatives about community issues"
              },
              {
                icon: <FileText className="w-10 h-10 text-kenya-red" />,
                title: "Policy Tracking",
                desc: "Stay informed about new policies and legislation in your county"
              },
              {
                icon: <Users className="w-10 h-10 text-kenya-red" />,
                title: "Community Engagement",
                desc: "Participate in discussions with other citizens in your area"
              }
            ].map((feature, index) => (
              <div key={index} className="card-base p-6 text-center">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-kenya-green text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to engage with your community?</h2>
          <p className="text-xl mb-8">
            Join thousands of Kenyans who are making their voices heard through CivicBridge
          </p>
          <Link
            to="/register"
            className="btn-primary px-8 py-3 text-lg font-medium inline-block"
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
              <a href="#" className="hover:text-kenya-red">About</a>
              <a href="#" className="hover:text-kenya-red">Contact</a>
              <a href="#" className="hover:text-kenya-red">Privacy</a>
              <a href="#" className="hover:text-kenya-red">Terms</a>
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