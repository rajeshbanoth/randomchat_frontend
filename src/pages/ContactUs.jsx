// src/pages/ContactUs.jsx (Updated for Nodemailer)
import React, { useState, useEffect } from 'react';
import { 
  FaEnvelope, FaPhone, FaMapMarkerAlt, FaClock, FaPaperPlane,
  FaCheckCircle, FaExclamationTriangle, FaUser, FaComment,
  FaFileAlt, FaLightbulb, FaBug, FaQuestionCircle, FaStar,
  FaHeart, FaShieldAlt, FaUsers, FaGlobe, FaBuilding,
  FaHeadset, FaRocket, FaChartLine, FaHandshake, FaCrown,
  FaMedal, FaAward, FaGavel, FaNewspaper, FaBriefcase
} from 'react-icons/fa';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL+"/api" || 'http://localhost:5001/api';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contactReason: '',
    subject: '',
    message: '',
    priority: 'normal'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [characterCount, setCharacterCount] = useState(0);
  const [ticketInfo, setTicketInfo] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // Fetch contact statistics
    fetchContactStats();
  }, []);

  const fetchContactStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/contact/stats`);
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const contactReasons = [
    { value: 'general', label: 'General Inquiry', icon: <FaQuestionCircle />, description: 'General questions about our platform' },
    { value: 'technical', label: 'Technical Support', icon: <FaBug />, description: 'Technical issues or bug reports' },
    { value: 'billing', label: 'Billing & Payments', icon: <FaFileAlt />, description: 'Payment issues or billing questions' },
    { value: 'safety', label: 'Safety Report', icon: <FaShieldAlt />, description: 'Report safety concerns or abuse' },
    { value: 'suggestion', label: 'Feature Suggestion', icon: <FaLightbulb />, description: 'Suggest new features or improvements' },
    { value: 'complaint', label: 'Formal Complaint', icon: <FaExclamationTriangle />, description: 'File a formal complaint' },
    { value: 'partnership', label: 'Partnership Inquiry', icon: <FaHandshake />, description: 'Business or partnership opportunities' },
    { value: 'legal', label: 'Legal Inquiry', icon: <FaGavel />, description: 'Legal matters or copyright issues' },
    { value: 'press', label: 'Press & Media', icon: <FaNewspaper />, description: 'Media inquiries or press requests' },
    { value: 'careers', label: 'Careers', icon: <FaBriefcase />, description: 'Job opportunities or career questions' }
  ];

  const priorityLevels = [
    { value: 'low', label: 'Low Priority', color: 'bg-green-500', response: '48 hours' },
    { value: 'normal', label: 'Normal Priority', color: 'bg-blue-500', response: '24 hours' },
    { value: 'high', label: 'High Priority', color: 'bg-yellow-500', response: '12 hours' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-500', response: '2 hours' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'message') {
      setCharacterCount(value.length);
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Please enter your name');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Please enter your email address');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.contactReason) {
      setError('Please select a reason for contacting us');
      return false;
    }
    if (!formData.subject.trim()) {
      setError('Please enter a subject');
      return false;
    }
    if (!formData.message.trim()) {
      setError('Please enter your message');
      return false;
    }
    if (formData.message.length < 20) {
      setError('Message must be at least 20 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setTicketInfo(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send message');
      }

      if (data.success) {
        setIsSuccess(true);
        setTicketInfo(data.data);
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          contactReason: '',
          subject: '',
          message: '',
          priority: 'normal'
        });
        setCharacterCount(0);
        
        // Fetch updated stats
        fetchContactStats();
        
        // Auto-hide success message after 10 seconds
        setTimeout(() => {
          setIsSuccess(false);
          setTicketInfo(null);
        }, 10000);
      } else {
        setError(data.message || 'Failed to send message');
      }
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.message || 'Failed to send message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateSubjectSuggestions = () => {
    const reason = contactReasons.find(r => r.value === formData.contactReason);
    if (!reason) return [];
    
    const baseSuggestions = {
      general: ['General Inquiry', 'Question About Service', 'Need Information'],
      technical: ['Technical Issue', 'Bug Report', 'Feature Not Working'],
      billing: ['Billing Question', 'Payment Issue', 'Refund Request'],
      safety: ['Safety Concern', 'User Report', 'Abuse Report'],
      suggestion: ['Feature Suggestion', 'Improvement Idea', 'Feedback'],
      complaint: ['Formal Complaint', 'Service Complaint', 'Issue Report'],
      partnership: ['Partnership Inquiry', 'Business Proposal', 'Collaboration'],
      legal: ['Legal Inquiry', 'Copyright Issue', 'DMCA Request'],
      press: ['Media Inquiry', 'Press Request', 'Interview Request'],
      careers: ['Job Application', 'Career Inquiry', 'Recruitment']
    };

    return baseSuggestions[formData.contactReason] || [];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                <FaEnvelope className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Omegle Pro
                </h1>
                <p className="text-xs text-gray-400">Contact & Support</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-green-400">
                <FaClock />
                <span className="text-sm">24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/20 to-blue-900/20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 mb-6">
              <FaHeadset className="text-white text-3xl" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Contact Us
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-6">
              We're Here to Help You 24/7
            </p>
            <div className="inline-flex flex-wrap justify-center gap-4">
              <div className="px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-900 rounded-full border border-gray-700 flex items-center space-x-2">
                <FaClock className="text-green-400" />
                <span>24-Hour Response Time</span>
              </div>
              <div className="px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-900 rounded-full border border-gray-700 flex items-center space-x-2">
                <FaShieldAlt className="text-yellow-400" />
                <span>Secure Communication</span>
              </div>
              <div className="px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-900 rounded-full border border-gray-700 flex items-center space-x-2">
                <FaUsers className="text-purple-400" />
                <span>Dedicated Support Team</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Information Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            {/* Support Statistics */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <FaChartLine className="mr-2 text-cyan-400" />
                Support Statistics
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Response Time</span>
                  <span className="text-green-400 font-bold">
                    {stats?.averageResponseTime || '2.4 hours'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Satisfaction Rate</span>
                  <span className="text-yellow-400 font-bold">
                    {stats?.satisfactionRate || '96.7%'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Issues Resolved</span>
                  <span className="text-blue-400 font-bold">
                    {stats?.ticketsResolved || '98.2%'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Support Staff</span>
                  <span className="text-purple-400 font-bold">
                    {stats?.supportStaffOnline || '24/7'}
                  </span>
                </div>
              </div>
            </div>

            {/* Success Ticket Info */}
            {ticketInfo && (
              <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-2xl p-6 border border-green-500/30">
                <div className="flex items-center space-x-3 mb-4">
                  <FaCheckCircle className="text-green-400 text-2xl" />
                  <div>
                    <h4 className="font-bold text-green-300">Ticket Created!</h4>
                    <p className="text-sm text-gray-300">Your support ticket has been created</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Ticket Number</span>
                    <span className="font-mono font-bold text-yellow-400">
                      {ticketInfo.ticketNumber}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Estimated Response</span>
                    <span className="text-blue-400 font-bold">
                      {ticketInfo.estimatedResponse}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Confirmation Sent To</span>
                    <span className="text-cyan-400 text-sm truncate max-w-[150px]">
                      {formData.email}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Response Time Guarantee */}
            <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-2xl p-6 border border-green-500/30">
              <div className="flex items-center space-x-3 mb-4">
                <FaClock className="text-green-400 text-2xl" />
                <div>
                  <h4 className="font-bold text-green-300">Response Time Guarantee</h4>
                  <p className="text-sm text-gray-300">We respond within SLA timeframes</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Urgent Issues</span>
                  <span className="text-red-400 text-sm">2 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">High Priority</span>
                  <span className="text-yellow-400 text-sm">12 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Normal Priority</span>
                  <span className="text-blue-400 text-sm">24 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Low Priority</span>
                  <span className="text-green-400 text-sm">48 hours</span>
                </div>
              </div>
            </div>

            {/* Direct Contact Methods */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <FaEnvelope className="mr-2 text-blue-400" />
                Direct Contact
              </h3>
              <div className="space-y-4">
                <a href="mailto:support@omeglepro.com" className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors group">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                    <FaEnvelope className="text-white" />
                  </div>
                  <div>
                    <div className="font-medium">Primary Support</div>
                    <div className="text-sm text-gray-400 group-hover:text-blue-400">support@omeglepro.com</div>
                  </div>
                </a>
                
                <a href="mailto:emergency@omeglepro.com" className="flex items-center space-x-3 p-3 bg-red-900/20 rounded-lg hover:bg-red-900/30 transition-colors group border border-red-500/30">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center">
                    <FaExclamationTriangle className="text-white" />
                  </div>
                  <div>
                    <div className="font-medium">Emergency Safety</div>
                    <div className="text-sm text-gray-400 group-hover:text-red-400">emergency@omeglepro.com</div>
                    <div className="text-xs text-red-400">Immediate Response</div>
                  </div>
                </a>

                <a href="mailto:legal@omeglepro.com" className="flex items-center space-x-3 p-3 bg-purple-900/20 rounded-lg hover:bg-purple-900/30 transition-colors group border border-purple-500/30">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <FaGavel className="text-white" />
                  </div>
                  <div>
                    <div className="font-medium">Legal Department</div>
                    <div className="text-sm text-gray-400 group-hover:text-purple-400">legal@omeglepro.com</div>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 md:p-8 border border-gray-700">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                  <FaPaperPlane className="text-white text-xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Send Us a Message</h2>
                  <p className="text-gray-400">We'll get back to you within 24 hours</p>
                </div>
              </div>

              {/* Success Message */}
              {isSuccess && ticketInfo && (
                <div className="mb-6 p-4 bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-xl border border-green-500/50">
                  <div className="flex items-center space-x-3">
                    <FaCheckCircle className="text-green-400 text-2xl" />
                    <div>
                      <h4 className="font-bold text-green-300">Message Sent Successfully!</h4>
                      <p className="text-sm text-gray-300">
                        Thank you for contacting us. We've received your message and will respond 
                        within <strong>{ticketInfo.estimatedResponse}</strong>.
                        A confirmation email has been sent to <strong>{formData.email}</strong>.
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        Ticket Number: <span className="font-mono text-yellow-400">{ticketInfo.ticketNumber}</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-gradient-to-r from-red-900/30 to-pink-900/30 rounded-xl border border-red-500/50">
                  <div className="flex items-center space-x-3">
                    <FaExclamationTriangle className="text-red-400 text-2xl" />
                    <div>
                      <h4 className="font-bold text-red-300">Error Sending Message</h4>
                      <p className="text-sm text-gray-300">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name and Email */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <div className="flex items-center space-x-2">
                        <FaUser className="text-gray-400" />
                        <span>Your Name *</span>
                      </div>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="Enter your full name"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <div className="flex items-center space-x-2">
                        <FaEnvelope className="text-gray-400" />
                        <span>Email Address *</span>
                      </div>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="you@example.com"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Contact Reason */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <div className="flex items-center space-x-2">
                      <FaComment className="text-gray-400" />
                      <span>Reason for Contact *</span>
                    </div>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {contactReasons.map((reason) => (
                      <button
                        key={reason.value}
                        type="button"
                        onClick={() => !isSubmitting && setFormData(prev => ({ ...prev, contactReason: reason.value }))}
                        disabled={isSubmitting}
                        className={`p-3 rounded-lg border transition-all text-center ${
                          formData.contactReason === reason.value
                            ? 'border-cyan-500 bg-cyan-500/20'
                            : 'border-gray-700 bg-gray-800/50 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'
                        }`}
                      >
                        <div className="flex flex-col items-center">
                          <div className={`mb-2 ${
                            formData.contactReason === reason.value ? 'text-cyan-400' : 'text-gray-400'
                          }`}>
                            {reason.icon}
                          </div>
                          <span className="text-xs font-medium">{reason.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  {formData.contactReason && (
                    <p className="text-xs text-gray-400 mt-2">
                      {contactReasons.find(r => r.value === formData.contactReason)?.description}
                    </p>
                  )}
                </div>

                {/* Priority Level */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <div className="flex items-center space-x-2">
                      <FaStar className="text-yellow-400" />
                      <span>Priority Level</span>
                    </div>
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {priorityLevels.map((level) => (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => !isSubmitting && setFormData(prev => ({ ...prev, priority: level.value }))}
                        disabled={isSubmitting}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all ${
                          formData.priority === level.value
                            ? `${level.color} border-transparent text-white`
                            : 'border-gray-700 bg-gray-800/50 hover:bg-gray-700 text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed'
                        }`}
                      >
                        <div className={`w-3 h-3 rounded-full ${
                          formData.priority === level.value ? 'bg-white' : level.color
                        }`}></div>
                        <span className="text-sm">{level.label}</span>
                        <span className="text-xs opacity-75">({level.response})</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Select urgency level. Higher priority gets faster response.
                  </p>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <div className="flex items-center space-x-2">
                      <FaFileAlt className="text-gray-400" />
                      <span>Subject *</span>
                    </div>
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Brief summary of your inquiry"
                    required
                    disabled={isSubmitting}
                  />
                  {formData.contactReason && formData.subject.length < 5 && !isSubmitting && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-400 mb-1">Suggested subjects:</p>
                      <div className="flex flex-wrap gap-2">
                        {generateSubjectSuggestions().map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, subject: suggestion }))}
                            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-full text-xs transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <div className="flex items-center space-x-2 justify-between">
                      <div className="flex items-center space-x-2">
                        <FaComment className="text-gray-400" />
                        <span>Your Message *</span>
                      </div>
                      <span className={`text-xs ${
                        characterCount < 20 ? 'text-red-400' : 
                        characterCount > 1000 ? 'text-yellow-400' : 
                        'text-gray-400'
                      }`}>
                        {characterCount}/1000 characters
                      </span>
                    </div>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={8}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                    placeholder="Please provide detailed information about your inquiry..."
                    required
                    maxLength={1000}
                    disabled={isSubmitting}
                  />
                  <div className="flex justify-between mt-2">
                    <p className="text-xs text-gray-400">
                      Minimum 20 characters. Be as detailed as possible for better assistance.
                    </p>
                    <div className={`text-xs ${
                      characterCount < 20 ? 'text-red-400' : 'text-green-400'
                    }`}>
                      {characterCount >= 20 ? '✓ Meets minimum length' : 'Minimum 20 characters required'}
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center space-x-2 ${
                      isSubmitting
                        ? 'bg-gray-700 cursor-not-allowed'
                        : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 hover:shadow-lg'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <FaPaperPlane />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                  
                  <p className="text-xs text-gray-500 text-center mt-3">
                    By submitting, you agree to our Privacy Policy and Terms of Service.
                    <br />
                    You'll receive a confirmation email at {formData.email || 'your email address'}.
                  </p>
                </div>
              </form>
            </div>

            {/* Additional Information */}
            <div className="mt-8 grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-2xl p-6 border border-purple-500/30">
                <div className="flex items-center space-x-3 mb-4">
                  <FaShieldAlt className="text-purple-400 text-2xl" />
                  <div>
                    <h4 className="font-bold text-purple-300">Privacy Guarantee</h4>
                    <p className="text-sm text-gray-300">Your information is encrypted and secure</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <FaCheckCircle className="text-green-400 mr-2" />
                    <span>End-to-end encryption</span>
                  </li>
                  <li className="flex items-center">
                    <FaCheckCircle className="text-green-400 mr-2" />
                    <span>No data sharing with third parties</span>
                  </li>
                  <li className="flex items-center">
                    <FaCheckCircle className="text-green-400 mr-2" />
                    <span>GDPR & DPDP Act compliant</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 rounded-2xl p-6 border border-yellow-500/30">
                <div className="flex items-center space-x-3 mb-4">
                  <FaHeart className="text-yellow-400 text-2xl" />
                  <div>
                    <h4 className="font-bold text-yellow-300">We Value Your Feedback</h4>
                    <p className="text-sm text-gray-300">Help us improve our platform</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Suggestion Implemented</span>
                    <span className="text-green-400 font-bold">42%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">User Satisfaction</span>
                    <span className="text-yellow-400 font-bold">96%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Monthly Tickets</span>
                    <span className="text-blue-400 font-bold">
                      {stats?.monthlyVolume || '12,847+'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 md:p-8 border border-gray-700">
          <h3 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 bg-gray-800/50 rounded-xl">
                <h4 className="font-bold mb-2">How long does it take to get a response?</h4>
                <p className="text-sm text-gray-300">
                  We guarantee a response within 24 hours for normal priority inquiries. 
                  Urgent safety issues are addressed within 2 hours.
                </p>
              </div>
              <div className="p-4 bg-gray-800/50 rounded-xl">
                <h4 className="font-bold mb-2">Can I follow up on my inquiry?</h4>
                <p className="text-sm text-gray-300">
                  Yes, simply reply to the confirmation email you receive, and it will 
                  be added to your existing ticket for faster processing.
                </p>
              </div>
              <div className="p-4 bg-gray-800/50 rounded-xl">
                <h4 className="font-bold mb-2">Is my information secure?</h4>
                <p className="text-sm text-gray-300">
                  All communications are encrypted end-to-end. We never share your 
                  personal information with third parties without your consent.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-gray-800/50 rounded-xl">
                <h4 className="font-bold mb-2">What information should I include?</h4>
                <p className="text-sm text-gray-300">
                  Please include relevant details: username, date/time of issue, 
                  screenshots if applicable, and a clear description of your concern.
                </p>
              </div>
              <div className="p-4 bg-gray-800/50 rounded-xl">
                <h4 className="font-bold mb-2">Can I request a callback?</h4>
                <p className="text-sm text-gray-300">
                  Currently, we provide support via email only for security and 
                  documentation purposes. All communications are recorded for quality assurance.
                </p>
              </div>
              <div className="p-4 bg-gray-800/50 rounded-xl">
                <h4 className="font-bold mb-2">How are suggestions handled?</h4>
                <p className="text-sm text-gray-300">
                  All suggestions are reviewed by our product team. Popular requests 
                  are prioritized for development. You'll receive updates if your 
                  suggestion is implemented.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
              <div className="mb-4 md:mb-0">
                <h3 className="font-bold text-lg">Omegle Pro Support</h3>
                <p className="text-sm text-gray-400">Always Here to Help</p>
              </div>
              <div className="flex space-x-4">
                <a href="mailto:support@omeglepro.com" className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg hover:opacity-90 transition-all">
                  Email Support
                </a>
                <a href="#" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                  Visit Help Center
                </a>
              </div>
            </div>
            
            <div className="text-xs text-gray-500 space-y-2">
              <p>© 2026 Omegle Pro Support Center. Average response time: {stats?.averageResponseTime || '2.4 hours'}.</p>
              <p>For emergencies requiring immediate attention, email emergency@omeglepro.com</p>
              <p className="text-cyan-400">
                ⚡ Your satisfaction is our priority. We're committed to resolving your concerns promptly.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Help Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <a
          href="mailto:support@omeglepro.com"
          className="flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          <FaHeadset className="text-white" />
          <span className="font-medium">Quick Help</span>
        </a>
      </div>
    </div>
  );
};

export default ContactUs;