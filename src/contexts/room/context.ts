import Pubnub from "pubnub";
import React, { useContext } from "react";
import RtcEngine from "react-native-agora";
import { Channel } from "../../models/channel";

export interface ContextValue {
  rtc: RtcEngine | null;
  pubnub: Pubnub | null;
  room: Channel | null;
  loading: boolean;
  join?(channel: string): Promise<Channel>;
  leave?(): void;
  speakingUsers: number[];
}

export const RoomContext = React.createContext({
  rtc: null,
  pubnub: null,
  room: null,
  loading: true,
  speakingUsers: [],
} as ContextValue);

export const useRoom = () => useContext(RoomContext);
