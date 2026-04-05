import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { File } from '../models/File.js';

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    let fileContent;
    try {
      fileContent = fs.readFileSync(req.file.path, 'utf8');
    } catch (readError) {
      return res.status(400).json({ success: false, message: 'Failed to read file: ' + readError.message });
    }

    // Parse CSV with lenient settings
    const parsed = Papa.parse(fileContent, {
      header: true,
      dynamicTyping: false, // Keep as strings first
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
    });

    // Check for critical parse errors (not warnings)
    const criticalErrors = (parsed.errors || []).filter(
      (err) => err.type === 'Delimiter' || err.type === 'FieldMismatch'
    );

    if (criticalErrors.length > 0 && parsed.data.length === 0) {
      console.error('CSV Parse Errors:', parsed.errors);
      return res.status(400).json({
        success: false,
        message: 'Invalid CSV format: ' + (criticalErrors[0]?.message || 'Unknown error'),
      });
    }

    const columns = parsed.meta.fields || [];
    
    // Convert numeric fields after parsing
    const data = parsed.data.map((row) => {
      const processedRow = {};
      for (const key in row) {
        const value = row[key];
        // Try to convert to number if it looks like a number
        if (value !== null && value !== '' && !isNaN(value) && !isNaN(parseFloat(value))) {
          processedRow[key] = parseFloat(value);
        } else {
          processedRow[key] = value;
        }
      }
      return processedRow;
    }).filter((row) => Object.values(row).some((val) => val !== null && val !== ''));

    const file = new File({
      name: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
      path: req.file.path,
      columns,
      data,
      userId: req.user._id,
    });

    await file.save();

    // Clean up uploaded file after saving to database
    try {
      fs.unlinkSync(req.file.path);
    } catch (error) {
      console.log('Warning: Could not delete temporary file:', error.message);
    }

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        _id: file._id,
        originalName: file.originalName,
        size: file.size,
        columns,
        rowCount: data.length,
        uploadedAt: file.uploadedAt,
      },
    });
  } catch (error) {
    // Clean up file on error
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFiles = async (req, res) => {
  try {
    const files = await File.find({ userId: req.user._id }).select('-data').sort({ createdAt: -1 });

    res.json({
      success: true,
      files: files.map((file) => ({
        _id: file._id,
        originalName: file.originalName,
        size: file.size,
        columns: file.columns,
        rowCount: file.data.length,
        uploadedAt: file.uploadedAt,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFile = async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.id, userId: req.user._id });

    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    res.json({
      success: true,
      file: {
        _id: file._id,
        originalName: file.originalName,
        columns: file.columns,
        data: file.data,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteFile = async (req, res) => {
  try {
    const file = await File.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    // Delete file from storage
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    res.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
