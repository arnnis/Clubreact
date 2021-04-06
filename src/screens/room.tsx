import { RouteProp, useNavigation } from "@react-navigation/native";
import React, { Component, FC, useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useQuery } from "react-query";
import RtcEngine, { RtcEngineConfig } from "react-native-agora";
import Screen from "../components/screen";
import { Channel, GetChannelsResult } from "../models/channel";
import { StackParamList } from "../navigator";
import req from "../utils/req";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { useRtcEngine } from "../contexts/rtcEngineContext";

interface Props {
  route: RouteProp<StackParamList, "Room">;
}

const Room: FC<Props> = ({ route }) => {
  const [channel, setChannel] = useState<Channel | null>(null);
  const { engine } = useRtcEngine();
  console.log("engine", engine);
  useEffect(() => {
    joinRoom();
    return () => {
      leaveRoom();
      engine?.leaveChannel();
    };
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

  return (
    <Screen>
      <View style={styles.body}>
        <Text style={styles.topic}>{channel?.topic}</Text>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  body: {
    backgroundColor: "#fff",
    borderTopRightRadius: 40,
    borderTopLeftRadius: 40,
    height: "100%",
    marginTop: 16,
    padding: 24,
  },
  topic: {
    fontFamily: "Nunito-Bold",
    color: "#454245",
    fontSize: 15,
  },
});

export default Room;
