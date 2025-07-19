/**
 * DraggableImage - A reusable controlled component that displays a draggable image
 * Its position is managed by a parent component, making it flexible
 * @param {Object} props - Component props
 * @param {string} props.src - The source URL for the image
 * @param {Object} props.position - The current position {x, y} of the image
 * @param {Function} props.onPositionChange - Callback function to update the position in the parent
 */
import React, { useState, useRef } from 'react';

const DraggableImage = ({ src, position, onPositionChange }) => {
    // State to track if the user is currently dragging the image.
    const [isDragging, setIsDragging] = useState(false);
    // A ref to the container div to get its dimensions for calculating position.
    const containerRef = useRef(null);

    // Handlers for starting and ending the drag action.
    const handleDragStart = (e) => {
        e.preventDefault(); // Prevents the browser's default image drag behavior.
        setIsDragging(true);
    };
    const handleDragEnd = () => setIsDragging(false);

    // This function calculates the new image position based on mouse or touch movement.
    const handleDrag = (clientX, clientY) => {
        // Only run this logic if dragging is active and the container ref is set.
        if (!isDragging || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        // Calculate position as a percentage of the container's dimensions.
        // Math.max/min clamps the value between 0 and 100 to keep the image within the frame.
        const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
        const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));

        // Call the parent's function to update the position state.
        onPositionChange({ x, y });
    };

    return (
        <div ref={containerRef} className="h-full w-full overflow-hidden">
            <img
                src={src}
                alt="Draggable Preview"
                className={`h-full w-full max-w-none object-cover ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                style={{
                    objectPosition: `${position.x}% ${position.y}%`,
                    transform: 'scale(1.25)' // "Zooms in" to provide more draggable area.
                }}
                // Event handlers for both mouse and touch input.
                onMouseDown={handleDragStart}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd} // Stop dragging if the mouse leaves the component.
                onMouseMove={(e) => handleDrag(e.clientX, e.clientY)}
                onTouchStart={handleDragStart}
                onTouchEnd={handleDragEnd}
                onTouchMove={(e) => handleDrag(e.touches[0].clientX, e.touches[0].clientY)}
                draggable="false"
            />
        </div>
    );
};

export default DraggableImage;