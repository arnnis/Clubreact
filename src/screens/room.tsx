import { RouteProp, useNavigation } from "@react-navigation/native";
import React, { Component, FC, useEffect, useRef, useState } from "react";
import {
  SectionList,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
} from "react-native";
import { useQuery } from "react-query";
import RtcEngine, { RtcEngineConfig } from "react-native-agora";
import Screen from "../components/screen";
import { Channel, GetChannelsResult, User } from "../models/channel";
import { StackParamList } from "../navigator";
import req from "../utils/req";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { useRtc } from "../contexts/rtcContext";

interface Props {
  route: RouteProp<StackParamList, "Room">;
}

const Room: FC<Props> = ({ route }) => {
  const [channel, setChannel] = useState<Channel | null>(null);
  const { engine } = useRtc();
  console.log("engine", engine);
  useEffect(() => {
    getRoom();
    // joinRoom();
    // return () => {
    //   leaveRoom();
    //   engine?.leaveChannel();
    //   engine?.removeAllListeners()
    // };
  }, []);
  const { navigate } = useNavigation();
  const authState = useSelector((state: RootState) => state.auth);

  const getRoom = async () => {
    const res = await req("/get_channel", {
      method: "POST",
      body: {
        channel_id: route.params.channel_id,
        channel: route.params.channel,
      },
    });
    const resJson: Channel = await res.json();
    setChannel(resJson);
    return resJson;
  };

  const joinRoom = async () => {
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
    setChannel(resJson);
    initRTC(resJson.token);
    return resJson;
  };

  const leaveRoom = async () => {
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
      // Get current peer IDs
      //   const { peerIds } = this.state;
      //   // If new user
      //   if (peerIds.indexOf(uid) === -1) {
      //     this.setState({
      //       // Add peer ID to state array
      //       peerIds: [...peerIds, uid],
      //     });
      //   }
    });

    engine?.addListener("UserOffline", (uid, reason) => {
      console.log("UserOffline", uid, reason);
      //   const { peerIds } = this.state;
      //   this.setState({
      //     // Remove peer ID from state array
      //     peerIds: peerIds.filter((id) => id !== uid),
      //   });
    });

    // If Local user joins RTC channel
    engine?.addListener("JoinChannelSuccess", (channel, uid, elapsed) => {
      console.log("JoinChannelSuccess", channel, uid, elapsed);
      // Set state variable to true
      // this.setState({
      //   joinSucceed: true,
      // });
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

  const renderUser = (user: User) => {
    const isAudience = !user.is_speaker && !user.is_followed_by_speaker;
    return (
      <View style={[styles.user, isAudience && styles.userSmall]}>
        <Image
          source={{
            uri:
              user.photo_url ??
              "data:image/jpeg;base64,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",
          }}
          style={[styles.userAvatar, isAudience && styles.userAvatarSmall]}
        />
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
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.topic}>{channel?.topic}</Text>
        {/* <SectionList
          data={data}
          renderItem={({ item }) => (
            <Text style={{ color: "blue" }}>{item.name}</Text>
          )}
          renderSectionHeader={({ section: { title } }) => <Text>{title}</Text>}
          keyExtractor={(item) => item.name}
        /> */}
        <View style={styles.usersContainer}>{speakers?.map(renderUser)}</View>
        <Text>Followed by speakers</Text>
        <View style={styles.usersContainer}>
          {followedBySpeakers?.map(renderUser)}
        </View>
        <Text>Audience</Text>
        <View style={styles.usersContainer}>{audience?.map(renderUser)}</View>
      </ScrollView>
      <View style={styles.footer}>
        <View style={styles.leaveButton}>
          <Text style={styles.leaveButtonTitle}>✌️ Leave quietly</Text>
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
    borderRadius: 24,
    width: 72,
    height: 72,
  },
  userAvatarSmall: {
    width: 54,
    height: 54,
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
});

export default Room;
