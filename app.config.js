const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PREVIEW = process.env.APP_VARIANT === 'preview';

const getUniqueIdentifier = () => {
  if (IS_DEV) {
    return 'com.axel.vinkulove.dev';
  }
  if (IS_PREVIEW) {
    return 'com.axel.vinkulove.preview';
  }
  return 'com.axel.vinkulove';
};

const getAppName = () => {
  if (IS_DEV) {
    return 'Vinku-love (Dev)';
  }
  if (IS_PREVIEW) {
    return 'Vinku-love (Preview)';
  }
  return 'Vinku-love';
};

export default {
  expo: {
    name: getAppName(),
    slug: "vinku-love",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "dark",
    backgroundColor: "#12121A",
    icon: "./assets/logo.png",
    splash: {
      image: "./assets/logo.png",
      backgroundColor: "#12121A",
      resizeMode: "contain"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    android: {
      package: getUniqueIdentifier(),
      backgroundColor: "#12121A",
      adaptiveIcon: {
        foregroundImage: "./assets/logo.png",
        backgroundColor: "#12121A"
      },
      permissions: [
        "android.permission.RECORD_AUDIO"
      ]
    },
    plugins: [
      [
        "expo-image-picker",
        {
          "photosPermission": "Vinku-love necesita acceso a tus fotos para guardarlas en la cápsula del tiempo."
        }
      ],
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#FF8B7E",
          "androidMode": "default"
        }
      ]
    ],
    extra: {
      eas: {
        projectId: "04484de8-22a7-46cd-b0f9-87bc189d3945"
      }
    },
    owner: "deathtrooper"
  }
};
