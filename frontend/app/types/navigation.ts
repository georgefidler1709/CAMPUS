import { StackNavigationProp } from '@react-navigation/stack';

export type RootStackParamList = {
  Profile: { userId: string };
};

export type ProfileScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Profile'
>;