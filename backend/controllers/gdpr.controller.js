import AuditLog from '../models/AuditLog.js';
import DataExport from '../models/DataExport.js';
import AccountDeletion from '../models/AccountDeletion.js';
import User from '../models/User.model.js';
import Job from '../models/Job.model.js';
import Message from '../models/Message.model.js';
import Order from '../models/Order.model.js';
import { Payment } from '../models/Payment.model.js';
import Review from '../models/Review.model.js';
import Proposal from '../models/Proposal.model.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==================== AUDIT LOG FUNCTIONS ====================

export const createAuditLog = async (userId, action, description, req, metadata = {}, severity = 'info', status = 'success') => {
  try {
    const auditLog = new AuditLog({
      userId,
      action,
      description,
      ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.get('user-agent') || 'unknown',
      metadata,
      severity,
      status
    });

    await auditLog.save();
    return auditLog;
  } catch (error) {
    console.error('Error creating audit log:', error);
    // Don't throw error - audit logging should not break main functionality
    return null;
  }
};

export const getAuditLogs = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 50, action, severity, startDate, endDate } = req.query;

    const query = { userId };

    if (action) query.action = action;
    if (severity) query.severity = severity;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const count = await AuditLog.countDocuments(query);

    res.json({
      logs,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalLogs: count
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ message: 'Error fetching audit logs' });
  }
};

export const getAuditLogStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const [totalLogs, recentLogins, criticalEvents, last30Days] = await Promise.all([
      AuditLog.countDocuments({ userId }),
      AuditLog.countDocuments({ 
        userId, 
        action: 'login',
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }),
      AuditLog.countDocuments({ userId, severity: 'critical' }),
      AuditLog.countDocuments({
        userId,
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      })
    ]);

    const actionBreakdown = await AuditLog.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      totalLogs,
      recentLogins,
      criticalEvents,
      last30Days,
      actionBreakdown
    });
  } catch (error) {
    console.error('Error fetching audit log stats:', error);
    res.status(500).json({ message: 'Error fetching audit log statistics' });
  }
};

// ==================== DATA EXPORT FUNCTIONS ====================

export const requestDataExport = async (req, res) => {
  try {
    const userId = req.user.id;
    const { exportType = 'full', format = 'json', includeData, reason } = req.body;

    // Check for existing pending/processing exports
    const existingExport = await DataExport.findOne({
      userId,
      status: { $in: ['pending', 'processing'] }
    });

    if (existingExport) {
      return res.status(400).json({ 
        message: 'You already have a pending data export request',
        exportId: existingExport._id
      });
    }

    const dataExport = new DataExport({
      userId,
      exportType,
      format,
      includeData: includeData || {},
      metadata: {
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        reason
      }
    });

    await dataExport.save();

    // Log the request
    await createAuditLog(
      userId,
      'data_export_request',
      `Data export requested (${exportType} - ${format})`,
      req,
      { exportId: dataExport._id }
    );

    // Start processing in background
    processDataExport(dataExport._id).catch(err => 
      console.error('Error processing data export:', err)
    );

    res.json({
      message: 'Data export request submitted successfully',
      exportId: dataExport._id,
      estimatedTime: '5-15 minutes'
    });
  } catch (error) {
    console.error('Error requesting data export:', error);
    res.status(500).json({ message: 'Error requesting data export' });
  }
};

