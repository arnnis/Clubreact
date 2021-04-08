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
  Dimensions,
} from "react-native";
import FastImage from "react-native-fast-image";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Screen from "../components/screen";
import { Channel, GetChannelsResult, User } from "../models/channel";
import { StackParamList } from "../navigator";
import req from "../utils/req";
import { connect, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { useRtc, withRtc } from "../contexts/rtcContext";
import { TouchableOpacity } from "react-native-gesture-handler";
import { usePubNub } from "pubnub-react";
import PubNub from "pubnub";
import {
  DataProvider,
  LayoutProvider,
  RecyclerListView,
} from "recyclerlistview";
import Flex from "../components/flex";

let { width } = Dimensions.get("window");
const ViewTypes = {
  ROOM_TITLE: 0,
  TRIPLE: 1,
  QUAD: 2,
  SECTION_TITLE: 3,
};

interface Props {
  route: RouteProp<StackParamList, "Room">;
}

class RoomRecyclerClass extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      dataProvider: new DataProvider(
        (r1, r2) => r1.user_id !== r2.user_id
      ).cloneWithRows([]),
      speakingUsers: [],
      loading: false,
      channel: null as Channel | null,
    };
  }

  layoutProvider = new LayoutProvider(
    (index) => {
      let data = this.state.dataProvider.getDataForIndex(index);
      // console.log("index", index, "data", data);
      if (data["type"] === "room_title") {
        return ViewTypes.ROOM_TITLE;
      } else if (data["type"] === "title") {
        return ViewTypes.SECTION_TITLE;
      } else if (data.is_speaker || data.is_followed_by_speaker) {
        return ViewTypes.TRIPLE;
      } else {
        return ViewTypes.QUAD;
      }
    },
    (type, dim) => {
      switch (type) {
        case ViewTypes.ROOM_TITLE:
          dim.width = width;
          dim.height = 64;
          break;
        case ViewTypes.TRIPLE:
          dim.width = width / 3 - 12;
          dim.height = 128;
          break;
        case ViewTypes.QUAD:
          dim.width = width / 4 - 8;
          dim.height = 128;
          break;

        case ViewTypes.SECTION_TITLE:
          dim.width = width;
          dim.height = 40;
          break;
        default:
          dim.width = 0;
          dim.height = 0;
      }
    }
  );

  pubnub: null | PubNub = null;

  componentDidMount() {
    this.joinRoom();
  }

  componentWillUnmount() {
    this.leaveRoom();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.channel?.users?.length !== this.state.channel?.users?.length
    ) {
      this.setState({
        dataProvider: this.state.dataProvider.cloneWithRows(
          this.normalizeUsersList(this.state.channel?.users ?? [])
        ),
      });
    }
  }

  joinRoom = async () => {
    this.setState({ loading: true });
    const res = await req("/join_channel", {
      method: "POST",
      body: {
        channel: this.props.route.params.channel,
        attribution_source: "feed",
        attribution_details: "eyJpc19leHBsb3JlIjpmYWxzZSwicmFuayI6MX0=",
      },
    });
    const resJson: Channel = await res.json();
    console.log("joined channel result", resJson);
    if (resJson.success === false) {
      toast?.show(resJson.error_message, { type: "normal", duration: 8000 });
      this.props.navigation.goBack();
      return;
    }
    await this.setState({
      channel: resJson,
      loading: false,
    });
    this.initRTC(resJson.token);
    this.initPubnub(resJson);

    return resJson;
  };

  leaveRoom = async () => {
    this.props.rtc?.engine.leaveChannel();
    this.props.rtc?.engine.removeAllListeners();
    this.pubnub?.unsubscribeAll();
    this.pubnub?.stop();
    const res = await req("/leave_channel", {
      method: "POST",
      body: {
        channel: this.props.route.params.channel,
      },
    });
    const resJson = await res.json();

    console.log("leave channel result", resJson);
    return resJson;
  };

  normalizeUsersList = (users: User[]) => {
    const speakers =
      users.filter((user) => user.is_speaker && !user.is_followed_by_speaker) ??
      [];
    const followedBySpeakers =
      users.filter((user) => !user.is_speaker && user.is_followed_by_speaker) ??
      [];
    const audience =
      users.filter(
        (user) => !user.is_speaker && !user.is_followed_by_speaker
      ) ?? [];
    let res = [];
    res = [{ type: "room_title", title: this.state.channel?.topic }];

    if (speakers.length > 0) {
      res = [...res, ...speakers];
    }

    if (followedBySpeakers.length > 0) {
      res = [
        ...res,
        { type: "title", title: "Followed by speakers" },
        ...followedBySpeakers,
      ];
    }

    if (audience.length > 0) {
      res = [
        ...res,
        { type: "title", title: "Audience", num: audience.length },
        ...audience,
      ];
    }
    console.log("normalized users", res);
    return res;
  };

  initPubnub = (_channel: Channel) => {
    console.log("pubnub token", _channel.pubnub_token);
    this.pubnub = new PubNub({
      publishKey: "pub-c-6878d382-5ae6-4494-9099-f930f938868b",
      subscribeKey: "sub-c-a4abea84-9ca3-11ea-8e71-f2b83ac9263d",
      authKey: _channel.pubnub_token,
      uuid: this.props.authState.user_profile?.user_id.toString(),
      origin: "clubhouse.pubnub.com",
      presenceTimeout: _channel.pubnub_heartbeat_value,
      heartbeatInterval: _channel?.pubnub_heartbeat_interval,
    });

    this.pubnub.addListener({
      message: this.handlePubnubMessage,
      status: (event) => console.log("pubnub status", event),
    });

    this.pubnub.subscribe({
      channels: [
        "users." + this.props.authState.user_profile?.user_id,
        "channel_user." +
          _channel.channel +
          "." +
          this.props.authState.user_profile?.user_id,
        "channel_all." + _channel.channel,
      ],
    });
  };

  handlePubnubMessage = (msg: any) => {
    console.log("pubnub message:", msg);
    const { message } = msg;
    if (message.channel !== this.props.route.params.channel) return;
    if (message.action === "join_channel") {
      this.onPubnubUserJoined(message);
    }
    if (message.action === "leave_channel") {
      this.onPubnubUserLeaved(message);
    }
  };

  onPubnubUserJoined = async (message: any) => {
    const user = message.user_profile;
    // @ts-ignore

    this.setState({
      channel: {
        ...this.state.channel,
        users: [...this.state.channel.users, user],
      },
    });
  };

  onPubnubUserLeaved = (message: any) => {
    this.setState({
      channel: {
        ...this.state.channel,
        users:
          this.state.channel.users?.filter(
            (u) => u.user_id !== message.user_id
          ) ?? [],
      },
    });
  };

  initRTC = async (token: string | undefined) => {
    this.joinChannel(token);

    const engine = this.props.rtc.engine;
    engine.setDefaultAudioRoutetoSpeakerphone(true);
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
      this.setState({ speakingUsers: speakers.map((s) => s.uid) });
    });
  };

  joinChannel = async (token: string | undefined) => {
    // Join Channel using null token and channel name
    console.log("channel token", token);
    await this.props.rtc?.engine.joinChannel(
      token,
      this.props.route.params.channel,
      null,
      this.props.authState.user_profile?.user_id ?? 0
    );
  };

  renderUser = (user: User, extendedState: any) => {
    const isAudience = !user.is_speaker && !user.is_followed_by_speaker;
    const isSpeaking = extendedState?.speakingUsers?.includes(user.user_id);
    return (
      <View style={[styles.user]}>
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

  rowRenderer = (type, data, index, extendedState) => {
    //You can return any view here, CellContainer has no special significance
    switch (type) {
      case ViewTypes.ROOM_TITLE:
        return (
          <Flex style={{ flex: 1, paddingHorizontal: 16 }} justify="center">
            <Text style={styles.topic}>{this.state.channel?.topic}</Text>
          </Flex>
        );
      case ViewTypes.TRIPLE:
        return this.renderUser(data, extendedState);
      case ViewTypes.QUAD:
        return this.renderUser(data, extendedState);

      case ViewTypes.SECTION_TITLE:
        return (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
            }}
          >
            <Text style={styles.sectionTitle}>
              {data.title} {data["num"] ? `( ${data["num"]} )` : ""}
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  render() {
    return (
      <Screen>
        <View style={styles.body}>
          {!this.state.loading && (
            <RecyclerListView
              layoutProvider={this.layoutProvider}
              dataProvider={this.state.dataProvider}
              rowRenderer={this.rowRenderer}
              extendedState={{ speakingUsers: this.state.speakingUsers }}
              renderAheadOffset={1000}
            />
          )}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.leaveButton} onPress={() => {}}>
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
  }
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  body: {
    backgroundColor: "#FEFCFF",
    borderTopRightRadius: 40,
    borderTopLeftRadius: 40,
    marginTop: 16,
    minHeight: "100%",
    paddingLeft: 16,
    paddingBottom: 16,
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
    flex: 1,
    alignItems: "center",
    paddingTop: 16,
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

const mapStateToProps = (state: RootState) => ({
  authState: state.auth,
});

export default connect(mapStateToProps)(withRtc(RoomRecyclerClass));
