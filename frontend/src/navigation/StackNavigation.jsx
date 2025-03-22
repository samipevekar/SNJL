import { createStackNavigator } from "@react-navigation/stack";
import UserRegister from "../screens/UserAuth/UserRegister";
import UserVerify from "../screens/UserAuth/UserVerify";
import Home from "../screens/Home";
import AuthCheck from "../components/AuthCheck";
import UserLogin from "../screens/UserAuth/UserLogin";
import RecruiterRegister from "../screens/RecruiterAuth/RecruiterRegister";
import RecruiterLogin from "../screens/RecruiterAuth/RecruiterLogin";
import RecruiterVerify from "../screens/RecruiterAuth/RecruiterVerify";
import UserProfile from "../screens/UserAuth/UserProfile";
import EditProfile from "../screens/UserAuth/EditProfile";
import ChatScreen from "../screens/ChatScreen";
import PostReviewTab from "../components/PostReviewTab";
import RandomUser from "../screens/RandomUser";
import AllChatsScreen from "../screens/AllChatsScreen";
import ViewProfile from "../screens/ViewProfile";


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
      <Stack.Screen name="UserProfile" component={UserProfile} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
      <Stack.Screen name="ChatScreen" component={ChatScreen} />
      <Stack.Screen name="RandomUser" component={RandomUser} />
      <Stack.Screen name="AllChatsScreen" component={AllChatsScreen} />
      <Stack.Screen name="ViewProfile" component={ViewProfile} />
     
    </Stack.Navigator>
  );
};

export default StackNavigation;
