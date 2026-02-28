import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, BookOpen, Zap, Users, Award, Heart } from 'lucide-react';

const AboutPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Shield,
      title: 'Verified Sources Only',
      description: 'All medical information is sourced exclusively from WHO, CDC, and government health organizations.'
    },
    {
      icon: BookOpen,
      title: 'Citation-First Approach',
      description: 'Every answer includes traceable citations with page numbers for full transparency.'
    },
    {
      icon: Zap,
      title: 'Lightning Fast RAG',
      description: 'Advanced retrieval system provides accurate answers in seconds, not minutes.'
    },
    {
      icon: Users,
      title: 'Built for Everyone',
      description: 'From healthcare professionals to patients, accessible medical information for all.'
    },
    {
      icon: Award,
      title: 'High Accuracy',
      description: 'Context-aware AI with confidence scoring to ensure reliable information.'
    },
    {
      icon: Heart,
      title: 'Privacy First',
      description: 'Your conversations are stored locally. We never share your medical queries.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-6 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Back to Chat
          </button>

          <h1 className="text-5xl font-black mb-4">
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              About TruthTriage
            </span>
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
            Your trusted AI medical information assistant, designed to provide accurate, 
            verified health information from authoritative sources.
          </p>
        </motion.div>

        {/* Mission */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-8 shadow-xl mb-8 border border-gray-100"
        >
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Our Mission</h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            TruthTriage was created to combat medical misinformation by providing instant access 
            to verified medical information. We believe everyone deserves accurate health information, 
            especially in Tier-2 and Tier-3 cities where medical resources may be limited.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold mb-8 text-gray-800">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
              >
                <div className="w-14 h-14 mb-4 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-800">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Technology */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 shadow-xl text-white"
        >
          <h2 className="text-3xl font-bold mb-6">Powered by Advanced Technology</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-xl mb-3">RAG Architecture</h3>
              <p className="text-blue-100 leading-relaxed">
                Retrieval-Augmented Generation ensures all answers are grounded in verified 
                medical documents, eliminating AI hallucinations.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-xl mb-3">Confidence Scoring</h3>
              <p className="text-blue-100 leading-relaxed">
                Every response includes a confidence score based on source quality and 
                relevance, helping you understand the reliability of information.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-xl mb-3">Vector Search</h3>
              <p className="text-blue-100 leading-relaxed">
                FAISS-powered semantic search finds the most relevant information from 
                thousands of medical document pages in milliseconds.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-xl mb-3">Real-time Analytics</h3>
              <p className="text-blue-100 leading-relaxed">
                Track session metrics, confidence trends, and response times to ensure 
                consistent, high-quality performance.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6"
        >
          <h3 className="font-bold text-lg mb-2 text-yellow-800">⚠️ Important Medical Disclaimer</h3>
          <p className="text-sm text-yellow-700 leading-relaxed">
            TruthTriage is an educational tool and should not replace professional medical advice, 
            diagnosis, or treatment. Always consult qualified healthcare professionals for medical decisions. 
            This tool is designed to supplement, not substitute, the relationship between patients and physicians.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutPage;