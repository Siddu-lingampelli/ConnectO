import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, XCircle, Clock, AlertTriangle, FileText } from 'lucide-react';
import { verificationService } from '../../services/verificationService';

interface BackgroundCheck {
  status: 'not_requested' | 'in_progress' | 'completed' | 'failed';
  requestedAt?: string;
  completedAt?: string;
  provider?: string;
  reportUrl?: string;
  notes?: string;
  checks?: {
    criminalRecord?: 'clear' | 'pending' | 'flagged';
    employmentHistory?: 'verified' | 'pending' | 'discrepancy';
    educationHistory?: 'verified' | 'pending' | 'discrepancy';
    referenceCheck?: 'positive' | 'pending' | 'negative';
  };
}

const BackgroundCheckStatus: React.FC = () => {
  const [checkData, setCheckData] = useState<BackgroundCheck | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBackgroundCheckData();
  }, []);

  const loadBackgroundCheckData = async () => {
    try {
      const response = await verificationService.getVerificationOverview();
      setCheckData(response.data.backgroundCheck);
    } catch (error) {
      console.error('Failed to load background check data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-8 h-8 text-green-600" />;
      case 'in_progress':
        return <Clock className="w-8 h-8 text-yellow-600 animate-pulse" />;
      case 'failed':
        return <XCircle className="w-8 h-8 text-red-600" />;
      default:
        return <AlertTriangle className="w-8 h-8 text-gray-400" />;
    }
  };

  const getCheckIcon = (status: string) => {
    switch (status) {
      case 'clear':
      case 'verified':
      case 'positive':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'flagged':
      case 'discrepancy':
      case 'negative':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getCheckLabel = (key: string) => {
    const labels: Record<string, string> = {
      criminalRecord: 'Criminal Record Check',
      employmentHistory: 'Employment History Verification',
      educationHistory: 'Education History Verification',
      referenceCheck: 'Reference Check'
    };
    return labels[key] || key;
  };

  const getCheckStatusText = (status: string) => {
    const texts: Record<string, string> = {
      clear: 'Clear',
      verified: 'Verified',
      positive: 'Positive',
      pending: 'In Progress',
      flagged: 'Flagged',
      discrepancy: 'Discrepancy Found',
      negative: 'Negative'
    };
    return texts[status] || status;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!checkData || checkData.status === 'not_requested') {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-6 h-6 text-gray-400" />
          <h2 className="text-2xl font-bold text-gray-900">Background Check</h2>
        </div>

        <div className="text-center py-12">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No Background Check Initiated
          </h3>
          <p className="text-gray-500 mb-6">
            Background checks are conducted by our admin team for enhanced verification
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-sm text-blue-800">
              💡 Background checks help build trust with clients and may be required for certain types of services
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-emerald-600" />
          <h2 className="text-2xl font-bold text-gray-900">Background Check</h2>
        </div>
        {getStatusIcon(checkData.status)}
      </div>

      {/* Overall Status */}
      <div className={`mb-6 p-4 rounded-lg border-2 ${
        checkData.status === 'completed' ? 'bg-green-50 border-green-200' :
        checkData.status === 'in_progress' ? 'bg-yellow-50 border-yellow-200' :
        checkData.status === 'failed' ? 'bg-red-50 border-red-200' :
        'bg-gray-50 border-gray-200'
      }`}>
        <h3 className="font-semibold text-gray-900 mb-2">
          Status: {checkData.status === 'completed' ? 'Completed' : 
                   checkData.status === 'in_progress' ? 'In Progress' : 
                   checkData.status === 'failed' ? 'Failed' : 'Not Started'}
        </h3>
        
        <div className="space-y-1 text-sm text-gray-600">
          {checkData.requestedAt && (
            <p>Requested: {new Date(checkData.requestedAt).toLocaleDateString()}</p>
          )}
          {checkData.completedAt && (
            <p>Completed: {new Date(checkData.completedAt).toLocaleDateString()}</p>
          )}
          {checkData.provider && (
            <p>Provider: {checkData.provider}</p>
          )}
        </div>
      </div>

      {/* Individual Checks */}
      {checkData.checks && Object.keys(checkData.checks).length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Check Details</h3>
          <div className="space-y-3">
            {Object.entries(checkData.checks).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center gap-3">
                  {getCheckIcon(value)}
                  <div>
                    <h4 className="font-medium text-gray-900">{getCheckLabel(key)}</h4>
                    <p className="text-sm text-gray-500">{getCheckStatusText(value)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Report URL */}
      {checkData.reportUrl && (
        <div className="mb-6">
          <a
            href={checkData.reportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 border-2 border-emerald-200 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
          >
            <FileText className="w-6 h-6 text-emerald-600" />
            <div>
              <h4 className="font-semibold text-emerald-900">View Full Report</h4>
              <p className="text-sm text-emerald-700">Download detailed background check report</p>
            </div>
          </a>
        </div>
      )}

      {/* Admin Notes */}
      {checkData.notes && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-2">Notes</h4>
          <p className="text-gray-700 text-sm whitespace-pre-wrap">{checkData.notes}</p>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">About Background Checks</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>✓ Conducted by trusted third-party verification services</li>
          <li>✓ All information is kept confidential and secure</li>
          <li>✓ Helps build trust with potential clients</li>
          <li>✓ May be required for certain high-value projects</li>
        </ul>
      </div>
    </div>
  );
};

export default BackgroundCheckStatus;
