import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Spacing } from '../constants/Spacing';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  size = 20,
  onRatingChange,
  readonly = true,
}) => {
  return (
    <View style={styles.container}>
      {[...Array(maxStars)].map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= rating;
        const isHalf = starValue - 0.5 <= rating && !isFilled;

        const iconName = isFilled ? 'star' : isHalf ? 'star-half' : 'star-outline';

        return (
          <TouchableOpacity
            key={index}
            disabled={readonly}
            onPress={() => onRatingChange && onRatingChange(starValue)}
            style={styles.star}
          >
            <Ionicons name={iconName} size={size} color={isFilled || isHalf ? Colors.accent : Colors.muted} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginRight: 2,
  },
});

export default StarRating;
