import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  FileText, 
  Award, 
  Clock, 
  TrendingUp,
  Upload,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../utils/api';
import { Assignment, Submission } from '../../types';
import { formatDate, formatScore, getStatusColor } from '../../utils/formatters';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [recentSubmissions, setRecentSubmissions] = useState<Submission[]>([]);
  const [stats, setStats] = useState({
    pendingAssignments: 0,
    completedAssignments: 0,
    averageScore: 0,
    totalSubmissions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [assignmentsData, submissionsData] = await Promise.all([
          api.get<Assignment[]>('/assignments'),
          api.get<Submission[]>('/submissions')
        ]);

        setAssignments(assignmentsData);
        setRecentSubmissions(submissionsData.slice(0, 5));

        // Calculate stats
        const now = new Date();
        const pending = assignmentsData.filter(a => new Date(a.dueDate) > now);
        const completed = submissionsData.filter(s => s.status === 'GRADED' || s.status === 'ASSESSED');
        
        const totalScore = completed.reduce((sum, submission) => {
          const assessment = submission.assessments?.[0];
          return sum + (assessment?.finalScore || assessment?.aiScore || 0);
        }, 0);
        
        const avgScore = completed.length > 0 ? totalScore / completed.length : 0;

        setStats({
          pendingAssignments: pending.length,
          completedAssignments: completed.length,
          averageScore: avgScore,
          totalSubmissions: submissionsData.length
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const upcomingDeadlines = assignments
    .filter(a => new Date(a.dueDate) > new Date())
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-blue-100">
          Track your assignments, view grades, and monitor your academic progress.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-blue-50 border-blue-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.pendingAssignments}</p>
              <p className="text-sm text-gray-600">Pending Assignments</p>
            </div>
          </div>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <Award className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.completedAssignments}</p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
          </div>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{formatScore(stats.averageScore)}</p>
              <p className="text-sm text-gray-600">Average Score</p>
            </div>
          </div>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <BookOpen className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.totalSubmissions}</p>
              <p className="text-sm text-gray-600">Total Submissions</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Submissions */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Submissions</h2>
            <Link 
              to="/student/assignments"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          
          <div className="space-y-4">
            {recentSubmissions.length > 0 ? (
              recentSubmissions.map((submission) => (
                <div key={submission.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {submission.assignment?.title || 'Assignment'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Submitted {formatDate(submission.submittedAt)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                      {submission.status}
                    </span>
                    {submission.assessments && submission.assessments.length > 0 && (
                      <span className="text-sm font-medium text-gray-900">
                        {formatScore(submission.assessments[0].finalScore || submission.assessments[0].aiScore)}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No submissions yet</p>
                <Button variant="outline" size="sm" className="mt-2" asChild>
                  <Link to="/student/assignments">View Assignments</Link>
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Upcoming Deadlines</h2>
            <Link 
              to="/student/assignments"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          
          <div className="space-y-4">
            {upcomingDeadlines.length > 0 ? (
              upcomingDeadlines.map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <div>
                      <h3 className="font-medium text-gray-900">{assignment.title}</h3>
                      <p className="text-sm text-gray-500">
                        Due {formatDate(assignment.dueDate)}
                      </p>
                    </div>
                  </div>
                  <Link 
                    to={`/student/submit/${assignment.id}`}
                    className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Submit
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No upcoming deadlines</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" fullWidth asChild>
            <Link to="/student/assignments" className="flex items-center justify-center">
              <FileText className="h-5 w-5 mr-2" />
              View Assignments
            </Link>
          </Button>
          <Button variant="outline" fullWidth asChild>
            <Link to="/student/grades" className="flex items-center justify-center">
              <Award className="h-5 w-5 mr-2" />
              Check Grades
            </Link>
          </Button>
          <Button variant="primary" fullWidth asChild>
            <Link to="/student/assignments" className="flex items-center justify-center">
              <Upload className="h-5 w-5 mr-2" />
              Submit Assignment
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
};