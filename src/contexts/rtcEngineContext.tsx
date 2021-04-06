import React, { Component, FC, useContext } from "react";
import RtcEngine, { RtcEngineConfig } from "react-native-agora";
import { connect } from "react-redux";
import { RootState } from "../store/store";

export const RtcEngineContext = React.createContext({ engine: null } as {
  engine: null | RtcEngine;
});

export const useRtcEngine = () => useContext(RtcEngineContext);

type RtcEngineProviderProps = ReturnType<typeof mapStateToProps>;

class RtcEngineProvider extends Component<RtcEngineProviderProps> {
  state = {
    rtcEngine: null as null | RtcEngine,
  };

  componentDidMount() {
    if (this.props.authState.auth_token) this.initRtc();
  }

  componentDidUpdate(prevProps: RtcEngineProviderProps) {
    // on login
    if (!prevProps.authState.auth_token && this.props.authState.auth_token) {
      this.initRtc();
    }

    // on logout
    if (prevProps.authState.auth_token && !this.props.authState.auth_token) {
      this.state.rtcEngine?.destroy();
      console.log("destroyed rtc engine, reason: logout");
    }
  }

  initRtc = async () => {
    console.log("connecting to rtc engine");
    try {
      let rtcEngine = await RtcEngine.createWithConfig(
        new RtcEngineConfig("938de3e8055e42b281bb8c6f69c21f78")
      );
      this.setState({ rtcEngine });
      console.log("rtc engine initialized");
    } catch (err) {
      console.log("error initializing rtc engine", err);
    }
  };

  render() {
    return (
      <RtcEngineContext.Provider value={{ engine: this.state.rtcEngine }}>
        {this.props.children}
      </RtcEngineContext.Provider>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  authState: state.auth,
});

export default connect(mapStateToProps)(RtcEngineProvider);
