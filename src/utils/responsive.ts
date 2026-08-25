import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Dimensions } from 'react-native';

/**
 * Helper to determine if the device is a tablet.
 * We consider devices with a screen width >= 768 to be tablets.
 */
export const isTablet = () => {
  const { width } = Dimensions.get('window');
  return width >= 768;
};

export {
  scale,
  verticalScale,
  moderateScale,
  wp,
  hp
};
