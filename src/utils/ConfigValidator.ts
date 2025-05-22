/**
 * Utility to validate application configuration
 */

export const validateGoogleConfig = (): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  // Check if required environment variables are set
  if (!process.env.REACT_APP_GOOGLE_CLIENT_ID) {
    errors.push('Missing Google Client ID (REACT_APP_GOOGLE_CLIENT_ID)');
  } else if (
    process.env.REACT_APP_GOOGLE_CLIENT_ID.includes('your-client-id') ||
    process.env.REACT_APP_GOOGLE_CLIENT_ID.length < 20
  ) {
    errors.push('Google Client ID appears to be invalid or a placeholder');
  }

  if (!process.env.REACT_APP_GOOGLE_PICKER_API_KEY) {
    errors.push('Missing Google API Key (REACT_APP_GOOGLE_PICKER_API_KEY)');
  } else if (
    process.env.REACT_APP_GOOGLE_PICKER_API_KEY.includes('your-api-key') ||
    process.env.REACT_APP_GOOGLE_PICKER_API_KEY.length < 20
  ) {
    errors.push('Google API Key appears to be invalid or a placeholder');
  }

  // Check if running on GitHub Pages with proper domain settings
  const isGitHubPages = window.location.hostname.includes('github.io');
  const origin = window.location.origin;

  if (isGitHubPages) {
    console.info(
      `Running on GitHub Pages (${origin}). Make sure your Google OAuth Client ID has this origin added to authorized JavaScript origins in the Google Cloud Console.`
    );

    // Additional tips for GIS migration
    console.info(
      'Note: This app uses Google Identity Services (GIS). Make sure your OAuth credentials are configured for GIS in the Google Cloud Console.'
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
