import { Router } from 'express';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { authorize } from '../../shared/middleware/authorize.middleware';
import { Role } from '@prisma/client';
import { prisma } from '../../config/database';

const router = Router();

router.use(authenticate);

// Get all hostels
router.get('/', async (req, res) => {
  try {
    const hostels = await prisma.hostel.findMany({
      include: {
        _count: {
          select: {
            users: true,
            blocks: true,
            issues: true,
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.json({
      success: true,
      data: hostels
    });
  } catch (error) {
    console.error('Error fetching hostels:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch hostels',
        details: error.message
      }
    });
  }
});

// Get hostel by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const hostel = await prisma.hostel.findUnique({
      where: { id },
      include: {
        blocks: {
          orderBy: {
            name: 'asc'
          }
        },
        _count: {
          select: {
            users: true,
            issues: true,
          }
        }
      }
    });

    if (!hostel) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Hostel not found'
        }
      });
    }

    res.json({
      success: true,
      data: hostel
    });
  } catch (error) {
    console.error('Error fetching hostel:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch hostel',
        details: error.message
      }
    });
  }
});

// Get blocks for a specific hostel
router.get('/:id/blocks', async (req, res) => {
  try {
    const { id } = req.params;

    // Verify hostel exists
    const hostel = await prisma.hostel.findUnique({
      where: { id }
    });

    if (!hostel) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Hostel not found'
        }
      });
    }

    const blocks = await prisma.block.findMany({
      where: { hostelId: id },
      orderBy: {
        name: 'asc'
      },
      include: {
        _count: {
          select: {
            users: true,
            issues: true,
          }
        }
      }
    });

    res.json({
      success: true,
      data: blocks
    });
  } catch (error) {
    console.error('Error fetching blocks:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch blocks',
        details: error.message
      }
    });
  }
});

export default router;