async function processDataExport(exportId) {
  try {
    const dataExport = await DataExport.findById(exportId).populate('userId');
    if (!dataExport) return;

    dataExport.status = 'processing';
    await dataExport.save();

    const user = dataExport.userId;
    const exportData = {};

    // Collect all user data
    if (dataExport.includeData.profile) {
      exportData.profile = {
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        activeRole: user.activeRole,
        skills: user.skills,
        bio: user.bio,
        location: user.location,
        providerType: user.providerType,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
    }

    if (dataExport.includeData.jobs) {
      const jobs = await Job.find({ client: user._id }).lean();
      exportData.jobs = jobs;
    }

    if (dataExport.includeData.proposals) {
      const proposals = await Proposal.find({ provider: user._id }).lean();
      exportData.proposals = proposals;
    }

    if (dataExport.includeData.orders) {
      const orders = await Order.find({
        $or: [{ client: user._id }, { provider: user._id }]
      }).lean();
      exportData.orders = orders;
    }

    if (dataExport.includeData.messages) {
      const messages = await Message.find({
        $or: [{ sender: user._id }, { receiver: user._id }]
      }).lean();
      exportData.messages = messages;
    }

    if (dataExport.includeData.reviews) {
      const reviews = await Review.find({
        $or: [{ reviewer: user._id }, { provider: user._id }]
      }).lean();
      exportData.reviews = reviews;
    }

    if (dataExport.includeData.payments) {
      const payments = await Payment.find({
        $or: [{ client: user._id }, { provider: user._id }]
      }).lean();
      exportData.payments = payments;
    }

    if (dataExport.includeData.auditLogs) {
      const auditLogs = await AuditLog.find({ userId: user._id }).lean();
      exportData.auditLogs = auditLogs;
    }

    // Create export file
    const exportDir = path.join(__dirname, '../exports');
    await fs.mkdir(exportDir, { recursive: true });

    const filename = `user_data_${user._id}_${Date.now()}.${dataExport.format}`;
    const filepath = path.join(exportDir, filename);

    if (dataExport.format === 'json') {
      await fs.writeFile(filepath, JSON.stringify(exportData, null, 2));
    } else if (dataExport.format === 'csv') {
      // Convert to CSV (simplified)
      const csv = convertToCSV(exportData);
      await fs.writeFile(filepath, csv);
    }

    const stats = await fs.stat(filepath);

    dataExport.status = 'completed';
    dataExport.fileUrl = `/api/gdpr/download-export/${dataExport._id}`;
    dataExport.filename = filename;
    dataExport.fileSize = stats.size;
    dataExport.completedDate = new Date();
    await dataExport.save();

  } catch (error) {
    console.error('Error processing data export:', error);
    const dataExport = await DataExport.findById(exportId);
    if (dataExport) {
      dataExport.status = 'failed';
      dataExport.errorMessage = error.message;
      await dataExport.save();
    }
  }
}

function convertToCSV(data) {
  // Simplified CSV conversion
  let csv = '';
  for (const [key, value] of Object.entries(data)) {
    csv += `\n\n=== ${key.toUpperCase()} ===\n`;
    if (Array.isArray(value) && value.length > 0) {
      const headers = Object.keys(value[0]);
      csv += headers.join(',') + '\n';
      value.forEach(item => {
        csv += headers.map(h => JSON.stringify(item[h] || '')).join(',') + '\n';
      });
    } else {
      csv += JSON.stringify(value, null, 2) + '\n';
    }
  }
  return csv;
}

export const getDataExports = async (req, res) => {
  try {
    const userId = req.user.id;

    const exports = await DataExport.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ exports });
  } catch (error) {
    console.error('Error fetching data exports:', error);
    res.status(500).json({ message: 'Error fetching data exports' });
  }
};

