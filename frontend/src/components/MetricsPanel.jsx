import React from 'react';
import { motion } from 'framer-motion';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { TrendingUp, Clock, Target, CheckCircle, X } from 'lucide-react';

const MetricsPanel = ({ metrics, messages }) => {
  const getConfidenceData = () => {
    return messages
      .filter(m => !m.isUser && m.confidence)
      .map((m, i) => ({
        name: `Q${i + 1}`,
        confidence: m.confidence
      }));
  };

  const getResponseTimeData = () => {
    return messages
      .filter(m => !m.isUser && m.responseTime)
      .map((m, i) => ({
        name: `Q${i + 1}`,
        time: parseFloat(m.responseTime)
      }));
  };

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: "spring", damping: 25 }}
      className="w-96 bg-white border-l border-gray-200 shadow-2xl overflow-y-auto"
    >
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Session Metrics</h2>
          <p className="text-sm text-gray-500">Real-time performance analytics</p>
        </div>

        {/* Confidence Score */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 mb-6 border border-blue-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-semibold text-gray-600 mb-1">Average Confidence</div>
              <div className="text-3xl font-black text-blue-600">{metrics.avgConfidence}%</div>
            </div>
            <div className="w-20 h-20">
              <CircularProgressbar
                value={metrics.avgConfidence}
                strokeWidth={10}
                styles={buildStyles({
                  pathColor: `rgba(59, 130, 246, ${metrics.avgConfidence / 100})`,
                  textColor: '#3b82f6',
                  trailColor: '#dbeafe',
                })}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <TrendingUp className="w-4 h-4" />
            <span className="font-medium">Based on {metrics.questionsAsked} questions</span>
          </div>
        </motion.div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100"
          >
            <CheckCircle className="w-8 h-8 text-green-600 mb-2" />
            <div className="text-2xl font-black text-green-600">{metrics.successRate}%</div>
            <div className="text-xs font-semibold text-gray-600">Success Rate</div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-100"
          >
            <Target className="w-8 h-8 text-purple-600 mb-2" />
            <div className="text-2xl font-black text-purple-600">{metrics.sourcesRetrieved}</div>
            <div className="text-xs font-semibold text-gray-600">Sources Found</div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100"
          >
            <Clock className="w-8 h-8 text-orange-600 mb-2" />
            <div className="text-2xl font-black text-orange-600">{metrics.avgResponseTime}s</div>
            <div className="text-xs font-semibold text-gray-600">Avg Response</div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-4 border border-pink-100"
          >
            <TrendingUp className="w-8 h-8 text-pink-600 mb-2" />
            <div className="text-2xl font-black text-pink-600">{metrics.questionsAsked}</div>
            <div className="text-xs font-semibold text-gray-600">Total Queries</div>
          </motion.div>
        </div>

        {/* Confidence Trend Chart */}
        {getConfidenceData().length > 0 && (
          <div className="bg-white rounded-2xl p-4 mb-6 border border-gray-200">
            <h3 className="text-sm font-bold text-gray-700 mb-4">Confidence Trend</h3>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={getConfidenceData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="confidence" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Response Time Chart */}
        {getResponseTimeData().length > 0 && (
          <div className="bg-white rounded-2xl p-4 border border-gray-200">
            <h3 className="text-sm font-bold text-gray-700 mb-4">Response Time</h3>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={getResponseTimeData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="time" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MetricsPanel;