import React, { FC, useState } from "react";
import { useSelector } from "react-redux";
import PubNub from "pubnub";
import { Channel } from "../../models/channel";
import { RootState } from "../../store/store";
import req from "../../utils/req";
import { useRtc } from "../rtcContext";
import { RoomContext, ContextValue } from "./context";
import { APIResult } from "../../models/api";

export const RoomProvider: FC = ({ children }) => {
  const [room, setChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(false);
  const { engine } = useRtc();
  const [pubnub, setPubnub] = useState<PubNub | null>(null);
  const [speakingUsers, setSpeakingUsers] = useState<number[]>([]);
  const authState = useSelector((state: RootState) => state.auth);

  const joinRoom = async (channel: string) => {
    if (room?.channel === channel) return;
    if (room) {
      leaveRoom();
    }
    setLoading(true);
    const res = await req("/join_channel", {
      method: "POST",
      body: {
        channel: channel,
        attribution_source: "feed",
        attribution_details: "eyJpc19leHBsb3JlIjpmYWxzZSwicmFuayI6MX0=",
      },
    });
    const resJson: APIResult<Channel> = await res.json();
    console.log("joined channel result", resJson);
    setLoading(false);
    setChannel(resJson);
    initRTC(resJson);
    initPubnub(resJson);
    return resJson;
  };

  const leaveRoom = async () => {
    const _channel = room?.channel;
    setChannel(null);
    engine?.leaveChannel();
    engine?.removeAllListeners();
    pubnub?.unsubscribeAll();
    pubnub?.stop();
    const res = await req("/leave_channel", {
      method: "POST",
      body: {
        channel: _channel,
      },
    });
    const resJson = await res.json();

    setSpeakingUsers([]);

    console.log("leave channel result", resJson);
    return resJson;
  };

  const initRTC = async (_channel: Channel) => {
    joinChannel(_channel);

    engine?.addListener("Warning", (warn) => {
      console.log("Warning", warn);
    });

    engine?.addListener("Warning", (warn) => {
      console.log("Warning", warn);
    });

    engine?.addListener("Error", (err) => {
      console.log("Error", err);
    });

    engine?.addListener("UserJoined", (uid, elapsed) => {
      console.log("UserJoined", uid, elapsed);
    });

    engine?.addListener("UserOffline", (uid, reason) => {
      console.log("UserOffline", uid, reason);
    });

    // If Local user joins RTC channel
    engine?.addListener("JoinChannelSuccess", (channel, uid, elapsed) => {
      console.log("JoinChannelSuccess", channel, uid, elapsed);
    });

    engine?.addListener("AudioVolumeIndication", (speakers) => {
      console.log("loadest spkears", speakers);
      setSpeakingUsers(speakers.map((s) => s.uid));
    });
  };

  const joinChannel = async (_channel: Channel) => {
    // Join Channel using null token and channel name
    console.log("channel token", _channel.token);
    if (!_channel || !_channel.token) return;
    await engine?.joinChannel(
      _channel.token,
      _channel.channel,
      null,
      authState.user_profile?.user_id ?? 0
    );
  };

  const initPubnub = (_channel: Channel) => {
    console.log("pubnub token", _channel.pubnub_token);
    const _pubnub = new PubNub({
      publishKey: "pub-c-6878d382-5ae6-4494-9099-f930f938868b",
      subscribeKey: "sub-c-a4abea84-9ca3-11ea-8e71-f2b83ac9263d",
      authKey: _channel.pubnub_token,
      uuid: authState.user_profile?.user_id.toString(),
      origin: "clubhouse.pubnub.com",
      presenceTimeout: _channel.pubnub_heartbeat_value,
      heartbeatInterval: room?.pubnub_heartbeat_interval,
    });
    setPubnub(_pubnub);

    _pubnub?.subscribe({
      channels: [
        "users." + authState.user_profile?.user_id,
        "channel_user." +
          _channel.channel +
          "." +
          authState.user_profile?.user_id,
        "channel_all." + _channel.channel,
      ],
    });
  };

  const value: ContextValue = {
    room: room,
    loading,
    rtc: engine,
    pubnub,
    join: joinRoom,
    leave: leaveRoom,
    speakingUsers,
  };

  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
};
