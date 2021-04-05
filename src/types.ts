export interface LoginResult {
  success: boolean;
  error_message?: string;
  is_verified: boolean;
  user_profile: UserProfile;
  auth_token: string;
  refresh_token: string;
  access_token: string;
  is_waitlisted: boolean;
  is_onboarding: boolean;
}

export interface UserProfile {
  user_id: number;
  name: string;
  photo_url: null;
  username: string;
}
