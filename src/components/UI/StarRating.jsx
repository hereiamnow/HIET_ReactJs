// components/UI/StarRating.jsx
import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating, onRatingChange, readonly = false, size = 'w-5 h-5' }) => {
    const stars = [1, 2, 3, 4, 5];

    // Implementation for 0.5 increments
    const handleStarClick = (star, isHalf) => {
        const newRating = isHalf ? star - 0.5 : star;
        onRatingChange(newRating);
    };

    return (
        <div className="flex items-center gap-1">
            {stars.map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={readonly}
                    onClick={() => !readonly && onRatingChange(star)}
                    className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
                >
                    <Star
                        className={`${size} ${star <= rating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-gray-400'
                            } transition-colors`}
                    />
                </button>
            ))}
            {rating > 0 && (
                <span className="ml-2 text-sm text-gray-400">
                    {rating}/5
                </span>
            )}
        </div>
    );
};

export default StarRating;
