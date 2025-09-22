import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Brain, 
  Users, 
  Award, 
  Clock, 
  FileText,
  CheckCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Button } from '../components/UI/Button';

export const Landing: React.FC = () => {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Assessment',
      description: 'Advanced AI analyzes flowcharts, algorithms, and pseudocode with human-like understanding.'
    },
    {
      icon: FileText,
      title: 'Multi-Format Support',
      description: 'Support for PDF, DOCX, PPTX, PNG, and JPG files with intelligent content extraction.'
    },
    {
      icon: Clock,
      title: 'Instant Feedback',
      description: 'Get detailed feedback and scores within seconds, not days.'
    },
    {
      icon: Award,
      title: 'Rubric-Based Grading',
      description: 'Customizable rubrics ensure consistent and fair assessment across all submissions.'
    },
    {
      icon: Users,
      title: 'Role-Based Access',
      description: 'Tailored experiences for students, teachers, and administrators.'
    },
    {
      icon: Sparkles,
      title: 'Smart Analytics',
      description: 'Comprehensive insights into learning progress and performance trends.'
    }
  ];

  const benefits = {
    students: [
      'Instant feedback on assignments',
      'Detailed improvement suggestions',
      'Progress tracking and analytics',
      'Multiple submission formats'
    ],
    teachers: [
      'Automated grading saves time',
      'Consistent assessment standards',
      'Comprehensive class analytics',
      'Override AI scores when needed'
    ],
    institutions: [
      'Scalable assessment solution',
      'Improved learning outcomes',
      'Data-driven insights',
      'Cost-effective implementation'
    ]
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <nav className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-8 w-8 text-white" />
              <span className="text-xl font-bold text-white">EduAssess AI</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/login" 
                className="text-white hover:text-blue-200 transition-colors"
              >
                Sign In
              </Link>
              <Button variant="secondary" size="sm" asChild>
                <Link to="/register">Get Started</Link>
              </Button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 pt-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              AI-Powered Educational
              <span className="block text-blue-200">Assessment Platform</span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Revolutionary assessment tool that uses artificial intelligence to evaluate 
              flowcharts, algorithms, and pseudocode across multiple file formats. 
              Get instant, detailed feedback and accelerate learning outcomes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/register" className="flex items-center">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="#features">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Modern Education
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive platform combines cutting-edge AI technology with 
              intuitive design to transform how educational assessments are conducted.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <feature.icon className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Benefits for Everyone
            </h2>
            <p className="text-xl text-gray-600">
              Designed to enhance the educational experience for all stakeholders
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Students */}
            <div className="bg-blue-50 rounded-xl p-8">
              <div className="flex items-center mb-6">
                <Users className="h-8 w-8 text-blue-600 mr-3" />
                <h3 className="text-2xl font-bold text-gray-900">For Students</h3>
              </div>
              <ul className="space-y-3">
                {benefits.students.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Teachers */}
            <div className="bg-green-50 rounded-xl p-8">
              <div className="flex items-center mb-6">
                <Award className="h-8 w-8 text-green-600 mr-3" />
                <h3 className="text-2xl font-bold text-gray-900">For Teachers</h3>
              </div>
              <ul className="space-y-3">
                {benefits.teachers.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Institutions */}
            <div className="bg-purple-50 rounded-xl p-8">
              <div className="flex items-center mb-6">
                <BookOpen className="h-8 w-8 text-purple-600 mr-3" />
                <h3 className="text-2xl font-bold text-gray-900">For Institutions</h3>
              </div>
              <ul className="space-y-3">
                {benefits.institutions.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Educational Assessment?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of educators and students who are already experiencing 
            the future of AI-powered assessment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/register" className="flex items-center">
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <BookOpen className="h-6 w-6" />
              <span className="text-lg font-semibold">EduAssess AI</span>
            </div>
            <div className="text-sm text-gray-400">
              © 2024 EduAssess AI. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};