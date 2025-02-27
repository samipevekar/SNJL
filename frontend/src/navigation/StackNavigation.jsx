import { createStackNavigator } from "@react-navigation/stack";
import UserRegister from "../screens/UserAuth/UserRegister";
import UserVerify from "../screens/UserAuth/UserVerify";
import Home from "../screens/Home";
import AuthCheck from "../components/AuthCheck";
import UserLogin from "../screens/UserAuth/UserLogin";
import RecruiterRegister from "../screens/RecruiterAuth/RecruiterRegister";
import RecruiterLogin from "../screens/RecruiterAuth/RecruiterLogin";
import RecruiterVerify from "../screens/RecruiterAuth/RecruiterVerify";

const Stack = createStackNavigator();

const StackNavigation = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, animation: "slide_from_right" }}
      initialRouteName="AuthCheck"
    >
      <Stack.Screen name="UserRegister" component={UserRegister} />
      <Stack.Screen name="UserLogin" component={UserLogin} />
      <Stack.Screen name="UserVerify" component={UserVerify} />
      <Stack.Screen name="RecruiterRegister" component={RecruiterRegister} />
      <Stack.Screen name="RecruiterLogin" component={RecruiterLogin} />
      <Stack.Screen name="RecruiterVerify" component={RecruiterVerify} />
      <Stack.Screen name="Home" component={Home} options={{animation:'fade'}} />
      <Stack.Screen name="AuthCheck" component={AuthCheck} />
    </Stack.Navigator>
  );
};

export default StackNavigation;
