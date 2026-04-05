import { Document, Packer, Table, TableRow, TableCell, Paragraph, TextRun } from 'docx';
import { writeFile } from 'fs/promises';
import { File } from '../models/File.js';

/**
 * Export data as PDF
 */
export const exportPDF = async (req, res) => {
  try {
    const { fileId } = req.body;

    const file = await File.findOne({ _id: fileId, userId: req.user._id });
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    // For PDF generation, we'll return a response that the frontend can handle
    res.json({
      success: true,
      message: 'PDF export initiated. Use frontend exportToPDF utility.',
      file: {
        name: file.originalName,
        data: file.data,
        columns: file.columns,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Export data as Excel
 */
export const exportExcel = async (req, res) => {
  try {
    const { fileId } = req.body;

    const file = await File.findOne({ _id: fileId, userId: req.user._id });
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    // For Excel generation, return data for frontend to process
    res.json({
      success: true,
      message: 'Excel export data prepared',
      file: {
        name: file.originalName,
        data: file.data,
        columns: file.columns,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Export dashboard as PDF
 */
export const exportDashboardPDF = async (req, res) => {
  try {
    const { dashboardId } = req.body;
    const { Dashboard } = await import('../models/Dashboard.js');

    const dashboard = await Dashboard.findOne({
      _id: dashboardId,
      userId: req.user._id,
    });

    if (!dashboard) {
      return res.status(404).json({ success: false, message: 'Dashboard not found' });
    }

    res.json({
      success: true,
      dashboard: {
        name: dashboard.name,
        insights: dashboard.insights,
        charts: dashboard.charts,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
