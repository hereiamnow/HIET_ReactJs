/**
 * ImagePreview - Displays the main image placeholder on the form (display only version)
 * @param {Object} props - Component props
 * @param {string} props.image - The source URL for the image
 * @param {Object} props.position - The saved position {x, y} of the image
 * @param {Function} props.onClick - The function to call when the component is clicked
 */
import React from 'react';

const ImagePreview = ({ image, position, onClick }) => {
    return (
        <div className="group relative w-full h-64 border-1 bg-slate-50 transition-colors hover:border-slate-400 hover:bg-slate-100 overflow-hidden">
            {image ? (
                <>
                    {/* This image just displays the saved position; it is not draggable itself. */}
                    <img
                        src={image}
                        alt="Item Preview"
                        className="h-full w-full max-w-none object-cover"
                        style={{
                            objectPosition: `${position.x}% ${position.y}%`,
                            transform: 'scale(1.25)'
                        }}
                        draggable="false"
                    />
                    {/* The overlay is the dedicated click target to open the modal. */}
                    <div
                        onClick={onClick}
                        className="absolute inset-0 flex items-center justify-center rounded-md bg-black bg-opacity-60 text-xl text-white opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer"
                    >
                        Edit Image
                    </div>
                </>
            ) : (
                // Placeholder for when there's no image.
                <div onClick={onClick} className="flex h-full w-full flex-col items-center justify-center text-slate-500 cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mb-4 h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p>Tap to add an image</p>
                </div>
            )}
        </div>
    );
};

export default ImagePreview;