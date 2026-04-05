import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { File } from '../models/File.js';

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const fileContent = fs.readFileSync(req.file.path, 'utf8');
    const parsed = Papa.parse(fileContent, { header: true, dynamicTyping: true });

    if (parsed.errors.length > 0) {
      return res.status(400).json({ success: false, message: 'Invalid CSV file' });
    }

    const columns = parsed.meta.fields || [];
    const data = parsed.data.filter((row) => Object.values(row).some((val) => val !== null && val !== ''));

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
