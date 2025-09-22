import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest, requireTeacherOrAdmin } from '../middleware/auth';
import { z } from 'zod';

const router = express.Router();
const prisma = new PrismaClient();

const createClassSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  studentIds: z.array(z.string()).default([])
});

// Get classes
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    let whereCondition: any = {};

    if (req.user?.role === 'STUDENT') {
      whereCondition = {
        students: { some: { id: req.user.id } }
      };
    } else if (req.user?.role === 'TEACHER') {
      whereCondition = { teacherId: req.user.id };
    }

    const classes = await prisma.class.findMany({
      where: whereCondition,
      include: {
        teacher: {
          select: { firstName: true, lastName: true }
        },
        students: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        assignments: {
          select: { id: true, title: true, dueDate: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(classes);
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get class by ID
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const classData = await prisma.class.findUnique({
      where: { id: req.params.id },
      include: {
        teacher: {
          select: { firstName: true, lastName: true }
        },
        students: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        assignments: {
          include: {
            _count: {
              select: { submissions: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    // Check permissions
    if (req.user?.role === 'STUDENT') {
      const hasAccess = classData.students.some(s => s.id === req.user?.id);
      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied' });
      }
    } else if (req.user?.role === 'TEACHER' && classData.teacherId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(classData);
  } catch (error) {
    console.error('Get class error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create class
router.post('/', authenticateToken, requireTeacherOrAdmin, async (req: AuthRequest, res) => {
  try {
    const classData = createClassSchema.parse(req.body);

    const newClass = await prisma.class.create({
      data: {
        name: classData.name,
        description: classData.description,
        teacherId: req.user!.id,
        students: {
          connect: classData.studentIds.map(id => ({ id }))
        }
      },
      include: {
        teacher: {
          select: { firstName: true, lastName: true }
        },
        students: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });

    res.status(201).json(newClass);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Create class error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update class
router.put('/:id', authenticateToken, requireTeacherOrAdmin, async (req: AuthRequest, res) => {
  try {
    const classData = createClassSchema.partial().parse(req.body);

    const existingClass = await prisma.class.findUnique({
      where: { id: req.params.id }
    });

    if (!existingClass) {
      return res.status(404).json({ error: 'Class not found' });
    }

    // Check ownership
    if (req.user?.role === 'TEACHER' && existingClass.teacherId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updatedClass = await prisma.class.update({
      where: { id: req.params.id },
      data: {
        ...(classData.name && { name: classData.name }),
        ...(classData.description !== undefined && { description: classData.description }),
        ...(classData.studentIds && {
          students: {
            set: classData.studentIds.map(id => ({ id }))
          }
        })
      },
      include: {
        teacher: {
          select: { firstName: true, lastName: true }
        },
        students: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });

    res.json(updatedClass);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Update class error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete class
router.delete('/:id', authenticateToken, requireTeacherOrAdmin, async (req: AuthRequest, res) => {
  try {
    const existingClass = await prisma.class.findUnique({
      where: { id: req.params.id }
    });

    if (!existingClass) {
      return res.status(404).json({ error: 'Class not found' });
    }

    // Check ownership
    if (req.user?.role === 'TEACHER' && existingClass.teacherId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.class.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    console.error('Delete class error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;