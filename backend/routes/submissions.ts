import express from 'express';
import multer from 'multer';
import path from 'path';
import { PrismaClient, SubmissionStatus } from '@prisma/client';
import { authenticateToken, AuthRequest, requireTeacherOrAdmin } from '../middleware/auth';
import { processSubmission } from '../services/aiService';

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: 'uploads/submissions/',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${req.user?.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.docx', '.pptx', '.png', '.jpg', '.jpeg'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Get submissions
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { assignmentId, status } = req.query;
    
    let whereCondition: any = {};

    if (req.user?.role === 'STUDENT') {
      whereCondition.studentId = req.user.id;
    } else if (req.user?.role === 'TEACHER') {
      // Teachers see submissions for their assignments
      whereCondition.assignment = {
        teacherId: req.user.id
      };
    }

    if (assignmentId) {
      whereCondition.assignmentId = assignmentId as string;
    }

    if (status) {
      whereCondition.status = status as SubmissionStatus;
    }

    const submissions = await prisma.submission.findMany({
      where: whereCondition,
      include: {
        assignment: {
          select: { title: true, dueDate: true }
        },
        student: {
          select: { firstName: true, lastName: true, email: true }
        },
        assessments: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { submittedAt: 'desc' }
    });

    res.json(submissions);
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get submission by ID
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const submission = await prisma.submission.findUnique({
      where: { id: req.params.id },
      include: {
        assignment: {
          include: {
            teacher: {
              select: { firstName: true, lastName: true }
            }
          }
        },
        student: {
          select: { firstName: true, lastName: true, email: true }
        },
        assessments: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Check permissions
    if (req.user?.role === 'STUDENT' && submission.studentId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    } else if (req.user?.role === 'TEACHER' && submission.assignment.teacherId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(submission);
  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Submit assignment
router.post('/', authenticateToken, upload.single('file'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'File is required' });
    }

    const { assignmentId } = req.body;

    if (!assignmentId) {
      return res.status(400).json({ error: 'Assignment ID is required' });
    }

    // Verify assignment exists and student has access
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        class: {
          select: { students: true }
        }
      }
    });

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Check if student has access to this assignment
    if (req.user?.role === 'STUDENT') {
      const hasAccess = assignment.classId === null || 
        assignment.class?.students.some(s => s.id === req.user?.id);
      
      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    // Check if assignment is still open
    if (new Date() > assignment.dueDate) {
      return res.status(400).json({ error: 'Assignment deadline has passed' });
    }

    // Create submission
    const submission = await prisma.submission.create({
      data: {
        assignmentId,
        studentId: req.user!.id,
        fileName: req.file.originalname,
        filePath: req.file.path,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        status: SubmissionStatus.PROCESSING
      }
    });

    // Process with AI asynchronously
    processSubmission(submission.id).catch(error => {
      console.error('AI processing error:', error);
    });

    res.status(201).json(submission);
  } catch (error) {
    console.error('Submit assignment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Grade submission
router.put('/:id/grade', authenticateToken, requireTeacherOrAdmin, async (req: AuthRequest, res) => {
  try {
    const { teacherScore, feedback, rubricScores } = req.body;

    const submission = await prisma.submission.findUnique({
      where: { id: req.params.id },
      include: {
        assignment: true
      }
    });

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Check permissions
    if (req.user?.role === 'TEACHER' && submission.assignment.teacherId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update or create assessment
    const assessment = await prisma.assessment.upsert({
      where: { 
        submissionId: submission.id
      },
      update: {
        teacherScore,
        finalScore: teacherScore, // Teacher score overrides AI
        feedback,
        rubricScores,
        gradedAt: new Date()
      },
      create: {
        submissionId: submission.id,
        teacherScore,
        finalScore: teacherScore,
        feedback,
        rubricScores,
        gradedAt: new Date()
      }
    });

    // Update submission status
    await prisma.submission.update({
      where: { id: submission.id },
      data: { status: SubmissionStatus.GRADED }
    });

    res.json(assessment);
  } catch (error) {
    console.error('Grade submission error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;