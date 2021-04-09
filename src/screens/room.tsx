import { RouteProp, useNavigation } from "@react-navigation/native";
import React, { FC, useEffect, useMemo, useRef, useState } from "react";
import { RefreshControl, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Screen from "../components/screen";
import { Channel, User } from "../models/channel";
import { StackParamList } from "../navigator";
import req from "../utils/req";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { useRtc } from "../contexts/rtcContext";
import { FlatList, TouchableOpacity } from "react-native-gesture-handler";
import PubNub from "pubnub";
import FastImage from "react-native-fast-image";
import { useTheme } from "../contexts/theme/context";
import defaultAvatar from "../assets/default-avatar";
import Touchable from "../components/touchable";

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
  const { goBack, navigate } = useNavigation();
  const authState = useSelector((state: RootState) => state.auth);
  const { theme } = useTheme();

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
    if (message.action === "leave_channel") {
      onPubnubUserLeaved(message);
    }
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
      <Touchable
        style={[styles.user, isAudience && styles.userSmall]}
        onPress={() =>
          navigate("UserProfile", { user_id: user.user_id, user: user })
        }
      >
        <View style={isSpeaking && styles.userAvatarSpeaking}>
          <FastImage
            source={{
              uri: user.photo_url ?? defaultAvatar,
            }}
            style={[styles.userAvatar, isAudience && styles.userAvatarSmall]}
          />
          {user.is_speaker && (
            <View
              style={[styles.userMicContainer, { backgroundColor: theme.bg2 }]}
            >
              <MaterialCommunityIcons
                name="microphone"
                size={18}
                color={theme.fg}
              />
            </View>
          )}
        </View>

        <Text style={[styles.userName, { color: theme.fg }]}>{user.name}</Text>
      </Touchable>
    );
  };

  const speakers = useMemo(
    () => channel?.users.filter((user) => user.is_speaker),
    [channel?.users.length]
  );
  const followedBySpeakers = useMemo(
    () => channel?.users.filter((user) => user.is_followed_by_speaker),
    [channel?.users.length]
  );
  const audience = useMemo(
    () =>
      channel?.users.filter(
        (user) => !user.is_speaker && !user.is_followed_by_speaker
      ),
    [channel?.users.length]
  );

  const renderItem = ({ item }: any) => renderUser(item);

  return (
    <Screen>
      <FlatList
        contentContainerStyle={[styles.body, { backgroundColor: theme.bg2 }]}
        ListHeaderComponent={
          loading ? null : (
            <>
              <Text style={[styles.topic, { color: theme.fg }]}>
                {channel?.topic}
              </Text>
              <View style={styles.usersContainer}>
                {speakers?.map(renderUser)}
              </View>
              <Text style={[styles.sectionTitle, { color: theme.fg2 }]}>
                Followed by speakers
              </Text>
              <View style={styles.usersContainer}>
                {followedBySpeakers?.map(renderUser)}
              </View>
              <Text style={[styles.sectionTitle, { color: theme.fg2 }]}>
                Audience ({audience?.length})
              </Text>
            </>
          )
        }
        data={audience}
        renderItem={renderItem}
        numColumns={4}
        keyExtractor={(item) => item.user_id.toString()}
        removeClippedSubviews
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={getRoom} />
        }
      />
      {/* <ScrollView
        contentContainerStyle={styles.body}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={getRoom} />
        }
        removeClippedSubviews={Platform.OS === "android"}
      >
        {!loading && (
          <>
            <Text style={styles.topic}>{channel?.topic}</Text>
            
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
      </ScrollView> */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.leaveButton, { backgroundColor: theme.bg2 }]}
          onPress={goBack}
        >
          <Text style={[styles.leaveButtonTitle]}>✌️ Leave quietly</Text>
        </TouchableOpacity>
        <View style={[styles.raiseHandButton, { backgroundColor: theme.bg2 }]}>
          <MaterialCommunityIcons
            name="hand-right"
            size={25}
            style={{ marginRight: 2 }}
            color={theme.fg}
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
