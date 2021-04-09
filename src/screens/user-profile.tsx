import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { FC } from "react";
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useQuery } from "react-query";
import defaultAvatar from "../assets/default-avatar";
import Flex from "../components/flex";
import Screen from "../components/screen";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../contexts/theme/context";
import { APIResult } from "../models/api";
import { UserProfile } from "../models/user";
import { StackParamList } from "../navigator";
import req from "../utils/req";
import dayjs from "dayjs";

interface Props {
  route: RouteProp<StackParamList, "UserProfile">;
  navigation: StackNavigationProp<StackParamList, "UserProfile">;
}

const UserProfileScreen: FC<Props> = ({ route }) => {
  const { isLoading, error, data, refetch } = useQuery(
    "user_profile" + route.params.user_id,
    () => getUser()
  );
  const { theme } = useTheme();

  const getUser = async () => {
    const res = await req("/get_profile", {
      method: "POST",
      body: { user_id: route.params.user_id },
    });
    const resJson: APIResult<{ user_profile: UserProfile }> = await res.json();
    console.log("user profile", resJson);
    return resJson.user_profile;
  };

  return (
    <Screen>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        contentContainerStyle={styles.container}
      >
        <Image
          source={{ uri: data?.photo_url ?? defaultAvatar }}
          style={styles.avatar}
        />
        <Text style={[styles.userName, { color: theme.fg }]}>{data?.name}</Text>
        <Text style={[styles.username, { color: theme.fg2 }]}>
          @{data?.username}
        </Text>
        <Flex direction="row" style={{ marginTop: 16 }}>
          <Text style={[styles.followCount, { color: theme.fg2 }]}>
            <Text style={[styles.followCountNumber, { color: theme.fg }]}>
              {data?.num_followers}
            </Text>{" "}
            followers
          </Text>

          <Text
            style={[styles.followCount, { marginLeft: 16, color: theme.fg2 }]}
          >
            <Text style={[styles.followCountNumber, { color: theme.fg }]}>
              {data?.num_following}
            </Text>{" "}
            followings
          </Text>
        </Flex>
        <Text style={[styles.bio, { color: theme.fg2 }]}>{data?.bio}</Text>
        {data?.twitter ||
          (data?.instagram && (
            <Flex direction="row" style={{ marginTop: 16 }}>
              {data?.twitter && (
                <Text
                  style={[
                    styles.followCount,
                    { color: theme.fg2, marginRight: 16 },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="twitter"
                    color="#5B549F"
                    size={20}
                  />{" "}
                  {data?.twitter}
                </Text>
              )}
              {data?.instagram && (
                <Text style={[styles.followCount, { color: theme.fg2 }]}>
                  <MaterialCommunityIcons
                    name="instagram"
                    color="#5B549F"
                    size={20}
                  />{" "}
                  {data?.instagram}
                </Text>
              )}
            </Flex>
          ))}

        <View style={styles.inviterContainer}>
          <Image
            source={{
              uri: data?.invited_by_user_profile.photo_url ?? defaultAvatar,
            }}
            style={styles.inviterAvatar}
          />
          <Flex style={{ marginLeft: 8 }}>
            <Text style={[styles.joinDate, { color: theme.fg2 }]}>
              Joined {dayjs(data?.time_created).format("MMM DD, YYYY")}
            </Text>
            <Text style={[styles.inviter, { color: theme.fg2 }]}>
              Nominated by{" "}
              <Text style={{ color: theme.fg }}>
                {data?.invited_by_user_profile.name}
              </Text>
            </Text>
          </Flex>
        </View>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 32,
  },
  userName: {
    fontFamily: "Nunito-Bold",
    fontSize: 16,
    marginTop: 16,
  },
  username: {
    fontFamily: "Nunito-Regular",
    fontSize: 14,
    marginTop: 8,
  },
  followCount: {
    fontFamily: "Nunito-Regular",
    fontSize: 15,
  },
  followCountNumber: {
    fontFamily: "Nunito-Bold",
    fontSize: 17,
  },
  bio: {
    marginTop: 16,
    fontFamily: "Nunito-SemiBold",
    fontSize: 14,
  },
  inviterContainer: {
    marginTop: 40,
    flexDirection: "row",
  },
  inviterAvatar: {
    width: 40,
    height: 40,
    borderRadius: 16,
  },
  joinDate: {
    fontFamily: "Nunito-SemiBold",
  },
  inviter: {
    fontFamily: "Nunito-SemiBold",
  },
});

export default UserProfileScreen;
