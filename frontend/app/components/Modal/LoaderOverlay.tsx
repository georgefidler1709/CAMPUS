import * as React from "react";
import { Modal, View } from "react-native";
import { BallIndicator } from "react-native-indicators";
import EStyleSheet from "react-native-extended-stylesheet";

interface LoadingOverlayProps {
  visible: boolean;
}

export default (props: LoadingOverlayProps) => (
  <Modal visible={props.visible} transparent={true} animationType="fade">
    <View style={styles.loadingModalStyle}>
      <BallIndicator color="white" size={50} />
    </View>
  </Modal>
);

const styles = EStyleSheet.create({
  loadingModalStyle: {
    flex: 1,
    backgroundColor: "black",
    opacity: 0.5,
    justifyContent: "center",
    alignItems: "center",
  },
});
