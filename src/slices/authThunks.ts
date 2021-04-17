import { APIResult } from "../models/api";
import req from "../utils/req";
import { authActions } from "./authSlice";

export const getMe = () => async (dispatch) => {
  const res = await req("/me", {
    method: "POST",
    body: {
      return_blocked_ids: false,
      timezone_identifier: "Asia/Tokyo",
      return_following_ids: false,
    },
  });
  const resJson: APIResult<any> = await res.json();
  if (resJson.success) {
    dispatch(
      authActions.setAuth({
        user_profile: resJson.user_profile,
        is_waitlisted: false,
      })
    );
  }
  console.log("me", resJson);
  return resJson;
};
