const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '..', 'node_modules', 'react-native-css-interop', 'babel.js');

try {
  if (fs.existsSync(targetFile)) {
    let content = fs.readFileSync(targetFile, 'utf8');
    
    // For Reanimated 4, the worklets plugin MUST be enabled/uncommented
    if (content.includes('// "react-native-worklets/plugin"')) {
      console.log('Patching react-native-css-interop/babel.js to ENABLE react-native-worklets/plugin for Reanimated 4...');
      
      content = content.replace(
        '// "react-native-worklets/plugin"',
        '"react-native-worklets/plugin"'
      );
      
      fs.writeFileSync(targetFile, content, 'utf8');
      console.log('Successfully enabled react-native-worklets/plugin in react-native-css-interop/babel.js!');
    } else {
      console.log('react-native-worklets/plugin is already enabled or configured.');
    }
  } else {
    console.log('react-native-css-interop/babel.js not found. Skipping patch.');
  }
} catch (error) {
  console.error('Failed to patch react-native-css-interop/babel.js:', error);
}
