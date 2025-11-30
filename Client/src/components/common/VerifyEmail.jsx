import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Mail, CheckCircle, XCircle, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import axiosClient from '../../API/axiosClient';

const VerifyEmail = () => {
  // Get email and type from URL query params
  const [searchParams] = useSearchParams();
  const emailFromUrl = searchParams.get('email');
  const userTypeFromUrl = searchParams.get('type');
  const { userType, token } = useParams();
  const navigate = useNavigate();
  
  
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [userEmail, setUserEmail] = useState(emailFromUrl || '');
  const [countdown, setCountdown] = useState(0);

  // If token exists in URL, verify it automatically
  useEffect(() => {
    if (token) {
      verifyEmailToken(token, userType);
    }
  }, [token]);
// Auto-send verification email on mount if email is provided
  useEffect(() => {
    if (emailFromUrl && !token) {
      // Automatically send verification email
      handleResendVerification(userTypeFromUrl, userEmail);
    }
  }, [emailFromUrl, token]);
  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const verifyEmailToken = async (verificationToken, userType) => {
    try {
      setStatus('verifying');
      setMessage('Verifying your email...');

      console.log("userType: ", userType);
      console.log("verificationToken: ", verificationToken);
      const response = await axiosClient.post(`/api/auth/verify-email/${userType}/${verificationToken}`);

      if (response.data.success) {
        setStatus('success');
        setMessage('Email verified successfully! Redirecting to login...');
        
        // Redirect to appropriate login page after 3 seconds
        setTimeout(() => {
          const userType = response.data.userType || 'institution';
          navigate(`/${userType}/login`);
        }, 3000);
      }
    } catch (error) {
      setStatus('error');
      if (error.response?.status === 400) {
        setMessage(error.response.data.message || 'Invalid or expired verification link');
      } else {
        setMessage('Verification failed. Please try again.');
      }
    }
  };

  const handleResendVerification = async (userType, email) => {
    if (!email) {
      setMessage('Please enter your email address');
      return;
    }

    try {
      setStatus('resending');
      setMessage('Sending verification email...');

      const response = await axiosClient.post('/api/auth/resend-verification', {
        email,
        userType
      });

      if (response.data.success) {
        setStatus('idle');
        setMessage('Verification email sent! Please check your inbox.');
        setCountdown(60);
      }
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Failed to send verification email');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'verifying':
      case 'resending':
        return <Loader2 className="w-16 h-16 text-blue-400 animate-spin mx-auto mb-4" />;
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />;
      case 'error':
        return <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />;
      default:
        return <Mail className="w-16 h-16 text-purple-400 mx-auto mb-4" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'verifying':
      case 'resending':
        return 'text-blue-400';
      case 'success':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-purple-400';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-slate-800 rounded-lg shadow-xl p-8 border border-slate-700">
          {/* Icon */}
          {getStatusIcon()}

          {/* Title */}
          <h1 className="text-2xl font-bold text-white text-center mb-2">
            {status === 'success' ? 'Email Verified!' : 
             status === 'verifying' ? 'Verifying Email...' :
             status === 'resending' ? 'Sending Email...' :
             'Verify Your Email'}
          </h1>

          {/* Message */}
          {message && (
            <p className={`text-center mb-6 ${getStatusColor()}`}>
              {message}
            </p>
          )}

          {/* Waiting for verification (no token in URL) */}
          {status === 'idle' && !token && (
            <div className="space-y-6">
              <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-slate-300">
                    <p className="font-medium text-white mb-2">Email Verification Required</p>
                    <p>We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.</p>
                  </div>
                </div>
              </div>

              <div className="text-sm text-slate-400 text-center">
                <p className="mb-2">Didn't receive the email?</p>
                <ul className="list-disc list-inside text-left space-y-1 mb-4">
                  <li>Check your spam/junk folder</li>
                  <li>Verify you entered the correct email</li>
                  <li>Wait a few minutes for the email to arrive</li>
                </ul>
              </div>

              {/* Resend form */}
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={countdown > 0 || status === 'resending'}
                />
                
                <button
                  onClick={handleResendVerification}
                  disabled={countdown > 0 || status === 'resending' || !userEmail}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {status === 'resending' ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : countdown > 0 ? (
                    `Resend in ${countdown}s`
                  ) : (
                    <>
                      <RefreshCw className="w-5 h-5" />
                      Resend Verification Email
                    </>
                  )}
                </button>
              </div>

              {/* Back to login */}
              <div className="text-center pt-4 border-t border-slate-700">
                <button
                  onClick={() => navigate('/')}
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                  Back to Home
                </button>
              </div>
            </div>
          )}

          {/* Error state with retry */}
          {status === 'error' && token && (
            <div className="space-y-4">
              <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4">
                <p className="text-sm text-red-300">
                  The verification link may have expired or is invalid. Please request a new verification email.
                </p>
              </div>

              <button
                onClick={() => {
                  setStatus('idle');
                  setMessage('');
                }}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Request New Link
              </button>

              <button
                onClick={() => navigate('/')}
                className="w-full bg-slate-600 hover:bg-slate-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Back to Home
              </button>
            </div>
          )}

          {/* Success state */}
          {status === 'success' && (
            <div className="space-y-4">
              <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4">
                <p className="text-sm text-green-300 text-center">
                  Your email has been verified successfully!
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Redirecting to login page...</span>
              </div>
            </div>
          )}

          {/* Tips */}
          {status === 'idle' && !token && (
            <div className="mt-6 pt-6 border-t border-slate-700">
              <p className="text-xs text-slate-500 text-center">
                For security reasons, verification links expire after 24 hours.
              </p>
            </div>
          )}
        </div>

        {/* Support info */}
        <div className="text-center mt-6">
          <p className="text-sm text-slate-400">
            Need help?{' '}
            <a href="mailto:support@placementportal.com" className="text-purple-400 hover:text-purple-300">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
