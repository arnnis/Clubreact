import React from "react";
import {
  ActivityIndicator,
  Dimensions,
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
import { AllTopics, MainTopic, Topic } from "../models/explore";

const dims = Dimensions.get("window");

const Explore = () => {
  const {
    isLoading: loadingAllTopics,
    error,
    data: topics,
    refetch,
  } = useQuery("topics", () => getAllTopics());
  const getAllTopics = async () => {
    const res = await req("/get_all_topics", {
      method: "GET",
    });
    const resJson: APIResult<{ topics: MainTopic[] }> = await res.json();
    console.log("all topics", resJson);
    return resJson.topics;
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
          <View></View>
        </View>

        <Text style={styles.sectionTitle}>FIND CONVERSATIONS ABOUT...</Text>
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
    height: 250,
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
