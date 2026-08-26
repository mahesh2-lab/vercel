import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Dimensions } from 'react-native';

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

