import { createStackNavigator } from "@react-navigation/stack";
import SpleshScreen from "../Screens/SpleshScreen";
import LoginScreen from "../Screens/LoginScreen";
import { screenWidth } from "../utils/Helpers";

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
    </Stack.Navigator>
  );
}

export default Routes;
