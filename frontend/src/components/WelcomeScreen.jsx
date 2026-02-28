import React from 'react';
import { motion } from 'framer-motion';
import { Shield, BookOpen, Zap, TrendingUp, Award, Lock } from 'lucide-react';

const WelcomeScreen = ({ metrics }) => {
  const features = [
    { 
      icon: Shield, 
      title: 'Verified Sources', 
      desc: 'All answers from WHO, CDC, and government guidelines',
      color: 'from-green-500 to-emerald-600'
    },
    { 
      icon: BookOpen, 
      title: 'Cited References', 
      desc: 'Every answer includes source citations with page numbers',
      color: 'from-blue-500 to-indigo-600'
    },
    { 
      icon: Lock, 
      title: 'Safe & Reliable', 
      desc: 'No AI hallucinations, only factual information',
      color: 'from-purple-500 to-violet-600'
    },
    { 
      icon: Zap, 
      title: 'Lightning Fast', 
      desc: 'Get answers in seconds with our optimized RAG system',
      color: 'from-yellow-500 to-orange-600'
    },
    { 
      icon: TrendingUp, 
      title: 'High Accuracy', 
      desc: 'Context-aware responses with confidence scoring',
      color: 'from-pink-500 to-rose-600'
    },
    { 
      icon: Award, 
      title: 'Trusted Platform', 
      desc: 'Built for healthcare professionals and patients',
      color: 'from-cyan-500 to-teal-600'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="text-center mt-10"
    >
      {/* Hero Section */}
      <motion.div variants={itemVariants} className="mb-12">
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            repeatDelay: 2
          }}
          className="text-9xl mb-6 inline-block"
        >
          💊
        </motion.div>
        
        <h1 className="text-6xl font-black mb-4">
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            TruthTriage
          </span>
        </h1>
        
        <p className="text-2xl text-gray-600 mb-6 font-light">
          Your trusted AI medical information assistant
        </p>
        
        <div className="flex items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full border border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="font-semibold">System Active</span>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full border border-blue-200">
            <Shield className="w-4 h-4" />
            <span className="font-semibold">{metrics.successRate}% Success Rate</span>
          </div>
        </div>
      </motion.div>

      {/* Feature Grid */}
      <motion.div 
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12"
      >
        {features.map((feature, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            whileHover={{ 
              scale: 1.05, 
              y: -5,
              boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
            }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 cursor-pointer group"
          >
            <div className={`w-14 h-14 mb-4 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center transform group-hover:rotate-6 transition-transform`}>
              <feature.icon className="w-7 h-7 text-white" />
            </div>
            <h3 className="font-bold text-gray-800 mb-2 text-lg">{feature.title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{feature.desc}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Stats */}
      <motion.div 
        variants={itemVariants}
        className="bg-white rounded-2xl p-8 shadow-xl max-w-4xl mx-auto border border-gray-100"
      >
        <h3 className="text-xl font-bold mb-6 text-gray-800">Session Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-3xl font-black text-blue-600 mb-1">
              {metrics.questionsAsked}
            </div>
            <div className="text-sm text-gray-500 font-medium">Questions Asked</div>
          </div>
          <div>
            <div className="text-3xl font-black text-green-600 mb-1">
              {metrics.sourcesRetrieved}
            </div>
            <div className="text-sm text-gray-500 font-medium">Sources Retrieved</div>
          </div>
          <div>
            <div className="text-3xl font-black text-purple-600 mb-1">
              {metrics.avgConfidence}%
            </div>
            <div className="text-sm text-gray-500 font-medium">Avg Confidence</div>
          </div>
          <div>
            <div className="text-3xl font-black text-orange-600 mb-1">
              {metrics.avgResponseTime}s
            </div>
            <div className="text-sm text-gray-500 font-medium">Avg Response Time</div>
          </div>
        </div>
      </motion.div>

      {/* CTA */}
      <motion.p
        variants={itemVariants}
        className="mt-10 text-gray-500 text-lg"
      >
        Start by asking a medical question below 👇
      </motion.p>
    </motion.div>
  );
};

export default WelcomeScreen;