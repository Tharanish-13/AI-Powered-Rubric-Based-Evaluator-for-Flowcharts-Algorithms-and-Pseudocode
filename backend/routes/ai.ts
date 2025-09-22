import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { processSubmission, getProcessingStatus } from '../services/aiService';

const router = express.Router();
const prisma = new PrismaClient();

// Process submission with AI
router.post('/assess', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { submissionId } = req.body;

    if (!submissionId) {
      return res.status(400).json({ error: 'Submission ID is required' });
    }

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: true
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

    // Start AI processing
    const result = await processSubmission(submissionId);

    res.json({ 
      message: 'AI assessment started',
      processingId: result.processingId
    });
  } catch (error) {
    console.error('AI assess error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get AI processing status
router.get('/status/:submissionId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const submission = await prisma.submission.findUnique({
      where: { id: req.params.submissionId },
      include: {
        assignment: true,
        assessments: {
          orderBy: { createdAt: 'desc' },
          take: 1
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

    const status = await getProcessingStatus(submission.id);

    res.json({
      status: submission.status,
      assessment: submission.assessments[0] || null,
      processing: status
    });
  } catch (error) {
    console.error('Get AI status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reprocess submission
router.post('/reprocess', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { submissionId } = req.body;

    if (!submissionId) {
      return res.status(400).json({ error: 'Submission ID is required' });
    }

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: true
      }
    });

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Check permissions (only teachers and admins can reprocess)
    if (req.user?.role === 'STUDENT') {
      return res.status(403).json({ error: 'Access denied' });
    } else if (req.user?.role === 'TEACHER' && submission.assignment.teacherId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update submission status
    await prisma.submission.update({
      where: { id: submissionId },
      data: { status: 'PROCESSING' }
    });

    // Start reprocessing
    const result = await processSubmission(submissionId);

    res.json({ 
      message: 'AI reprocessing started',
      processingId: result.processingId
    });
  } catch (error) {
    console.error('AI reprocess error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;