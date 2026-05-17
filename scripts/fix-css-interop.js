const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '..', 'node_modules', 'react-native-css-interop', 'babel.js');

try {
  if (fs.existsSync(targetFile)) {
    let content = fs.readFileSync(targetFile, 'utf8');
    
    // Check if the worklets plugin is present and not commented out
    if (content.includes('"react-native-worklets/plugin"')) {
      console.log('Patching react-native-css-interop/babel.js to remove react-native-worklets/plugin...');
      
      // Replace the hardcoded plugin with a commented version or remove it
      content = content.replace(
        '"react-native-worklets/plugin"',
        '// "react-native-worklets/plugin" (commented out by postinstall script for Reanimated 3 compatibility)'
      );
      
      fs.writeFileSync(targetFile, content, 'utf8');
      console.log('Successfully patched react-native-css-interop/babel.js!');
    } else {
      console.log('react-native-css-interop/babel.js is already patched or does not contain worklets plugin.');
    }
  } else {
    console.log('react-native-css-interop/babel.js not found. Skipping patch.');
  }
} catch (error) {
  console.error('Failed to patch react-native-css-interop/babel.js:', error);
}
