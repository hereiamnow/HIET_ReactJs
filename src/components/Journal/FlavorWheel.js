import React, { useState } from 'react';

const flavorData = {
    Spicy: ['Pepper', 'Cinnamon', 'Clove', 'Anise'],
    Sweet: ['Chocolate', 'Caramel', 'Honey', 'Molasses'],
    Nutty: ['Almond', 'Walnut', 'Hazelnut', 'Peanut'],
    Earthy: ['Earth', 'Leather', 'Dust', 'Musty'],
    Woody: ['Cedar', 'Oak', 'Mesquite', 'Hickory'],
    Floral: ['Rose', 'Jasmine', 'Lavender', 'Hibiscus'],
    Fruity: ['Citrus', 'Berry', 'Dried Fruit', 'Apple'],
    Herbal: ['Grass', 'Hay', 'Green Tea', 'Mint'],
    Creamy: ['Butter', 'Cream', 'Vanilla', 'Milk'],
    Roasted: ['Coffee', 'Cocoa', 'Toasted', 'Charred'],
};

const FlavorWheel = ({ onFlavorSelect }) => {
    const [selectedCategory, setSelectedCategory] = useState(null);

    const handleCategoryClick = (category) => {
        setSelectedCategory(category === selectedCategory ? null : category);
    };

    const handleFlavorClick = (flavor) => {
        if (onFlavorSelect) {
            onFlavorSelect(flavor);
        }
    };

    const categories = Object.keys(flavorData);
    const numCategories = categories.length;
    const radius = 120;
    const wheelSize = 300;

    return (
        <div className="flex flex-col items-center text-gray-200">
            <div className="relative" style={{ width: wheelSize, height: wheelSize }}>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center w-32 h-32 rounded-full bg-gray-800 border-2 border-gray-700">
                    <span className="text-lg font-bold text-amber-400 text-center">
                        {selectedCategory || 'Flavors'}
                    </span>
                </div>

                {categories.map((category, index) => {
                    const angle = (index / numCategories) * 2 * Math.PI - Math.PI / 2;
                    const x = wheelSize / 2 + radius * Math.cos(angle);
                    const y = wheelSize / 2 + radius * Math.sin(angle);
                    const isSelected = selectedCategory === category;

                    return (
                        <button
                            key={category}
                            onClick={() => handleCategoryClick(category)}
                            className={`absolute w-24 py-2 rounded-full text-xs font-semibold transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 focus:outline-none
                                ${isSelected
                                    ? 'bg-amber-500 text-white scale-110 shadow-lg'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                            style={{ left: `${x}px`, top: `${y}px` }}
                        >
                            {category}
                        </button>
                    );
                })}
            </div>

            {selectedCategory && (
                <div className="mt-6 w-full max-w-sm">
                    <div className="flex flex-wrap justify-center gap-2 p-4 bg-gray-800/50 rounded-xl">
                        {flavorData[selectedCategory].map((flavor) => (
                            <button
                                key={flavor}
                                onClick={() => handleFlavorClick(flavor)}
                                className="px-3 py-1 bg-gray-700 text-amber-300 rounded-full text-sm hover:bg-amber-500 hover:text-white transition-colors duration-200"
                            >
                                {flavor}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FlavorWheel;