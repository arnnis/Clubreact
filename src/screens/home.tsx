import React, { FC, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  View,
  FlatList,
  RefreshControl,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Screen from "../components/screen";
import { Channel, GetChannelsResult } from "../models/channel";
import req from "../utils/req";
import Flex from "../components/flex";
import { useQuery } from "react-query";
import { TouchableOpacity } from "react-native-gesture-handler";
import { CommonActions, useNavigation } from "@react-navigation/core";
import { authActions } from "../slices/authSlice";
import { StackNavigationProp } from "@react-navigation/stack";
import { StackParamList } from "../navigator";
import { useDispatch } from "react-redux";

interface Props {
  navigation: StackNavigationProp<StackParamList, "Home">;
}

const Home: FC<Props> = ({ navigation }) => {
  const { isLoading, error, data, refetch } = useQuery("channels", () =>
    getChannels()
  );
  const { navigate, reset } = useNavigation();
  const dispatch = useDispatch();

  const getChannels = async () => {
    const res = await req("/get_channels");
    const resJson: GetChannelsResult = await res.json();
    return resJson;
  };

  const logout = () => {
    dispatch(authActions.logout());
  };

  const renderChannel = ({ item, index }: { item: Channel; index: number }) => (
    <TouchableOpacity
      key={item.channel}
      style={styles.channel}
      onPress={() =>
        navigate("Room", { channel_id: item.channel_id, channel: item.channel })
      }
    >
      <Text style={styles.channelTopic}>{item.topic}</Text>
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
            <Flex direction="row" align="center">
              <Text style={styles.channelUserName}>{user.name}</Text>
              {false && (
                <MaterialCommunityIcons
                  name="message-processing-outline"
                  size={14}
                  color="#9c9c9c"
                />
              )}
            </Flex>
          ))}
          <View style={styles.channelUsersStatsContainer}>
            <Text style={styles.channelUsersStats}>
              {item.num_all}{" "}
              <MaterialCommunityIcons
                name="account"
                size={14}
                color="#9c9c9c"
              />
              {" " + "/" + " "}
              {item.num_speakers}{" "}
              <MaterialCommunityIcons
                name="message-processing"
                size={12.5}
                color="#9c9c9c"
                style={{ marginLeft: 4 }}
              />
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <Screen>
      <View style={styles.header}>
        <TouchableOpacity onPress={logout}>
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
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 55,
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
