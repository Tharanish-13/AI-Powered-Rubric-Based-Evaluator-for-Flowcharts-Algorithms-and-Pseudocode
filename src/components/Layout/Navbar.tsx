import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { 
  User, 
  LogOut, 
  Settings, 
  BookOpen,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import { formatFullName } from '../../utils/formatters';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavItems = () => {
    if (!user) return [];

    const baseItems = [
      { label: 'Dashboard', path: `/${user.role.toLowerCase()}/dashboard` },
    ];

    switch (user.role) {
      case 'STUDENT':
        return [
          ...baseItems,
          { label: 'Assignments', path: '/student/assignments' },
          { label: 'Grades', path: '/student/grades' },
        ];
      case 'TEACHER':
        return [
          ...baseItems,
          { label: 'Classes', path: '/teacher/classes' },
          { label: 'Assignments', path: '/teacher/assignments' },
          { label: 'Submissions', path: '/teacher/submissions' },
          { label: 'Analytics', path: '/teacher/analytics' },
        ];
      case 'ADMIN':
        return [
          ...baseItems,
          { label: 'Users', path: '/admin/users' },
          { label: 'System', path: '/admin/system' },
          { label: 'Analytics', path: '/admin/analytics' },
        ];
      default:
        return baseItems;
    }
  };

  if (!user) return null;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to={`/${user.role.toLowerCase()}/dashboard`} className="flex items-center space-x-3">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">EduAssess AI</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {getNavItems().map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="relative group">
              <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
                <User className="h-5 w-5" />
                <span className="hidden sm:block text-sm font-medium">
                  {formatFullName(user.firstName, user.lastName)}
                </span>
              </button>
              
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-1">
                  <Link
                    to={`/${user.role.toLowerCase()}/profile`}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Profile Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-gray-100"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-200">
              {getNavItems().map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};