import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Search,
  Filter,
  Calendar,
  User
} from 'lucide-react';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { api } from '../../utils/api';
import { Assignment, Submission } from '../../types';
import { formatDate, formatDateTime, getStatusColor } from '../../utils/formatters';

export const StudentAssignments: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assignmentsData, submissionsData] = await Promise.all([
          api.get<Assignment[]>('/assignments'),
          api.get<Submission[]>('/submissions')
        ]);

        setAssignments(assignmentsData);
        setSubmissions(submissionsData);
      } catch (error) {
        console.error('Failed to fetch assignments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = assignments.filter(assignment => {
      const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           assignment.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;

      const now = new Date();
      const dueDate = new Date(assignment.dueDate);
      const hasSubmission = submissions.some(s => s.assignmentId === assignment.id);

      switch (filterStatus) {
        case 'pending':
          return !hasSubmission && dueDate > now;
        case 'completed':
          return hasSubmission;
        case 'overdue':
          return !hasSubmission && dueDate < now;
        default:
          return true;
      }
    });

    setFilteredAssignments(filtered);
  }, [assignments, submissions, searchTerm, filterStatus]);

  const getAssignmentStatus = (assignment: Assignment) => {
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    const hasSubmission = submissions.some(s => s.assignmentId === assignment.id);

    if (hasSubmission) return 'completed';
    if (dueDate < now) return 'overdue';
    return 'pending';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'overdue':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Submitted';
      case 'overdue':
        return 'Overdue';
      default:
        return 'Pending';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">Assignments</h1>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search assignments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Assignments</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Assignment List */}
      <div className="grid grid-cols-1 gap-6">
        {filteredAssignments.length > 0 ? (
          filteredAssignments.map((assignment) => {
            const status = getAssignmentStatus(assignment);
            const submission = submissions.find(s => s.assignmentId === assignment.id);
            
            return (
              <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <FileText className="h-6 w-6 text-blue-600" />
                      <h3 className="text-xl font-semibold text-gray-900">
                        {assignment.title}
                      </h3>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(status)}
                        <span className={`text-sm font-medium ${
                          status === 'completed' ? 'text-green-600' :
                          status === 'overdue' ? 'text-red-600' : 'text-yellow-600'
                        }`}>
                          {getStatusText(status)}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {assignment.description}
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>Due: {formatDateTime(assignment.dueDate)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>
                          {assignment.teacher 
                            ? `${assignment.teacher.firstName} ${assignment.teacher.lastName}`
                            : 'Unknown'
                          }
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4" />
                        <span>Formats: {assignment.fileFormats.join(', ')}</span>
                      </div>
                      {assignment.class && (
                        <div className="flex items-center space-x-2">
                          <span>Class: {assignment.class.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-6 flex flex-col space-y-2">
                    {status === 'completed' ? (
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/student/submission/${submission?.id}`}>
                          View Results
                        </Link>
                      </Button>
                    ) : status === 'overdue' ? (
                      <Button variant="danger" size="sm" disabled>
                        Overdue
                      </Button>
                    ) : (
                      <Button variant="primary" size="sm" asChild>
                        <Link to={`/student/submit/${assignment.id}`}>
                          Submit
                        </Link>
                      </Button>
                    )}
                    
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/student/assignments/${assignment.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <Card>
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No assignments found
              </h3>
              <p className="text-gray-500">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No assignments have been created yet.'
                }
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};