import api from '../lib/api';

export const gdprService = {
  // Audit Logs
  getAuditLogs: async (page = 1, limit = 50, filters = {}) => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString(), ...filters });
    const response = await api.get(`/gdpr/audit-logs?${params}`);
    return response.data;
  },

  getAuditLogStats: async () => {
    const response = await api.get('/gdpr/audit-logs/stats');
    return response.data;
  },

  // Data Export
  requestDataExport: async (exportType = 'full', format = 'json', includeData = {}) => {
    const response = await api.post('/gdpr/export-data', { exportType, format, includeData });
    return response.data;
  },

  getDataExports: async () => {
    const response = await api.get('/gdpr/exports');
    return response.data;
  },

  downloadDataExport: async (exportId: string) => {
    try {
      const response = await api.get(`/gdpr/download-export/${exportId}`, {
        responseType: 'blob'
      });
      
      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = `data_export_${Date.now()}`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error: any) {
      console.error('Download error:', error);
      throw new Error(error.response?.data?.message || 'Failed to download export');
    }
  },

  // Account Deletion
  requestAccountDeletion: async (data: {
    reason: string;
    reasonDetails?: string;
    feedback?: string;
    dataBackupRequested?: boolean;
    deletionType?: 'soft' | 'hard';
  }) => {
    const response = await api.post('/gdpr/delete-account', data);
    return response.data;
  },

  cancelAccountDeletion: async (cancellationReason: string) => {
    const response = await api.post('/gdpr/cancel-deletion', { cancellationReason });
    return response.data;
  },

  getDeletionStatus: async () => {
    const response = await api.get('/gdpr/deletion-status');
    return response.data;
  },

  // GDPR Compliance
  getCompliance: async () => {
    const response = await api.get('/gdpr/compliance');
    return response.data;
  },

  updateConsent: async (consents: {
    marketingEmails?: boolean;
    dataSharing?: boolean;
    profileVisibility?: string;
  }) => {
    const response = await api.put('/gdpr/consent', consents);
    return response.data;
  }
};
