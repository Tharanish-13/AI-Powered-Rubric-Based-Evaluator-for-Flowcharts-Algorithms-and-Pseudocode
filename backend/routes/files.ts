import express from 'express';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Serve uploaded files
router.get('/:submissionId/:filename', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { submissionId, filename } = req.params;

    // Find submission
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

    const filePath = path.join(process.cwd(), submission.filePath);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Set appropriate headers
    res.setHeader('Content-Type', submission.fileType);
    res.setHeader('Content-Disposition', `inline; filename="${submission.fileName}"`);

    // Send file
    res.sendFile(filePath);
  } catch (error) {
    console.error('Serve file error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete file
router.delete('/:submissionId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { submissionId } = req.params;

    // Find submission
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: true
      }
    });

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Check permissions (only the student or teacher can delete)
    if (req.user?.role === 'STUDENT' && submission.studentId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    } else if (req.user?.role === 'TEACHER' && submission.assignment.teacherId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const filePath = path.join(process.cwd(), submission.filePath);

    // Delete file from filesystem
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete submission from database
    await prisma.submission.delete({
      where: { id: submissionId }
    });

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;