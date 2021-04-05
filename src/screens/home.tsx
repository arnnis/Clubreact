import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View, FlatList } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Screen from "../components/screen";
import { Channel, GetChannelsResult } from "../models/channel";
import req from "../utils/req";
import Flex from "../components/flex";

const Home = () => {
  const [channels, setChannels] = useState<Channel[]>();
  useEffect(() => {
    getChannels();
  }, []);

  const getChannels = async () => {
    const res = await req("/get_channels");
    const resJson: GetChannelsResult = await res.json();
    setChannels(resJson.channels);
  };

  const renderChannel = ({ item, index }: { item: Channel; index: number }) => (
    <View style={styles.channel}>
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
              {user.is_speaker && (
                <MaterialCommunityIcons
                  name="message-processing-outline"
                  size={14}
                  color="#9c9c9c"
                  style={{ marginLeft: 4 }}
                />
              )}
            </Flex>
          ))}
          <View style={styles.channelUsersStats}>
            <Text>
              {item.num_all}
              <MaterialCommunityIcons
                name="account"
                size={14}
                color="#9c9c9c"
                style={{ marginLeft: 4 }}
              />
              / {item.num_speakers}{" "}
              <MaterialCommunityIcons
                name="message-processing-outline"
                size={14}
                color="#9c9c9c"
                style={{ marginLeft: 4 }}
              />
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <Screen>
      <View style={styles.header}>
        <Image
          source={{
            uri:
              "https://clubhouseprod.s3.amazonaws.com:443/555026303_ba593aae-8fe8-4ae2-98be-24277fae5ebf_thumbnail_250x250",
          }}
          style={styles.avatar}
        />
      </View>
      <FlatList
        data={channels}
        renderItem={renderChannel}
        contentContainerStyle={styles.channelsContainer}
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
    backgroundColor: "#fff",
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
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
    fontSize: 15,
    color: "#49464A",
  },
  channelUsersStats: {
    marginTop: 8,
  },
});

export default Home;
