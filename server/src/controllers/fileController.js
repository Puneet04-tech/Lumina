import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import JSON5 from 'json5';
import pdf from 'pdf-parse';

import { File } from '../models/File.js';
import { checkConnection } from '../config/database.js';
import { memoryStore } from '../config/memoryStore.js';

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const ext = path.extname(req.file.originalname).toLowerCase();
    let data = [];
    let columns = [];

    try {
      if (ext === '.csv') {
        const fileContent = fs.readFileSync(req.file.path, 'utf8');
        const parsed = Papa.parse(fileContent, {
          header: true,
          dynamicTyping: false,
          skipEmptyLines: true,
          transformHeader: (h) => h.trim(),
        });

        const criticalErrors = (parsed.errors || []).filter(
          (err) => err.type === 'Delimiter' || err.type === 'FieldMismatch'
        );

        if (criticalErrors.length > 0 && parsed.data.length === 0) {
          throw new Error('Invalid CSV format: ' + (criticalErrors[0]?.message || 'Unknown error'));
        }

        columns = parsed.meta.fields || [];
        data = parsed.data;
      } else if (ext === '.xlsx' || ext === '.xls') {
        const workbook = XLSX.readFile(req.file.path);
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON with headers
        data = XLSX.utils.sheet_to_json(worksheet, {
          defval: null,
          raw: false // Use formatted strings for better consistency
        });

        if (data.length > 0) {
          columns = Object.keys(data[0]);
        }
      } else if (ext === '.json') {
        const fileContent = fs.readFileSync(req.file.path, 'utf8');
        const jsonData = JSON5.parse(fileContent);
        
        if (Array.isArray(jsonData)) {
          data = jsonData;
        } else if (jsonData && typeof jsonData === 'object') {
          // If it's a single object, wrap it in an array or look for a data property
          if (jsonData.data && Array.isArray(jsonData.data)) {
            data = jsonData.data;
          } else {
            data = [jsonData];
          }
        } else {
          throw new Error('Invalid JSON structure: Expected an array or object containing data');
        }

        if (data.length > 0) {
          columns = Object.keys(data[0]);
        }
      } else if (ext === '.pdf') {
        const dataBuffer = fs.readFileSync(req.file.path);
        const result = await (pdf.default || pdf)(dataBuffer);
        
        // Simpler PDF extraction: Split text into lines and look for data-like rows
        const textLines = result.text.split('\n').filter(line => line.trim().length > 0);
        
        if (textLines.length > 0) {
          data = textLines.map((line, index) => ({
            id: index + 1,
            Line: index + 1,
            Content: line.trim()
          }));
          columns = ['Line', 'Content'];
        } else {
          throw new Error('No readable text found in PDF');
        }
      } else {
        throw new Error('Unsupported file format');
      }
    } catch (parseError) {
      console.error('File Parse Error:', parseError);
      return res.status(400).json({ 
        success: false, 
        message: 'Failed to process file: ' + parseError.message 
      });
    }

    // Convert numeric fields after parsing
    const processedData = data.map((row) => {
      const processedRow = {};
      for (const key in row) {
        const value = row[key];
        // Try to convert to number if it looks like a number
        if (value !== null && value !== undefined && value !== '' && !isNaN(value) && !isNaN(parseFloat(value))) {
          processedRow[key] = parseFloat(value);
        } else {
          processedRow[key] = value;
        }
      }
      return processedRow;
    }).filter((row) => Object.values(row).some((val) => val !== null && val !== undefined && val !== ''));

    const fileData = {
      name: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
      path: req.file.path,
      columns,
      data: processedData,
      rowCount: processedData.length,
      userId: req.user?._id || 'dev-user-1',
    };

    let file;
    let fileId;

    if (checkConnection()) {
      // Use MongoDB
      file = new File(fileData);
      await file.save();
      fileId = file._id;
    } else {
      // Use in-memory store (offline mode)
      file = memoryStore.createFile(fileData);
      fileId = file._id;
      console.log('💾 File stored in memory (offline mode):', fileId);
    }

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
        _id: fileId,
        originalName: file.originalName,
        size: file.size,
        columns,
        rowCount: processedData.length,
        uploadedAt: file.createdAt || new Date(),
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
    const userId = req.user?._id || 'dev-user-1';
    let files;

    if (checkConnection()) {
      files = await File.find({ userId }).select('-data').sort({ createdAt: -1 });
    } else {
      files = memoryStore.getFilesByUser(userId);
    }

    res.json({
      success: true,
      files: files.map((file) => ({
        _id: file._id,
        originalName: file.originalName,
        size: file.size,
        columns: file.columns,
        rowCount: file.rowCount || 0,
        uploadedAt: file.uploadedAt || file.createdAt || new Date(),
      })),
    });
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFile = async (req, res) => {
  try {
    const userId = req.user?._id || 'dev-user-1';
    let file;

    if (checkConnection()) {
      file = await File.findOne({ _id: req.params.id, userId });
    } else {
      file = memoryStore.getFileById(req.params.id);
    }

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
    const fileId = req.params.id;
    let file;
    let deleted = false;

    if (checkConnection()) {
      file = await File.findOneAndDelete({ _id: fileId, userId: req.user._id });
      deleted = !!file;
    } else {
      file = memoryStore.getFileById(fileId);
      if (file) {
        deleted = memoryStore.deleteFile(fileId);
      }
    }

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    // Delete file from storage
    if (file?.path && fs.existsSync(file.path)) {
      try {
        fs.unlinkSync(file.path);
      } catch (e) {
        console.log('Warning: Could not delete file:', e.message);
      }
    }

    res.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
