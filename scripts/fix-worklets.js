const fs = require('fs');
const path = require('path');

const srcFile = path.join(__dirname, '..', 'node_modules', 'react-native-worklets', 'src', 'WorkletsModule', 'NativeWorklets.native.ts');
const libFile = path.join(__dirname, '..', 'node_modules', 'react-native-worklets', 'lib', 'module', 'WorkletsModule', 'NativeWorklets.native.js');

function patchFile(filePath, isJS) {
  try {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Look for the original installTurboModule call
      if (content.includes('WorkletsTurboModule?.installTurboModule(bundleModeEnabled);') && !content.includes('catch (e)')) {
        console.log(`Patching ${filePath} to add installTurboModule argument fallback...`);
        
        let target, replacement;
        
        if (!isJS) {
          // TypeScript source file path
          target = `    if (
      global.__workletsModuleProxy === undefined &&
      globalThis.__RUNTIME_KIND === RuntimeKind.ReactNative
    ) {
      WorkletsTurboModule?.installTurboModule(bundleModeEnabled);
      if (__DEV__ && bundleModeEnabled) {
        console.log(
          '[Worklets] Bundle mode initialization: Downloaded the bundle for Worklet Runtimes.'
        );
      }
    }`;
          
          replacement = `    if (
      global.__workletsModuleProxy === undefined &&
      globalThis.__RUNTIME_KIND === RuntimeKind.ReactNative
    ) {
      try {
        WorkletsTurboModule?.installTurboModule(bundleModeEnabled);
      } catch (e: any) {
        if (
          e &&
          typeof e.message === 'string' &&
          (e.message.includes('arguments') || e.message.includes('argument'))
        ) {
          try {
            // @ts-ignore
            WorkletsTurboModule?.installTurboModule();
          } catch (err) {
            console.error(
              '[Worklets] Failed to fallback call installTurboModule:',
              err
            );
            throw e;
          }
        } else {
          throw e;
        }
      }
      if (__DEV__ && bundleModeEnabled) {
        console.log(
          '[Worklets] Bundle mode initialization: Downloaded the bundle for Worklet Runtimes.'
        );
      }
    }`;
        } else {
          // JavaScript ESM compiled file path
          target = `    if (global.__workletsModuleProxy === undefined && globalThis.__RUNTIME_KIND === RuntimeKind.ReactNative) {
      WorkletsTurboModule?.installTurboModule(bundleModeEnabled);
      if (__DEV__ && bundleModeEnabled) {
        console.log('[Worklets] Bundle mode initialization: Downloaded the bundle for Worklet Runtimes.');
      }
    }`;
          
          replacement = `    if (global.__workletsModuleProxy === undefined && globalThis.__RUNTIME_KIND === RuntimeKind.ReactNative) {
      try {
        WorkletsTurboModule?.installTurboModule(bundleModeEnabled);
      } catch (e) {
        if (
          e &&
          typeof e.message === 'string' &&
          (e.message.includes('arguments') || e.message.includes('argument'))
        ) {
          try {
            WorkletsTurboModule?.installTurboModule();
          } catch (err) {
            console.error(
              '[Worklets] Failed to fallback call installTurboModule:',
              err
            );
            throw e;
          }
        } else {
          throw e;
        }
      }
      if (__DEV__ && bundleModeEnabled) {
        console.log('[Worklets] Bundle mode initialization: Downloaded the bundle for Worklet Runtimes.');
      }
    }`;
        }
        
        if (content.includes(target)) {
          content = content.replace(target, replacement);
          fs.writeFileSync(filePath, content, 'utf8');
          console.log(`Successfully patched ${filePath}!`);
        } else {
          console.log(`Could not find the exact pattern to replace in ${filePath}.`);
        }
      } else {
        console.log(`${filePath} is already patched or lacks the target pattern.`);
      }
    } else {
      console.log(`${filePath} not found. Skipping.`);
    }
  } catch (error) {
    console.error(`Failed to patch ${filePath}:`, error);
  }
}

patchFile(srcFile, false);
patchFile(libFile, true);
