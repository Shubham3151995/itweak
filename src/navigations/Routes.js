import { createStackNavigator } from "@react-navigation/stack";
import SpleshScreen from "../Screens/SpleshScreen";
import LoginScreen from "../Screens/LoginScreen";
import SignUp from "../Screens/SignUp";
import ResetPassword from "../Screens/ResetPassword";
import CreateProfile from "../Screens/CreateProfile";
import EditProfile from "../Screens/EditProfile";
import UploadVideo from "../Screens/UploadVideo";
import { screenWidth } from "../utils/Helpers";
import HomeScreen from "../Screens/HomeScreen";

const Stack = createStackNavigator();

function Routes() {
  return (
    <Stack.Navigator
      initialRouteName="SpleshScreen"
      screenOptions={({ route, navigation }) => ({
        headerShown: false,
        cardStyleInterpolator: ({ current, next, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [screenWidth, 0],
                  }),
                },
              ],
            },
          };
        },
      })}
    >
      <Stack.Screen name="SpleshScreen" component={SpleshScreen} />
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUp} />
      <Stack.Screen name="ResetPassword" component={ResetPassword} />
      <Stack.Screen name="CreateProfile" component={CreateProfile} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
      <Stack.Screen name="UploadVideo" component={UploadVideo} />
      <Stack.Screen name="Home" component={HomeScreen} />
    </Stack.Navigator>
  );
}

export default Routes;
