import { createStackNavigator } from "@react-navigation/stack"
import Register from "../screens/Register"

const Stack = createStackNavigator()

const StackNavigation = () => {
  return (
    <Stack.Navigator>
        <Stack.Screen options={{headerShown:false}} name="Register" component={Register} />
    </Stack.Navigator>
  )
}

export default StackNavigation