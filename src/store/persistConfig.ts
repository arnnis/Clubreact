import AsyncStorage from "@react-native-async-storage/async-storage";
import { createMigrate } from "redux-persist";
import autoMergeLevel2 from "redux-persist/lib/stateReconciler/autoMergeLevel2";

const migrations = {};

export default {
  key: "root",
  version: 1,
  storage: AsyncStorage,
  whitelist: ["auth"],
  migrate: createMigrate(migrations, { debug: false }),
  stateReconciler: autoMergeLevel2,
  timeout: null,
};
