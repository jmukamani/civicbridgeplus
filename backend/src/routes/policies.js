const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const policyController = require('../controllers/policyController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/policies/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'text/plain'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and text files are allowed.'));
    }
  },
});

// Public routes
router.get('/', policyController.getAllPolicies);
router.get('/:id', policyController.getPolicyById);

// Protected routes
router.post('/', 
  authenticateToken, 
  authorizeRoles('admin', 'representative'),
  upload.single('document'),
  policyController.createPolicy
);

router.put('/:id', 
  authenticateToken, 
  authorizeRoles('admin', 'representative'),
  policyController.updatePolicy
);

router.delete('/:id', 
  authenticateToken, 
  authorizeRoles('admin'),
  policyController.deletePolicy
);

module.exports = router;