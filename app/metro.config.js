const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Nécessaire pour résoudre les sous-modules "exports"-only de certains
// packages (ex: firebase/auth, firebase/firestore) sous Metro Web.
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