export const downloadDataExport = async (req, res) => {
  try {
    const { exportId } = req.params;
    const userId = req.user.id;

    const dataExport = await DataExport.findOne({ _id: exportId, userId });
    
    if (!dataExport) {
      return res.status(404).json({ message: 'Export not found' });
    }

    if (dataExport.status !== 'completed') {
      return res.status(400).json({ message: 'Export is not ready for download' });
    }

    if (new Date() > dataExport.expiryDate) {
      return res.status(410).json({ message: 'Export has expired' });
    }

    // Use the stored filename or fallback to generated name
    const filename = dataExport.filename || `user_data_${userId}_${dataExport.createdAt.getTime()}.${dataExport.format}`;
    const filepath = path.join(__dirname, '../exports', filename);

    // Check if file exists
    try {
      await fs.access(filepath);
    } catch (error) {
      console.error('Export file not found:', filepath);
      return res.status(404).json({ message: 'Export file not found. Please request a new export.' });
    }

    // Update download count
    dataExport.downloadCount += 1;
    dataExport.lastDownloadDate = new Date();
    await dataExport.save();

    // Log the download
    await createAuditLog(
      userId,
      'data_export_download',
      `Data export downloaded (${dataExport.exportType})`,
      req,
      { exportId: dataExport._id }
    );

    // Set proper headers and send file
    res.setHeader('Content-Type', dataExport.format === 'json' ? 'application/json' : 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    const fileStream = await fs.readFile(filepath);
    res.send(fileStream);
  } catch (error) {
    console.error('Error downloading data export:', error);
    res.status(500).json({ message: 'Error downloading data export' });
  }
};

// ==================== ACCOUNT DELETION FUNCTIONS ====================

export const requestAccountDeletion = async (req, res) => {
  try {
    const userId = req.user.id;
    const { reason, reasonDetails, feedback, dataBackupRequested, deletionType = 'soft' } = req.body;

    if (!reason) {
      return res.status(400).json({ message: 'Deletion reason is required' });
    }

    // Check for existing pending deletion
    const existingDeletion = await AccountDeletion.findOne({
      userId,
      status: { $in: ['pending', 'scheduled'] }
    });

    if (existingDeletion) {
      return res.status(400).json({ 
        message: 'You already have a pending account deletion request',
        deletionId: existingDeletion._id,
        scheduledDate: existingDeletion.scheduledDate
      });
    }

    // Check for active orders
    const activeOrders = await Order.countDocuments({
      $or: [{ client: userId }, { provider: userId }],
      status: { $in: ['pending', 'in_progress'] }
    });

    if (activeOrders > 0 && deletionType === 'hard') {
      return res.status(400).json({ 
        message: 'Cannot delete account with active orders. Please complete or cancel them first.',
        activeOrders
      });
    }

    const user = await User.findById(userId);
    const accountAge = Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24));

    const deletion = new AccountDeletion({
      userId,
      reason,
      reasonDetails,
      feedback,
      dataBackupRequested,
      deletionType,
      metadata: {
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        hasActiveOrders: activeOrders > 0,
        lastLoginDate: user.lastLogin,
        accountAge
      }
    });

    await deletion.save();

    // Update user status
    user.accountStatus = 'pending_deletion';
    user.deletionScheduledDate = deletion.scheduledDate;
    await user.save();

    // Create data backup if requested
    if (dataBackupRequested) {
      const dataExport = new DataExport({
        userId,
        exportType: 'full',
        format: 'json',
        metadata: {
          reason: 'Account deletion backup',
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('user-agent')
        }
      });
      await dataExport.save();
      processDataExport(dataExport._id).catch(err => 
        console.error('Error processing backup:', err)
      );
      deletion.dataBackupUrl = `/api/gdpr/download-export/${dataExport._id}`;
      await deletion.save();
    }

    // Log the request
    await createAuditLog(
      userId,
      'account_deletion_request',
      `Account deletion requested (${reason})`,
      req,
      { deletionId: deletion._id, deletionType },
      'critical'
    );

    res.json({
      message: 'Account deletion request submitted successfully',
      deletionId: deletion._id,
      scheduledDate: deletion.scheduledDate,
      gracePeriod: '30 days',
      dataBackupUrl: deletion.dataBackupUrl
    });
  } catch (error) {
    console.error('Error requesting account deletion:', error);
    res.status(500).json({ message: 'Error requesting account deletion' });
  }
};

export const cancelAccountDeletion = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cancellationReason } = req.body;

    const deletion = await AccountDeletion.findOne({
      userId,
      status: { $in: ['pending', 'scheduled'] }
    });

    if (!deletion) {
      return res.status(404).json({ message: 'No pending deletion request found' });
    }

    deletion.status = 'cancelled';
    deletion.cancelledDate = new Date();
    deletion.cancellationReason = cancellationReason || 'User cancelled';
    await deletion.save();

    // Update user status
    const user = await User.findById(userId);
    user.accountStatus = 'active';
    user.deletionScheduledDate = null;
    await user.save();

    // Log the cancellation
    await createAuditLog(
      userId,
      'account_deletion_cancelled',
      'Account deletion request cancelled',
      req,
      { deletionId: deletion._id },
      'info'
    );

    res.json({
      message: 'Account deletion request cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling account deletion:', error);
    res.status(500).json({ message: 'Error cancelling account deletion' });
  }
};

export const getAccountDeletionStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const deletion = await AccountDeletion.findOne({
      userId,
      status: { $in: ['pending', 'scheduled'] }
    }).lean();

    res.json({ deletion });
  } catch (error) {
    console.error('Error fetching deletion status:', error);
    res.status(500).json({ message: 'Error fetching deletion status' });
  }
};

