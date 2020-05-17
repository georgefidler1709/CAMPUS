import React, { Component } from "react";
import { View, TextInput, Text, TouchableOpacity, Alert } from "react-native";
import EStyleSheet from "react-native-extended-stylesheet";
import { Colors } from "../../constants";
import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import { ProfileScreenNavigationProp } from "../../types/navigation";
import { createUser } from "../../api";
import { setUid, setSplash } from "../../reduxstore/actions/auth";
import Dimensions from "../../styles/Dimensions";
import { BallIndicator } from "react-native-indicators";
import { Button, Icon } from "react-native-elements";

import { connect } from "react-redux";

interface LoginProps {
  navigation: ProfileScreenNavigationProp;
}

interface LoginState {
  checking: boolean;
  email: string;
  password: string;
  emailPlaceHolder: string;
  passwordPlaceHolder: string;
}

// screen used for login/create account
// uses google firebase authentication and connecting
// the results to our backend
class Login extends Component<LoginProps, LoginState> {
  constructor(props: LoginProps) {
    super(props);
    this.state = {
      checking: false,
      email: "",
      password: "",
      emailPlaceHolder: "Email",
      passwordPlaceHolder: "Password",
    };
  }

  setEmail = (email: string) => {
    this.setState({ email });
  };

  setPassword = (password: string) => {
    this.setState({ password });
  };

  setEmailPlaceHolder = (emailPlaceHolder: string) => {
    this.setState({ emailPlaceHolder });
  };

  setPasswordPlaceHolder = (passwordPlaceHolder: string) => {
    this.setState({ passwordPlaceHolder });
  };

  alertMessage = (): string => {
    if (this.state.email === "" && this.state.password === "") {
      return "Please enter an email and password";
    } else if (this.state.email === "") {
      return "Please enter an email";
    } else if (this.state.password === "") {
      return "Please enter a password";
    } else {
      return "";
    }
  };

  // use firebase to check if the user information exists.
  // if so, log the user in
  login = () => {
    this.setState({ checking: true });
    firebase
      .auth()
      .signInWithEmailAndPassword(this.state.email, this.state.password)
      .then((creds) => {
        creds.user?.uid;
      })
      .catch((error) => {
        Alert.alert("Could not log in", this.alertMessage());
        this.setState({ checking: false });
      });
  };

  // create a new account
  // firebase will check if this user information is free
  // and if so will create a new user
  // we then use the credentials from firebase to add a new user to our database
  createAccount = async () => {
    this.setState({ checking: true });
    firebase
      .auth()
      .createUserWithEmailAndPassword(this.state.email, this.state.password)
      .then(async (creds) => {
        createUser({ name: this.state.email });
      })
      .catch((error) => {
        Alert.alert("Could not create account");
        this.setState({ checking: false });
      });
  };

  render() {
    if (this.state.checking) {
      return (
        <View style={styles.container}>
          <BallIndicator size={50} color={Colors.PrimaryDarkBlue} />
        </View>
      );
    } else {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Campus</Text>
          <TextInput
            style={styles.input}
            onChangeText={this.setEmail}
            value={this.state.email}
            placeholder={this.state.emailPlaceHolder}
            onFocus={() => this.setEmailPlaceHolder("")}
            onBlur={() => this.setEmailPlaceHolder("Email")}
          />
          <TextInput
            style={styles.input}
            onChangeText={this.setPassword}
            value={this.state.password}
            placeholder={this.state.passwordPlaceHolder}
            onFocus={() => this.setPasswordPlaceHolder("")}
            onBlur={() => this.setPasswordPlaceHolder("Password")}
            secureTextEntry
          />
          <Button
            title="Log In"
            onPress={this.login}
            containerStyle={styles.btnContainerStyle}
            buttonStyle={{
              height: 60,
              backgroundColor: Colors.PrimaryLightBlue,
            }}
          />
          <Button
            title="Create Account"
            onPress={this.createAccount}
            containerStyle={styles.btnContainerStyle}
            type="outline"
            buttonStyle={{
              height: 50,
            }}
          />
        </View>
      );
    }
  }
}

const mapStateToProps = (state) => {
  const { uid } = state.auth;
  return {
    uid,
  };
};

const mapDispatchToProps = {
  setUid,
  setSplash,
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "$white",
    paddingHorizontal: "10%",
    justifyContent: "center",
    alignItems: "center",
  },
  subContainer: {
    flex: 1,
    width: "80%",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  titleContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  btnContainerStyle: {
    width: "100%",
    marginVertical: 18,
  },
  title: {
    color: Colors.PrimaryDarkBlue,
    fontSize: 45,
    fontWeight: "300",
    marginBottom: 30,
  },
  input: {
    borderRadius: 5,
    borderWidth: 1.2,
    borderColor: Colors.PrimaryDarkBlue,
    color: Colors.PrimaryDarkBlue,
    fontSize: 18,
    width: "100%",
    margin: 18,
    paddingHorizontal: 18,
    paddingVertical: 7,
  },
});
