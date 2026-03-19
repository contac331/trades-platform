const express = require('express');
const { upload } = require('../middleware/upload');
const { protect, authorize } = require('../middleware/auth');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// @desc    Upload service images
// @route   POST /api/upload/services
// @access  Private (Tradesperson only)
router.post('/services', protect, authorize('tradesperson'), upload.array('images', 5), async (req, res) => {
  try {
    console.log('Upload request received');
    console.log('User:', req.user?.id, req.user?.role);
    console.log('Files:', req.files?.length || 0);
    
    if (!req.files || req.files.length === 0) {
      console.log('No files in request');
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    // Generate file URLs
    const imageUrls = req.files.map(file => {
      console.log('Processing file:', file.filename);
      return `/uploads/services/${file.filename}`;
    });

    console.log('Upload successful, returning URLs:', imageUrls);
    res.status(200).json({
      success: true,
      data: {
        images: imageUrls
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'File upload failed'
    });
  }
});

// @desc    Delete service image
// @route   DELETE /api/upload/services/:filename
// @access  Private (Tradesperson only)
router.delete('/services/:filename', protect, authorize('tradesperson'), async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../uploads/services', filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Delete file
    fs.unlinkSync(filePath);

    res.status(200).json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file'
    });
  }
});

// @desc    Upload general images (for profiles, etc.)
// @route   POST /api/upload
// @access  Private
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    console.log('General upload request received');
    console.log('User:', req.user?.id, req.user?.role);
    console.log('File:', req.file ? 'received' : 'none');
    
    if (!req.file) {
      console.log('No file in request');
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Generate file URL - put profile images in a profiles folder
    const imageUrl = `/uploads/profiles/${req.file.filename}`;
    console.log('Upload successful, returning URL:', imageUrl);

    res.status(200).json({
      success: true,
      imageUrl: imageUrl
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Upload failed'
    });
  }
});

module.exports = router;
