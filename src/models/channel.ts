export interface GetChannelsResult {
  channels: Channel[];
  events: any[];
  success: boolean;
}

export interface Channel {
  creator_user_profile_id: number;
  channel_id: number;
  channel: string;
  topic: null | string;
  is_private: boolean;
  is_social_mode: boolean;
  url: string;
  feature_flags: FeatureFlag[];
  club: Club | null;
  club_name: null | string;
  club_id: number | null;
  welcome_for_user_profile: null;
  num_other: number;
  has_blocked_speakers: boolean;
  is_explore_channel: boolean;
  num_speakers: number;
  num_all: number;
  users: User[];
  logging_context: LoggingContext;
}

export interface Club {
  club_id: number;
  name: string;
  description: string;
  photo_url: string;
  num_members: number;
  num_followers: number;
  enable_private: boolean;
  is_follow_allowed: boolean;
  is_membership_private: boolean;
  is_community: boolean;
  rules: Rule[];
  url: string;
  num_online: number;
}

export interface Rule {
  desc: string;
  title: string;
}

export enum FeatureFlag {
  AgoraAudioProfileSpeechStandard = "AGORA_AUDIO_PROFILE_SPEECH_STANDARD",
}

export interface LoggingContext {
  channel_id: number;
  batch_id: string;
  reasons?: string[];
}

export interface User {
  user_id: number;
  name: string;
  photo_url: string;
  is_speaker: boolean;
  is_moderator: boolean;
  time_joined_as_speaker: null;
}
