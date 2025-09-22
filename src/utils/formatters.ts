export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatScore = (score: number | null | undefined): string => {
  if (score === null || score === undefined) return 'N/A';
  return `${Math.round(score)}%`;
};

export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'submitted':
      return 'bg-blue-100 text-blue-800';
    case 'processing':
      return 'bg-yellow-100 text-yellow-800';
    case 'assessed':
      return 'bg-green-100 text-green-800';
    case 'graded':
      return 'bg-purple-100 text-purple-800';
    case 'returned':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getScoreColor = (score: number | null | undefined): string => {
  if (score === null || score === undefined) return 'text-gray-500';
  
  if (score >= 90) return 'text-green-600';
  if (score >= 80) return 'text-blue-600';
  if (score >= 70) return 'text-yellow-600';
  if (score >= 60) return 'text-orange-600';
  return 'text-red-600';
};

export const formatUserRole = (role: string): string => {
  switch (role.toLowerCase()) {
    case 'student':
      return 'Student';
    case 'teacher':
      return 'Teacher';
    case 'admin':
      return 'Administrator';
    default:
      return role;
  }
};

export const formatFullName = (firstName?: string, lastName?: string): string => {
  if (!firstName && !lastName) return 'Unknown User';
  return `${firstName || ''} ${lastName || ''}`.trim();
};