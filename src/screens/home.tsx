import React, { FC, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  View,
  FlatList,
  RefreshControl,
  Platform,
  StatusBar,
  TouchableOpacity,
  TouchableNativeFeedback,
  processColor,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Screen from "../components/screen";
import { Channel, GetChannelsResult } from "../models/channel";
import req from "../utils/req";
import Flex from "../components/flex";
import { useQuery } from "react-query";
import { CommonActions, useNavigation } from "@react-navigation/core";
import { authActions } from "../slices/authSlice";
import { StackNavigationProp } from "@react-navigation/stack";
import { StackParamList } from "../navigator";
import { useDispatch, useSelector } from "react-redux";
import Touchable from "../components/touchable";
import { useTheme } from "../contexts/theme/context";
import { RootState } from "../store/store";
import RoomMiniPlayer from "../components/room-mini-player";

interface Props {
  navigation: StackNavigationProp<StackParamList, "Home">;
}

const Home: FC<Props> = ({ navigation }) => {
  const { isLoading, error, data, refetch } = useQuery("channels", () =>
    getChannels()
  );
  const authState = useSelector((state: RootState) => state.auth);
  const { navigate, reset } = useNavigation();
  const dispatch = useDispatch();
  const { theme, toggleTheme } = useTheme();

  const getChannels = async () => {
    const res = await req("/get_channels");
    const resJson: GetChannelsResult = await res.json();
    return resJson;
  };

  const logout = () => {
    dispatch(authActions.logout());
  };

  const renderChannel = ({ item, index }: { item: Channel; index: number }) => (
    <Touchable
      key={item.channel}
      onPress={() =>
        navigate("Room", { channel_id: item.channel_id, channel: item.channel })
      }
      style={[styles.channel, { backgroundColor: theme.bg2 }]}
    >
      <Text style={[styles.channelTopic, { color: theme.fg }]}>
        {item.topic}
      </Text>
      <View style={styles.channelBodyContainer}>
        <View style={{ width: 72, height: 72, marginRight: 16 }}>
          <Image
            source={{ uri: item.users[0]?.photo_url }}
            style={[styles.channelUserAvatar, styles.channelUser1Avatar]}
          />

          <Image
            source={{ uri: item.users[1]?.photo_url }}
            style={[styles.channelUserAvatar]}
          />
        </View>
        <View>
          {item.users.map((user) => (
            <Flex key={user.user_id} direction="row" align="center">
              <Text style={[styles.channelUserName, { color: theme.fg }]}>
                {user.name}
              </Text>
              {false && (
                <MaterialCommunityIcons
                  name="message-processing-outline"
                  size={14}
                  color={theme.fg2}
                />
              )}
            </Flex>
          ))}
          <View style={styles.channelUsersStatsContainer}>
            <Text style={[styles.channelUsersStats, { color: theme.fg2 }]}>
              {item.num_all}{" "}
              <MaterialCommunityIcons
                name="account"
                size={14}
                color={theme.fg2}
              />
              {" " + "/" + " "}
              {item.num_speakers}{" "}
              <MaterialCommunityIcons
                name="message-processing"
                size={12.5}
                color={theme.fg2}
                style={{ marginLeft: 4 }}
              />
            </Text>
          </View>
        </View>
      </View>
    </Touchable>
  );

  return (
    <Screen
      style={{
        paddingTop: Platform.select({
          android: StatusBar.currentHeight,
          default: 0,
        }),
      }}
    >
      <View style={styles.header}>
        <Touchable onPress={toggleTheme} style={{ marginRight: 16 }}>
          <MaterialCommunityIcons
            name="theme-light-dark"
            size={28}
            color={theme.fg}
          />
        </Touchable>
        <TouchableOpacity
          onPress={() =>
            navigate("UserProfile", {
              user_id: authState.user_profile?.user_id,
              user: authState.user_profile,
            })
          }
        >
          <Image
            source={{
              uri:
                "https://clubhouseprod.s3.amazonaws.com:443/555026303_ba593aae-8fe8-4ae2-98be-24277fae5ebf_thumbnail_250x250",
            }}
            style={styles.avatar}
          />
        </TouchableOpacity>
      </View>
      <FlatList
        data={data?.channels}
        renderItem={renderChannel}
        contentContainerStyle={styles.channelsContainer}
        keyExtractor={(item) => item.channel}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
      />
      <RoomMiniPlayer />
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 64,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  avatar: {
    height: 32,
    width: 32,
    backgroundColor: "red",
    borderRadius: 22,
    marginLeft: "auto",
    marginRight: 16,
  },
  channelsContainer: {
    paddingHorizontal: 16,
  },
  channel: {
    width: "100%",
    backgroundColor: "#FEFCFF",
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: "rgba(0,0,0,5)",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 0.1,

    elevation: 1,
  },
  channelTopic: {
    fontFamily: "Nunito-Bold",
    color: "#454245",
    fontSize: 15,
  },
  channelBodyContainer: {
    flexDirection: "row",
    marginTop: 16,
  },
  channelUserAvatar: {
    height: 40,
    width: 40,
    borderRadius: 16,
  },
  channelUser1Avatar: {
    position: "absolute",
    top: 16,
    right: 0,
  },
  channelUser2Avatar: {
    position: "absolute",
    bottom: 16,
    left: 0,
  },
  channelUserName: {
    fontFamily: "Nunito-SemiBold",
    fontSize: 17,
    color: "#49464A",
  },
  channelUsersStatsContainer: {
    marginTop: 8,
  },
  channelUsersStats: {
    fontFamily: "Nunito-SemiBold",
    color: "#49464A",
  },
});

export default Home;
