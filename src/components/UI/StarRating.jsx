// components/UI/StarRating.jsx
import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating, onRatingChange, readonly = false, size = 'w-5 h-5' }) => {
    const stars = [1, 2, 3, 4, 5];

    // Validate and normalize rating to allowed values: 0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5
    const validateRating = (value) => {
        if (value <= 0) return 0;
        if (value >= 5) return 5;
        // Round to nearest 0.5
        return Math.round(value * 2) / 2;
    };

    const handleStarClick = (star, event) => {
        if (readonly) return;
        
        const rect = event.currentTarget.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const starWidth = rect.width;
        const isLeftHalf = clickX < starWidth / 2;
        
        let newRating;
        if (isLeftHalf) {
            // Clicked left half - set to half star
            newRating = star - 0.5;
        } else {
            // Clicked right half - set to full star
            newRating = star;
        }
        
        // Validate the rating
        const validatedRating = validateRating(newRating);
        onRatingChange(validatedRating);
    };

    const renderStar = (star) => {
        const isFull = star <= rating;
        const isHalf = star - 0.5 === rating;
        
        return (
            <button
                key={star}
                type="button"
                disabled={readonly}
                onClick={(e) => handleStarClick(star, e)}
                className={`relative ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
            >
                {/* Background star (empty) */}
                <Star className={`${size} text-gray-400 transition-colors`} />
                
                {/* Foreground star (filled) */}
                <Star
                    className={`${size} absolute top-0 left-0 transition-colors ${
                        isFull 
                            ? 'text-amber-400 fill-amber-400' 
                            : isHalf 
                                ? 'text-amber-400 fill-amber-400' 
                                : 'text-transparent'
                    }`}
                    style={isHalf ? {
                        clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)'
                    } : {}}
                />
            </button>
        );
    };

    return (
        <div className="flex items-center gap-1">
            {stars.map(renderStar)}
            {rating > 0 && (
                <span className="ml-2 text-sm text-gray-400">
                    {rating}/5
                </span>
            )}
        </div>
    );
};

export default StarRating;
