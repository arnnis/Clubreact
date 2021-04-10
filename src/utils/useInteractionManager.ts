import React, { useEffect, useState } from "react";
import { InteractionManager } from "react-native";

const useInteractionManger = () => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    InteractionManager.runAfterInteractions().then(() => {
      setLoading(false);
    });
  }, []);
  return loading;
};

export default useInteractionManger;
