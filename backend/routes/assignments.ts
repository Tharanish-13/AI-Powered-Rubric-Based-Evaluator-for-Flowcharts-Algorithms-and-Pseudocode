import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest, requireTeacherOrAdmin } from '../middleware/auth';
import { z } from 'zod';

const router = express.Router();
const prisma = new PrismaClient();

const createAssignmentSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  instructions: z.string().optional(),
  dueDate: z.string().datetime(),
  fileFormats: z.array(z.string()).default(['pdf', 'docx', 'pptx', 'png', 'jpg']),
  maxFileSize: z.number().default(10485760),
  rubricConfig: z.object({
    criteria: z.array(z.object({
      name: z.string(),
      description: z.string(),
      weight: z.number(),
      levels: z.array(z.object({
        name: z.string(),
        description: z.string(),
        points: z.number()
      }))
    }))
  }),
  classId: z.string().optional()
});

// Get assignments
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { classId, status } = req.query;
    
    let whereCondition: any = {};

    if (req.user?.role === 'STUDENT') {
      // Students see assignments from their classes
      const userClasses = await prisma.class.findMany({
        where: { students: { some: { id: req.user.id } } },
        select: { id: true }
      });
      
      whereCondition = {
        OR: [
          { classId: { in: userClasses.map(c => c.id) } },
          { classId: null } // Public assignments
        ]
      };
    } else if (req.user?.role === 'TEACHER') {
      // Teachers see their own assignments
      whereCondition = { teacherId: req.user.id };
    }

    if (classId) {
      whereCondition.classId = classId as string;
    }

    const assignments = await prisma.assignment.findMany({
      where: whereCondition,
      include: {
        teacher: {
          select: { firstName: true, lastName: true }
        },
        class: {
          select: { name: true }
        },
        _count: {
          select: { submissions: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(assignments);
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get assignment by ID
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const assignment = await prisma.assignment.findUnique({
      where: { id: req.params.id },
      include: {
        teacher: {
          select: { firstName: true, lastName: true }
        },
        class: {
          select: { name: true, students: true }
        },
        submissions: {
          include: {
            student: {
              select: { firstName: true, lastName: true, email: true }
            },
            assessments: true
          }
        }
      }
    });

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Check permissions
    if (req.user?.role === 'STUDENT') {
      const hasAccess = assignment.classId === null || 
        assignment.class?.students.some(s => s.id === req.user?.id);
      
      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied' });
      }
    } else if (req.user?.role === 'TEACHER' && assignment.teacherId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(assignment);
  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create assignment
router.post('/', authenticateToken, requireTeacherOrAdmin, async (req: AuthRequest, res) => {
  try {
    const assignmentData = createAssignmentSchema.parse(req.body);

    const assignment = await prisma.assignment.create({
      data: {
        ...assignmentData,
        teacherId: req.user!.id,
        dueDate: new Date(assignmentData.dueDate)
      },
      include: {
        teacher: {
          select: { firstName: true, lastName: true }
        },
        class: {
          select: { name: true }
        }
      }
    });

    res.status(201).json(assignment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Create assignment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update assignment
router.put('/:id', authenticateToken, requireTeacherOrAdmin, async (req: AuthRequest, res) => {
  try {
    const assignmentData = createAssignmentSchema.partial().parse(req.body);

    const assignment = await prisma.assignment.findUnique({
      where: { id: req.params.id }
    });

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Check ownership
    if (req.user?.role === 'TEACHER' && assignment.teacherId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updatedAssignment = await prisma.assignment.update({
      where: { id: req.params.id },
      data: {
        ...assignmentData,
        ...(assignmentData.dueDate && { dueDate: new Date(assignmentData.dueDate) })
      },
      include: {
        teacher: {
          select: { firstName: true, lastName: true }
        },
        class: {
          select: { name: true }
        }
      }
    });

    res.json(updatedAssignment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Update assignment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete assignment
router.delete('/:id', authenticateToken, requireTeacherOrAdmin, async (req: AuthRequest, res) => {
  try {
    const assignment = await prisma.assignment.findUnique({
      where: { id: req.params.id }
    });

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Check ownership
    if (req.user?.role === 'TEACHER' && assignment.teacherId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.assignment.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;