import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { AuthService } from '~/services/api';

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const processOAuthCallback = async () => {
      try {
        // Get token or error from URL params
        const token = searchParams.get('token');
        const error = searchParams.get('error');

        if (error) {
          // Handle OAuth error
          console.error('OAuth error:', error);
          setStatus('error');

          const errorMessages: Record<string, string> = {
            'oauth_failed': 'OAuth authentication failed. Please try again.',
            'oauth_error': 'An error occurred during authentication.',
            'no_token': 'No authentication token received.'
          };

          setErrorMessage(errorMessages[error] || 'Authentication failed. Please try again.');

          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate('/login?error=' + error);
          }, 3000);
          return;
        }

        if (!token) {
          setStatus('error');
          setErrorMessage('No authentication token received.');
          setTimeout(() => {
            navigate('/login?error=no_token');
          }, 3000);
          return;
        }

        // Store token in localStorage
        localStorage.setItem('token', token);

        // Decode token to get user info (JWT format: header.payload.signature)
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const userRole = payload.role;

          setStatus('success');

          // Short delay for UX
          setTimeout(() => {
            // Redirect based on role
            if (userRole === 'admin') {
              navigate('/dashboard/admin');
            } else {
              navigate('/dashboard');
            }
          }, 1000);
        } catch (decodeError) {
          console.error('Token decode error:', decodeError);
          // Still redirect to dashboard even if decode fails
          setStatus('success');
          setTimeout(() => {
            navigate('/dashboard');
          }, 1000);
        }
      } catch (err) {
        console.error('OAuth callback error:', err);
        setStatus('error');
        setErrorMessage('An unexpected error occurred.');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    };

    processOAuthCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-200 via-violet-200 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/90 border border-indigo-100 rounded-2xl p-8 shadow-2xl backdrop-blur text-center">
        {status === 'processing' && (
          <>
            <div className="mb-6 flex justify-center">
              <svg
                className="animate-spin h-12 w-12 text-indigo-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">
              Completing Sign In
            </h2>
            <p className="text-sm text-slate-600">
              Please wait while we authenticate your account...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mb-6 flex justify-center">
              <svg
                className="h-12 w-12 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">
              Authentication Successful!
            </h2>
            <p className="text-sm text-slate-600">
              Redirecting to your dashboard...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mb-6 flex justify-center">
              <svg
                className="h-12 w-12 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">
              Authentication Failed
            </h2>
            <p className="text-sm text-slate-600 mb-4">
              {errorMessage}
            </p>
            <p className="text-xs text-slate-500">
              Redirecting to login page...
            </p>
          </>
        )}
      </div>
    </div>
  );
}
