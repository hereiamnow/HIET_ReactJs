/**
 * ImageUploadModal - A comprehensive modal for image upload with URL input, file upload, and AI generation
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is currently open
 * @param {Function} props.onClose - Function to call when the modal should be closed
 * @param {Function} props.onImageAccept - Function to call when an image is accepted with (imageUrl, position) parameters
 * @param {string} props.itemName - Name of the item for AI image generation
 * @param {string} props.initialImage - Initial image URL to display
 * @param {Object} props.initialPosition - Initial image position {x, y}
 * @param {Object} props.theme - Theme object for styling
 * @param {string} props.itemCategory - Category of the item (e.g., 'cigar', 'humidor')
 * @param {string} props.itemType - Specific type of the item for AI generation
 */
import React, { useState, useEffect } from 'react';
import { X, Upload, Link, Sparkles, LoaderCircle } from 'lucide-react';
import DraggableImage from '../../UI/DraggableImage';
import { generateAiImage } from '../../../utils/fileUtils';

const ImageUploadModal = ({ isOpen, onClose, onImageAccept, itemName, initialImage, initialPosition, theme, itemCategory, itemType }) => {
    const [activeTab, setActiveTab] = useState('url');
    const [imageUrl, setImageUrl] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewImage, setPreviewImage] = useState(initialImage || '');
    
    // This state manages the position of the image *inside the modal*.
    const [modalPosition, setModalPosition] = useState(initialPosition);
    
    // When the modal opens, this effect syncs its state with the main form's state.
    useEffect(() => {
        if (isOpen) {
            setPreviewImage(initialImage || '');
            setModalPosition(initialPosition);
        }
    }, [isOpen, initialImage, initialPosition]);

    const [isGenerating, setIsGenerating] = useState(false);

    if (!isOpen) return null;

    const handleImageUrlSubmit = () => {
        if (imageUrl.trim()) {
            setPreviewImage(imageUrl.trim());
            setImageUrl('');
        }
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onload = (e) => setPreviewImage(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    const handleGenerateAiImage = async () => {
        if (!itemName.trim()) return;
        
        setIsGenerating(true);
        try {
            const generatedImageUrl = await generateAiImage(itemName, itemCategory, itemType);
            setPreviewImage(generatedImageUrl);
        } catch (error) {
            console.error('Error generating AI image:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAcceptImage = () => {
        if (previewImage) {
            onImageAccept(previewImage, modalPosition);
            onClose();
        }
    };

    const handleRemoveImage = () => {
        setPreviewImage('');
        setSelectedFile(null);
        setImageUrl('');
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[150]" onClick={onClose}>
            <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-amber-400">Add Image</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="flex mb-6 bg-gray-700 rounded-lg p-1">
                    {[
                        { id: 'url', label: 'URL', icon: Link },
                        { id: 'upload', label: 'Upload', icon: Upload },
                        { id: 'ai', label: 'AI Generate', icon: Sparkles }
                    ].map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-colors ${
                                activeTab === id 
                                    ? 'bg-amber-500 text-white' 
                                    : 'text-gray-300 hover:text-white'
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="mb-6">
                    {activeTab === 'url' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-gray-300 text-sm font-medium mb-2">
                                    Image URL
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="url"
                                        value={imageUrl}
                                        onChange={(e) => setImageUrl(e.target.value)}
                                        className="flex-1 bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-amber-500"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                    <button
                                        onClick={handleImageUrlSubmit}
                                        disabled={!imageUrl.trim()}
                                        className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Load
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'upload' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-gray-300 text-sm font-medium mb-2">
                                    Choose File
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:bg-amber-500 file:text-white hover:file:bg-amber-600"
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'ai' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-gray-300 text-sm font-medium mb-2">
                                    Generate AI Image
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={itemName}
                                        readOnly
                                        className="flex-1 bg-gray-600 border border-gray-600 rounded-lg py-2 px-3 text-gray-300"
                                        placeholder="Item name required"
                                    />
                                    <button
                                        onClick={handleGenerateAiImage}
                                        disabled={!itemName.trim() || isGenerating}
                                        className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                    >
                                        {isGenerating ? (
                                            <LoaderCircle className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Sparkles className="w-4 h-4" />
                                        )}
                                        {isGenerating ? 'Generating...' : 'Generate'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Image Preview */}
                {previewImage && (
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="text-gray-300 font-medium">Preview & Position</h4>
                            <button
                                onClick={handleRemoveImage}
                                className="text-red-400 hover:text-red-300 text-sm"
                            >
                                Remove Image
                            </button>
                        </div>
                        <div className="w-full h-64 bg-gray-700 rounded-lg overflow-hidden">
                            <DraggableImage
                                src={previewImage}
                                position={modalPosition}
                                onPositionChange={setModalPosition}
                            />
                        </div>
                        <p className="text-gray-400 text-sm mt-2">
                            Drag the image to adjust its position
                        </p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAcceptImage}
                        disabled={!previewImage}
                        className="flex-1 bg-amber-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Use This Image
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImageUploadModal;