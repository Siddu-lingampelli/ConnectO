import React, { useEffect, useState } from 'react';
import { Shield, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { verificationService } from '../../services/verificationService';

interface VerificationData {
  completionScore: number;
  idVerification: {
    status: string;
    idType?: string;
    submittedAt?: string;
    verifiedAt?: string;
    rejectionReason?: string;
  };
  backgroundCheck: {
    status: string;
    requestedAt?: string;
    completedAt?: string;
    checks?: any;
  };
  skillCertifications: any[];
  verifiedCertificationsCount: number;
}

const VerificationDashboard: React.FC = () => {
  const [data, setData] = useState<VerificationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await verificationService.getVerificationOverview();
      setData(response.data);
    } catch (err) {
      console.error('Failed to load verification data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'pending':
        return <Clock className="w-6 h-6 text-yellow-600" />;
      case 'rejected':
      case 'failed':
        return <XCircle className="w-6 h-6 text-red-600" />;
      default:
        return <AlertTriangle className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'rejected':
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  const getCompletionColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
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

  if (!data) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-emerald-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Verification Status</h2>
            <p className="text-gray-600 text-sm">Build trust with verified credentials</p>
          </div>
        </div>
      </div>

      {/* Completion Score */}
      <div className="mb-6 p-6 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-700 font-medium">Profile Completion</span>
          <span className={`text-3xl font-bold ${getCompletionColor(data.completionScore)}`}>
            {data.completionScore}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              data.completionScore >= 80 ? 'bg-green-600' :
              data.completionScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${data.completionScore}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          {data.completionScore < 100 ? 
            'Complete all verifications to reach 100%' : 
            'Congratulations! Your profile is fully verified'
          }
        </p>
      </div>

      {/* Verification Items */}
      <div className="space-y-4">
        {/* ID Verification */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon(data.idVerification.status)}
              <div>
                <h3 className="font-semibold text-gray-900">ID Verification</h3>
                <p className={`text-sm ${getStatusColor(data.idVerification.status)}`}>
                  {data.idVerification.status === 'unverified' && 'Not submitted'}
                  {data.idVerification.status === 'pending' && 'Under review'}
                  {data.idVerification.status === 'verified' && `Verified ${data.idVerification.idType || 'ID'}`}
                  {data.idVerification.status === 'rejected' && 'Rejected'}
                </p>
                {data.idVerification.rejectionReason && (
                  <p className="text-xs text-red-600 mt-1">
                    Reason: {data.idVerification.rejectionReason}
                  </p>
                )}
              </div>
            </div>
            {data.idVerification.status === 'unverified' && (
              <button className="text-emerald-600 hover:text-emerald-700 font-medium text-sm">
                Submit Now →
              </button>
            )}
          </div>
        </div>

        {/* Background Check */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon(data.backgroundCheck.status)}
              <div>
                <h3 className="font-semibold text-gray-900">Background Check</h3>
                <p className={`text-sm ${getStatusColor(data.backgroundCheck.status)}`}>
                  {data.backgroundCheck.status === 'not_requested' && 'Not initiated'}
                  {data.backgroundCheck.status === 'in_progress' && 'In progress'}
                  {data.backgroundCheck.status === 'completed' && 'Completed successfully'}
                  {data.backgroundCheck.status === 'failed' && 'Verification failed'}
                </p>
              </div>
            </div>
            {data.backgroundCheck.status === 'completed' && data.backgroundCheck.checks && (
              <div className="text-right text-xs text-gray-600">
                {Object.entries(data.backgroundCheck.checks).filter(([_, v]) => v === 'clear').length} checks passed
              </div>
            )}
          </div>
        </div>

        {/* Skill Certifications */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {data.verifiedCertificationsCount > 0 ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : data.skillCertifications.length > 0 ? (
                <Clock className="w-6 h-6 text-yellow-600" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-gray-400" />
              )}
              <div>
                <h3 className="font-semibold text-gray-900">Skill Certifications</h3>
                <p className="text-sm text-gray-600">
                  {data.verifiedCertificationsCount} verified out of {data.skillCertifications.length} total
                </p>
              </div>
            </div>
            <button className="text-emerald-600 hover:text-emerald-700 font-medium text-sm">
              Manage →
            </button>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Why verify?</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>✓ Higher visibility in search results</li>
          <li>✓ Increased trust from potential clients</li>
          <li>✓ Access to premium features</li>
          <li>✓ Better chances of winning projects</li>
        </ul>
      </div>
    </div>
  );
};

export default VerificationDashboard;
