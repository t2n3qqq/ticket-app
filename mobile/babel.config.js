module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['.'],
        extensions: [
          '.ios.ts',
          '.android.ts',
          '.ts',
          '.ios.tsx',
          '.android.tsx',
          '.tsx',
          '.jsx',
          '.js',
          '.json',
        ],
        alias: {
          services: './src/services',
          // 'crossplatform/reducers': './react-crossplatform/redux/reducers',
          // 'crossplatform/static': './react-crossplatform/static-content',
          // crossplatform: './react-crossplatform',
          // 'android/components': './react-android/components',
          // 'android/static': './react-android/static-content',
          // android: './react-android',
          // 'ios/reducers': './react-ios/redux/reducers',
          // 'ios/components': './react-ios/components',
          // 'ios/static': './react-ios/static-content',
          // ios: './react-ios',
        },
      },
    ],
  ],
};
