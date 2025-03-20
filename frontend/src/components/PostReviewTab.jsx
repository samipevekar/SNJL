// PostReviewTab.js
import * as React from 'react';
import {
  Animated,
  View,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
} from 'react-native';
import { TabView, SceneMap } from 'react-native-tab-view';
import PostList from './PostList';
import MockUserProfile from './MockUserProfile';
import { useSelector } from 'react-redux';

const { width, height } = Dimensions.get('window');
const scale = width / 375; // Match UserProfile's scale for responsiveness
const CONTENT_MARGIN = 16 * scale;

const FirstRoute = ({ postData, userData, theme }) => {
  console.log('postData in FirstRoute:', postData, 'userData:', userData); // Debug log
  return (
    <View style={[styles.container, { }]}>
      <View style={styles.tabContent}>
        <PostList posts={postData} theme={theme} user={userData} />
      </View>
    </View>
  );
};

const SecondRoute = ({ postData, userData, theme }) => {
  console.log('userData in SecondRoute:', userData); // Debug log
  return (
    <View style={[styles.container, ]}>
      <View style={styles.tabContent}>
        <MockUserProfile userData={userData} />
      </View>
    </View>
  );
};

export default class PostReviewTab extends React.Component {
  state = {
    index: 0,
    routes: [
      { key: 'first', title: 'Posts' },
      { key: 'second', title: 'Reviews' },
    ],
  };

  _handleIndexChange = (index) => this.setState({ index });

  _renderTabBar = (props) => {
    const inputRange = props.navigationState.routes.map((x, i) => i);
    const theme = useSelector((state) => state.theme.mode);

    return (
      <View style={[styles.tabBar, { paddingTop: StatusBar.currentHeight }]}>
        {props.navigationState.routes.map((route, i) => {
          const opacity = props.position.interpolate({
            inputRange,
            outputRange: inputRange.map((inputIndex) =>
              inputIndex === i ? 1 : 0.5
            ),
          });

          return (
            <TouchableOpacity
              style={[styles.tabItem, { paddingVertical: 5 * scale }]}
              onPress={() => this.setState({ index: i })}
            >
              <Animated.Text
                style={[
                  { opacity },
                  { fontSize: 16 * scale, fontWeight: '500', color: theme === 'light' ? '#000000' : '#FFFFFF' },
                ]}
              >
                {route.title}
              </Animated.Text>
            </TouchableOpacity>
          );
        })}
        <Animated.View
          style={[
            styles.tabBackground,
            {
              transform: [
                {
                  translateX: props.position.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, width / 2 - 20 * scale], // Adjust for margin and width
                  }),
                },
              ],
              backgroundColor: theme === 'light' ? '#34A853' : '#4CAF50',
            },
          ]}
        />
      </View>
    );
  };

  _renderScene = SceneMap({
    first: (props) => (
      <FirstRoute
        {...props}
        postData={this.props.postData}
        userData={this.props.userData}
        theme={useSelector((state) => state.theme.mode)}
      />
    ),
    second: (props) => (
      <SecondRoute
        {...props}
        postData={this.props.postData}
        userData={this.props.userData}
        theme={useSelector((state) => state.theme.mode)}
      />
    ),
  });

  render() {
    return (
      <TabView
        navigationState={this.state}
        renderScene={this._renderScene}
        renderTabBar={this._renderTabBar}
        onIndexChange={this._handleIndexChange}
        initialLayout={{ width: width }}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'relative',
    marginHorizontal: 20 * scale,
    zIndex: 1,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    width: 150 * scale + 40 * scale,
    marginRight: 10 * scale,
    height: 30 * scale,
  },
  tabBackground: {
    position: 'absolute',
    top: 0,
    width: 120 * scale,
    height: 30 * scale,
    borderRadius: 8 * scale,
    zIndex: 0,
    marginHorizontal: 20 * scale,
  },
  tabContent: {
    width: width,
    paddingHorizontal: CONTENT_MARGIN,
    flex: 1, // Ensure the content can expand
  },
});