import React, { Component } from "react";
import { ProfileScreenNavigationProp } from "../../types/navigation";
import { View, Text, Button } from "react-native";

interface ModalScreenProps {
    navigation: ProfileScreenNavigationProp;
}

class ModalScreen extends Component<ModalScreenProps, {}>{
    constructor(props: ModalScreenProps) {
        super(props)
    }
    
    render() {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontSize: 30 }}>This is a modal!</Text>
              <Button onPress={() => this.props.navigation.goBack()} title="Dismiss" />
            </View>
        );
    }
}

export default ModalScreen;