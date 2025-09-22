export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  studentId?: string;
  institution?: string;
  subject?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
}

export type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN';

export interface Assignment {
  id: string;
  title: string;
  description: string;
  instructions?: string;
  dueDate: string;
  fileFormats: string[];
  maxFileSize: number;
  rubricConfig: RubricConfig;
  teacherId: string;
  classId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  teacher?: {
    firstName: string;
    lastName: string;
  };
  class?: {
    name: string;
  };
  _count?: {
    submissions: number;
  };
}

export interface RubricConfig {
  criteria: RubricCriterion[];
}

export interface RubricCriterion {
  name: string;
  description: string;
  weight: number;
  levels: RubricLevel[];
}

export interface RubricLevel {
  name: string;
  description: string;
  points: number;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  status: SubmissionStatus;
  submittedAt: string;
  updatedAt: string;
  assignment?: Assignment;
  student?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  assessments?: Assessment[];
}

export type SubmissionStatus = 'SUBMITTED' | 'PROCESSING' | 'ASSESSED' | 'GRADED' | 'RETURNED';

export interface Assessment {
  id: string;
  submissionId: string;
  aiScore?: number;
  teacherScore?: number;
  finalScore?: number;
  feedback?: AssessmentFeedback;
  rubricScores?: Record<string, number>;
  confidence?: number;
  aiProcessedAt?: string;
  gradedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentFeedback {
  overall: string;
  criteria: CriterionFeedback[];
}

export interface CriterionFeedback {
  name: string;
  feedback: string;
  suggestions: string;
}

export interface Class {
  id: string;
  name: string;
  description?: string;
  teacherId: string;
  createdAt: string;
  updatedAt: string;
  teacher?: {
    firstName: string;
    lastName: string;
  };
  students?: User[];
  assignments?: Assignment[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}