// Process scheduled deletions (run as cron job)
export const processScheduledDeletions = async () => {
  try {
    const deletions = await AccountDeletion.find({
      status: 'scheduled',
      scheduledDate: { $lte: new Date() }
    }).populate('userId');

    for (const deletion of deletions) {
      try {
        deletion.status = 'processing';
        await deletion.save();

        const userId = deletion.userId._id;

        if (deletion.deletionType === 'hard') {
          // Hard delete - remove all data
          await Promise.all([
            Job.deleteMany({ client: userId }),
            Proposal.deleteMany({ provider: userId }),
            Order.updateMany(
              { $or: [{ client: userId }, { provider: userId }] },
              { $set: { client: null, provider: null } }
            ),
            Message.deleteMany({ $or: [{ sender: userId }, { receiver: userId }] }),
            Review.deleteMany({ $or: [{ reviewer: userId }, { provider: userId }] }),
            Payment.updateMany(
              { $or: [{ client: userId }, { provider: userId }] },
              { $set: { client: null, provider: null } }
            ),
            AuditLog.deleteMany({ userId }),
            DataExport.deleteMany({ userId }),
            User.findByIdAndDelete(userId)
          ]);
        } else {
          // Soft delete - anonymize data
          const user = await User.findById(userId);
          user.name = `Deleted User ${userId}`;
          user.email = `deleted_${userId}@deleted.com`;
          user.phone = null;
          user.bio = null;
          user.skills = [];
          user.profilePicture = null;
          user.accountStatus = 'deleted';
          user.deletedAt = new Date();
          await user.save();
        }

        deletion.status = 'completed';
        deletion.completedDate = new Date();
        await deletion.save();

      } catch (error) {
        console.error('Error processing deletion:', deletion._id, error);
        deletion.status = 'failed';
        await deletion.save();
      }
    }

    console.log(`Processed ${deletions.length} account deletions`);
  } catch (error) {
    console.error('Error processing scheduled deletions:', error);
  }
};

// ==================== GDPR COMPLIANCE TOOLS ====================

export const getGDPRCompliance = async (req, res) => {
  try {
    const userId = req.user.id;

    const [user, auditLogCount, dataExports, accountDeletion] = await Promise.all([
      User.findById(userId),
      AuditLog.countDocuments({ userId }),
      DataExport.find({ userId }).sort({ createdAt: -1 }).limit(5),
      AccountDeletion.findOne({ userId, status: { $in: ['pending', 'scheduled'] } })
    ]);

    const compliance = {
      dataPortability: {
        available: true,
        lastExport: dataExports[0] || null,
        totalExports: dataExports.length
      },
      rightToErasure: {
        available: !accountDeletion,
        pendingDeletion: accountDeletion || null
      },
      auditTrail: {
        available: true,
        totalLogs: auditLogCount
      },
      dataAccess: {
        profileData: true,
        activityLogs: true,
        messageData: true,
        transactionData: true
      },
      consentManagement: {
        marketingEmails: user.preferences?.marketingEmails || false,
        dataSharing: user.preferences?.dataSharing || false,
        profileVisibility: user.preferences?.profileVisibility || 'public'
      }
    };

    res.json({ compliance });
  } catch (error) {
    console.error('Error fetching GDPR compliance:', error);
    res.status(500).json({ message: 'Error fetching GDPR compliance data' });
  }
};

export const updateConsent = async (req, res) => {
  try {
    const userId = req.user.id;
    const { marketingEmails, dataSharing, profileVisibility } = req.body;

    const user = await User.findById(userId);
    
    if (!user.preferences) {
      user.preferences = {};
    }

    if (marketingEmails !== undefined) user.preferences.marketingEmails = marketingEmails;
    if (dataSharing !== undefined) user.preferences.dataSharing = dataSharing;
    if (profileVisibility !== undefined) user.preferences.profileVisibility = profileVisibility;

    await user.save();

    // Log consent update
    await createAuditLog(
      userId,
      'gdpr_consent_update',
      'GDPR consent preferences updated',
      req,
      { marketingEmails, dataSharing, profileVisibility }
    );

    res.json({
      message: 'Consent preferences updated successfully',
      preferences: user.preferences
    });
  } catch (error) {
    console.error('Error updating consent:', error);
    res.status(500).json({ message: 'Error updating consent preferences' });
  }
};
