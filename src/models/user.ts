export interface UserProfile {
  user_id: number;
  name: string;
  displayname: null;
  photo_url: null;
  username: string;
  bio: null;
  twitter: null;
  instagram: null;
  num_followers: number;
  num_following: number;
  time_created: string;
  follows_me: boolean;
  is_blocked_by_network: boolean;
  mutual_follows_count: number;
  mutual_follows: any[];
  notification_type: null;
  invited_by_user_profile: InvitedByUserProfile;
  invited_by_club: null;
  clubs: any[];
  url: string;
  can_receive_direct_payment: boolean;
  direct_payment_fee_rate: number;
  direct_payment_fee_fixed: number;
  has_verified_email: boolean;
  can_edit_username: boolean;
  can_edit_name: boolean;
  can_edit_displayname: boolean;
  topics: any[];
}

export interface InvitedByUserProfile {
  user_id: number;
  name: string;
  photo_url: string;
  username: string;
}

export interface LoginResult {
  success: boolean;
  error_message?: string;
  is_verified: boolean;
  user_profile: LoginUserProfile;
  auth_token: string;
  refresh_token: string;
  access_token: string;
  is_waitlisted: boolean;
  is_onboarding: boolean;
}

export interface LoginUserProfile {
  user_id: number;
  name: string;
  photo_url: null;
  username: string;
}
