import mongoose from 'mongoose';

const DashboardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'File',
      required: true,
    },
    charts: [
      {
        type: {
          type: String,
          enum: ['bar', 'line', 'pie', 'area', 'scatter', 'heatmap'],
        },
        title: String,
        config: {
          xAxis: String,
          yAxis: String,
          metric: String,
        },
        data: Array,
      },
    ],
    insights: {
      type: String,
      default: '',
    },
    layout: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    accessLevel: {
      type: String,
      enum: ['private', 'shared', 'public'],
      default: 'private',
    },
    sharedWith: [
      {
        userId: mongoose.Schema.Types.ObjectId,
        role: String,
      },
    ],
  },
  { timestamps: true }
);

export const Dashboard = mongoose.model('Dashboard', DashboardSchema);
