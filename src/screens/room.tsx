import { RouteProp, useNavigation } from "@react-navigation/native";
import React, { Component, FC, useEffect, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useQuery } from "react-query";
import RtcEngine, { RtcEngineConfig } from "react-native-agora";
import Screen from "../components/screen";
import { Channel, GetChannelsResult } from "../models/channel";
import { StackParamList } from "../navigator";
import req from "../utils/req";
import { getAgoraToken } from "../utils/token";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";

interface Props {
  route: RouteProp<StackParamList, "Room">;
}

const Room: FC<Props> = ({ route }) => {
  const { isLoading, error, data, refetch } = useQuery(
    "room" + route.params.channel,
    () => getRoom()
  );
  const engineRef = useRef<RtcEngine | null>(null);
  useEffect(() => {
    initRTC();
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

  const initRTC = async () => {
    engineRef.current = await RtcEngine.createWithConfig(
      new RtcEngineConfig("938de3e8055e42b281bb8c6f69c21f78")
    );

    await engineRef.current.leaveChannel();

    joinChannel();

    engineRef.current.addListener("Warning", (warn) => {
      console.log("Warning", warn);
    });

    engineRef.current.addListener("Warning", (warn) => {
      console.log("Warning", warn);
    });

    engineRef.current.addListener("Error", (err) => {
      console.log("Error", err);
    });

    engineRef.current.addListener("UserJoined", (uid, elapsed) => {
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

    engineRef.current.addListener("UserOffline", (uid, reason) => {
      console.log("UserOffline", uid, reason);
      //   const { peerIds } = this.state;
      //   this.setState({
      //     // Remove peer ID from state array
      //     peerIds: peerIds.filter((id) => id !== uid),
      //   });
    });

    // If Local user joins RTC channel
    engineRef.current.addListener(
      "JoinChannelSuccess",
      (channel, uid, elapsed) => {
        console.log("JoinChannelSuccess", channel, uid, elapsed);
        // Set state variable to true
        // this.setState({
        //   joinSucceed: true,
        // });
      }
    );
  };

  const joinChannel = async () => {
    // Join Channel using null token and channel name
    console.log("access token", authState.access_token);
    await engineRef.current?.joinChannel(
      authState.auth_token,
      route.params.channel,
      null,
      0
    );
  };

  return (
    <Screen>
      <View style={styles.body}>
        <Text style={styles.topic}>{data?.topic}</Text>
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
