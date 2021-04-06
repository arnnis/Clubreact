import { RouteProp, useNavigation } from "@react-navigation/native";
import React, { Component, FC, useEffect, useRef, useState } from "react";
import {
  SectionList,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  RefreshControl,
  ImageBackground,
} from "react-native";
import { useQuery } from "react-query";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Screen from "../components/screen";
import { Channel, GetChannelsResult, User } from "../models/channel";
import { StackParamList } from "../navigator";
import req from "../utils/req";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { useRtc } from "../contexts/rtcContext";
import { TouchableOpacity } from "react-native-gesture-handler";
import { usePubNub } from "pubnub-react";
import PubNub from "pubnub";

interface Props {
  route: RouteProp<StackParamList, "Room">;
}

const Room: FC<Props> = ({ route }) => {
  const [channel, setChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(false);
  const { engine } = useRtc();
  const pubnub = useRef<PubNub | null>(null);
  const [speakingUsers, setSpeakingUsers] = useState<number[]>([]);
  useEffect(() => {
    // getRoom();
    joinRoom();
    return () => {
      leaveRoom();
    };
  }, []);
  const { goBack } = useNavigation();
  const authState = useSelector((state: RootState) => state.auth);

  const getRoom = async () => {
    setLoading(true);
    const res = await req("/get_channel", {
      method: "POST",
      body: {
        channel_id: route.params.channel_id,
        channel: route.params.channel,
      },
    });
    const resJson: Channel = await res.json();
    setChannel(resJson);
    setLoading(false);
    return resJson;
  };

  const joinRoom = async () => {
    setLoading(true);
    const res = await req("/join_channel", {
      method: "POST",
      body: {
        channel: route.params.channel,
        attribution_source: "feed",
        attribution_details: "eyJpc19leHBsb3JlIjpmYWxzZSwicmFuayI6MX0=",
      },
    });
    const resJson: Channel = await res.json();
    console.log("joined channel result", resJson);
    setLoading(false);
    setChannel(resJson);
    initRTC(resJson.token);
    initPubnub(resJson);
    return resJson;
  };

  const leaveRoom = async () => {
    engine?.leaveChannel();
    engine?.removeAllListeners();
    pubnub.current?.unsubscribeAll();
    pubnub.current?.stop();
    const res = await req("/leave_channel", {
      method: "POST",
      body: {
        channel: route.params.channel,
      },
    });
    const resJson = await res.json();

    console.log("leave channel result", resJson);
    return resJson;
  };

  const initRTC = async (token: string | undefined) => {
    joinChannel(token);

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

  const joinChannel = async (token: string | undefined) => {
    // Join Channel using null token and channel name
    console.log("channel token", token);
    await engine?.joinChannel(
      token,
      route.params.channel,
      null,
      authState.user_profile?.user_id ?? 0
    );
  };

  const initPubnub = (_channel: Channel) => {
    console.log("pubnub token", _channel.pubnub_token);
    pubnub.current = new PubNub({
      publishKey: "pub-c-6878d382-5ae6-4494-9099-f930f938868b",
      subscribeKey: "sub-c-a4abea84-9ca3-11ea-8e71-f2b83ac9263d",
      authKey: _channel.pubnub_token,
      uuid: authState.user_profile?.user_id.toString(),
      origin: "clubhouse.pubnub.com",
      presenceTimeout: _channel.pubnub_heartbeat_value,
      heartbeatInterval: channel?.pubnub_heartbeat_interval,
    });

    pubnub.current.addListener({
      message: handlePubnubMessage,
      status: (event) => console.log("pubnub status", event),
    });

    pubnub.current.subscribe({
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

  const handlePubnubMessage = (msg: any) => {
    console.log("pubnub message:", msg);
    const { message } = msg;
    if (message.channel !== route.params.channel) return;
    if (message.action === "join_channel") {
      onPubnubUserJoined(message);
    }
    // if (message.action === "leave_channel") {
    //   onPubnubUserLeaved(message);
    // }
  };

  const onPubnubUserJoined = (message: any) => {
    const user = message.user_profile;
    // @ts-ignore
    setChannel((prevState) => ({
      ...prevState,
      users: [...(prevState?.users ?? []), user],
    }));
  };

  const onPubnubUserLeaved = (message: any) => {
    // @ts-ignore
    setChannel((prevState) => ({
      ...prevState,
      users:
        prevState?.users?.filter((u) => u.user_id !== message.user_id) ?? [],
    }));
  };

  const renderUser = (user: User) => {
    const isAudience = !user.is_speaker && !user.is_followed_by_speaker;
    const isSpeaking = speakingUsers.includes(user.user_id);
    return (
      <View style={[styles.user, isAudience && styles.userSmall]}>
        <View style={isSpeaking && styles.userAvatarSpeaking}>
          <Image
            source={{
              uri:
                user.photo_url ??
                "data:image/jpeg;base64,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",
            }}
            style={[styles.userAvatar, isAudience && styles.userAvatarSmall]}
          />
          {user.is_speaker && (
            <View style={styles.userMicContainer}>
              <MaterialCommunityIcons name="microphone" size={18} />
            </View>
          )}
        </View>

        <Text style={styles.userName}>{user.name}</Text>
      </View>
    );
  };

  const speakers = channel?.users.filter((user) => user.is_speaker);
  const followedBySpeakers = channel?.users.filter(
    (user) => user.is_followed_by_speaker
  );
  const audience = channel?.users.filter(
    (user) => !user.is_speaker && !user.is_followed_by_speaker
  );

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.body}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={getRoom} />
        }
      >
        {!loading && (
          <>
            <Text style={styles.topic}>{channel?.topic}</Text>
            {/* <SectionList
          data={data}
          renderItem={({ item }) => (
            <Text style={{ color: "blue" }}>{item.name}</Text>
          )}
          renderSectionHeader={({ section: { title } }) => <Text>{title}</Text>}
          keyExtractor={(item) => item.name}
        /> */}
            <View style={styles.usersContainer}>
              {speakers?.map(renderUser)}
            </View>
            <Text style={styles.sectionTitle}>Followed by speakers</Text>
            <View style={styles.usersContainer}>
              {followedBySpeakers?.map(renderUser)}
            </View>
            <Text style={styles.sectionTitle}>Audience</Text>
            <View style={styles.usersContainer}>
              {audience?.map(renderUser)}
            </View>
          </>
        )}
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.leaveButton} onPress={goBack}>
          <Text style={styles.leaveButtonTitle}>✌️ Leave quietly</Text>
        </TouchableOpacity>
        <View style={styles.raiseHandButton}>
          <MaterialCommunityIcons
            name="hand-right"
            size={25}
            style={{ marginRight: 2 }}
          />
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  body: {
    backgroundColor: "#FEFCFF",
    borderTopRightRadius: 40,
    borderTopLeftRadius: 40,
    marginTop: 16,
    padding: 24,
    minHeight: "100%",
  },
  topic: {
    fontFamily: "Nunito-Bold",
    color: "#454245",
    fontSize: 15,
  },

  usersContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingVertical: 16,
  },

  sectionTitle: {
    color: "#d7d5d8",
    marginLeft: 16,
    fontFamily: "Nunito-Bold",
  },

  user: {
    width: 100 / 3 + "%",
    alignItems: "center",
    marginBottom: 24,
  },
  userSmall: {
    width: 100 / 4 + "%",
  },
  userName: {
    fontFamily: "Nunito-Bold",
    color: "#4e4b4e",
    fontSize: 13,
    marginTop: 8,
    textAlign: "center",
  },
  userAvatar: {
    borderRadius: 72 / 2.5,
    width: 72,
    height: 72,
  },
  userAvatarSmall: {
    borderRadius: 28,
    width: 54,
    height: 54,
  },
  userAvatarSpeaking: {
    borderWidth: 3,
    borderColor: "#CCCBC5",
    padding: 3,
    borderRadius: 34,
  },
  userMicContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FEFCFF",
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  footer: {
    height: 72,
    width: "100%",
    backgroundColor: "#FEFCFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  leaveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#B8B7B9",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  leaveButtonTitle: {
    fontFamily: "Nunito-Bold",
    color: "#8E4B60",
  },
  raiseHandButton: {
    padding: 8,
    backgroundColor: "#B8B7B9",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: "auto",
  },
});

export default Room;
