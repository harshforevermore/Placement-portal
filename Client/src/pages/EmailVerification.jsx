import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const EmailVerification = () => {
  console.log("email verification");
  const [status, setStatus] = useState("verifying"); // verifying, success, error, expired
  const [message, setMessage] = useState("Verifying your email...");

  const navigate = useNavigate();
  // Extract token from URL pathname
  const { token } = useParams();

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else {
      setStatus("error");
      setMessage("Invalid verification link.");
    }
  }, []);

  const verifyEmail = async (tokenValue) => {
    try {
      const response = await axiosClient.post(
        `/api/auth/verify-institution-email/${tokenValue}`
      );

      const data = await response.json();

      if (data.success) {
        setStatus("success");
        setMessage(data.message);
      } else {
        setStatus("error");
        setMessage(data.message || "Email verification failed.");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "verifying":
        return (
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        );
      case "success":
        return <div className="text-green-600 text-6xl mb-4">✓</div>;
      case "error":
      case "expired":
        return <div className="text-red-600 text-6xl mb-4">✗</div>;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "verifying":
        return "text-blue-600";
      case "success":
        return "text-green-600";
      case "error":
      case "expired":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const handleHomePageRedirect = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-slate-800 rounded-lg shadow-xl p-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-6">
            Email Verification
          </h1>

          {getStatusIcon()}

          <p className={`text-lg mb-6 ${getStatusColor()}`}>{message}</p>

          {status === "error" && (
            <div className="space-y-4">
              <p className="text-gray-400 text-sm">
                The verification link may have expired or is invalid.
              </p>
              <button
                onClick={handleLoginRedirect}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                Go to Home Page
              </button>
              <p className="text-gray-400 text-sm">
                Need help? Contact support at support@placementportal.com
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-4">
              <p className="text-gray-400 text-sm">
                Redirecting to Home page...
              </p>
              <button
                onClick={handleHomePageRedirect}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                Continue to Home Page
              </button>
            </div>
          )}

          {status === "verifying" && (
            <p className="text-gray-400 text-sm">
              Please wait while we verify your email address...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
