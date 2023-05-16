import { createStackNavigator } from "@react-navigation/stack";
import SpleshScreen from "../Screens/SpleshScreen";

const Stack = createStackNavigator();

function Routes() {
  return (
    <Stack.Navigator
      initialRouteName="SpleshScreen"
      screenOptions={({ route, navigation }) => ({
        headerShown: false,
      })}
    >
      <Stack.Screen name="SpleshScreen" component={SpleshScreen} />
    </Stack.Navigator>
  );
}

export default Routes;
