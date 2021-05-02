import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  LayoutAnimation,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Screen from "../components/screen";
import req from "../utils/req";
import { APIResult } from "../models/api";
import { useQuery } from "react-query";
import { ScrollView } from "react-native-gesture-handler";
import { MainTopic, Topic } from "../models/explore";
import { User } from "../models/channel";
import defaultAvatar from "../assets/default-avatar";
import Flex from "../components/flex";
import Touchable from "../components/touchable";

const dims = Dimensions.get("window");

const Explore = () => {
  const {
    isLoading: loadingAllTopics,

    data: topics,
  } = useQuery("topics", () => getAllTopics());
  const {
    isLoading: loadingSuggestedFollows,
    data: suggestedFollows,
  } = useQuery("suggestedFollows", () => getSuggestedFollows());
  const [numFollowsShown, setNumFollowsShown] = useState(3);

  const getAllTopics = async () => {
    const res = await req("/get_all_topics", {
      method: "GET",
    });
    const resJson: APIResult<{ topics: MainTopic[] }> = await res.json();
    console.log("all topics", resJson);
    return resJson.topics;
  };

  const getSuggestedFollows = async () => {
    const res = await req("/get_suggested_follows_all", {
      method: "GET",
    });
    const resJson: APIResult<{ users: User[] }> = await res.json();
    console.log("all suggested follows", resJson);
    return resJson.users;
  };

  const showMoreFollow = () => {
    setNumFollowsShown(numFollowsShown + 7);
    LayoutAnimation.easeInEaseOut();
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.searchInputContainer}>
        <MaterialCommunityIcons name="magnify" size={22} />
        <TextInput placeholder="Find People and Clubs" />
      </View>
      <ScrollView>
        <Text style={styles.sectionTitle}>PEOPLE TO FOLLOW</Text>
        <View style={styles.peopleToFollowContainer}>
          {!loadingSuggestedFollows &&
            suggestedFollows?.slice(0, numFollowsShown)?.map((user) => (
              <View style={styles.userContainer}>
                <Image
                  source={{ uri: user.photo_url ?? defaultAvatar }}
                  style={styles.userAvatar}
                />
                <Flex style={{ marginLeft: 16 }}>
                  <Text style={styles.userFullName}>{user.name}</Text>
                  <Text>@{user.username}</Text>
                </Flex>

                <Touchable style={styles.followBtn}>
                  <Text style={styles.followBtnTitle}>Follow</Text>
                </Touchable>
              </View>
            ))}
          <Touchable style={styles.showMoreFollowsBtn} onPress={showMoreFollow}>
            <Text style={styles.showMoreFollowsBtnTitle}>Show more people</Text>
          </Touchable>
        </View>

        <Text style={[styles.sectionTitle, {}]}>
          FIND CONVERSATIONS ABOUT...
        </Text>
        <View style={styles.topicsContainer}>
          {loadingAllTopics ? (
            <ActivityIndicator />
          ) : (
            topics?.map((topic) => (
              <View style={styles.topic}>
                <Text style={styles.topicTitle}>{topic.title}</Text>
                <Text style={styles.topicInfo} numberOfLines={2}>
                  {topic.topics.map((t) => t.abbreviated_title).join(", ")}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {},
  searchInputContainer: {
    backgroundColor: "#E1E0D9",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontFamily: "Nunito-Bold",
    marginLeft: 16,
    marginTop: 24,
    marginBottom: 8,
    color: "#8D866C",
  },
  peopleToFollowContainer: {
    width: "100%",
    backgroundColor: "#fff",
    paddingVertical: 16,
    marginBottom: 16,
  },
  userContainer: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 16,
    flexDirection: "row",
    marginBottom: 16,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 28,
  },
  userFullName: {
    fontFamily: "Nunito-Bold",
    fontSize: 15,
    color: "#070707",
  },
  username: {
    fontFamily: "Nunito-Regular",
  },
  followBtn: {
    borderWidth: 2,
    borderColor: "#6180B0",
    borderRadius: 360,
    paddingHorizontal: 16,
    paddingVertical: 3,
    marginLeft: "auto",
  },
  followBtnTitle: {
    fontFamily: "Nunito-Regular",
    color: "#6180B0",
  },
  showMoreFollowsBtn: {
    backgroundColor: "#E7E3D5",
    borderRadius: 360,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: "center",
    position: "absolute",
    bottom: -16,
  },
  showMoreFollowsBtnTitle: {
    color: "#766B50",
    fontFamily: "Nunito-Regular",
  },
  topicsContainer: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    paddingLeft: 16,
  },
  topic: {
    width: dims.width / 2 - 24,
    marginRight: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: "rgba(0,0,0,5)",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 0.1,
    elevation: 1,
    padding: 10,
  },
  topicTitle: {
    fontFamily: "Nunito-Bold",
    color: "#353535",
    fontSize: 15,
  },
  topicInfo: {
    fontFamily: "Nunito-SemiBold",
    color: "#808080",
    marginTop: 4,
  },
});

export default Explore;
