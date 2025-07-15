
export const allFlavorNotes = [
    'Earth', 'Earthy', 'Woody', 'Spice', 'Spicy', 'Nutty', 'Sweet', 'Fruity', 'Floral', 'Herbal',
    'Leather', 'Coffee', 'Cocoa', 'Chocolate', 'Creamy', 'Pepper', 'Cedar', 'Oak',
    'Cinnamon', 'Vanilla', 'Honey', 'Caramel', 'Citrus', 'Dried Fruit', 'Hay', 'Toasted',
    'Dark Cherry', 'Roasted Nuts', 'Toasted Bread'
].sort(); // .sort() keeps the list alphabetical.

export const strengthOptions = ['Mild', 'Mild-Medium', 'Medium', 'Medium-Full', 'Full'];

export const cigarShapes = [
    'Parejo', 'Corona', 'Robusto', 'Toro', 'Churchill', 'Double Corona', 'Lonsdale',
    'Panetela', 'Lancero', 'Grand Corona', 'Presidente', 'Figurado', 'Belicoso',
    'Torpedo', 'Piramide', 'Perfecto', 'Diadema', 'Culebra', 'Double Robusto'
].sort(); // .sort() keeps the list alphabetical.

export const cigarRingGauges = [30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58].sort(); // .sort() keeps the list alphabetical.

export const cigarLengths = [3, 3.5, 4, 4.5, 5, 5.25, 5.5, 5.75, 6, 6.25, 6.5, 6.75, 7, 7.5, 8].sort(); // .sort() keeps the list alphabetical.

export const cigarWrapperColors = [
    'Natural', 'Maduro', 'Connecticut', 'Habano', 'Sumatra', 'Candela', 'Oscuro',
    'Colorado', 'Criollo', 'Cameroon', 'San Andres', 'Mexican', 'Brazilian',
    'Pennsylvania', 'Nicaraguan', 'Dominican', 'Honduran'
].sort(); // .sort() keeps the list alphabetical.

export const cigarBinderTypes = [
    'Natural', 'Maduro', 'Connecticut', 'Habano', 'Sumatra', 'Candela', 'Oscuro',
    'Colorado', 'Criollo', 'Cameroon', 'San Andres', 'Mexican', 'Brazilian',
    'Pennsylvania', 'Nicaraguan', 'Dominican', 'Honduran'
].sort(); // .sort() keeps the list alphabetical.

export const cigarFillerTypes = [
    'Natural', 'Maduro', 'Connecticut', 'Habano', 'Sumatra', 'Candela', 'Oscuro',
    'Colorado', 'Criollo', 'Cameroon', 'San Andres', 'Mexican', 'Brazilian',
    'Pennsylvania', 'Nicaraguan', 'Dominican', 'Honduran'
].sort(); // .sort() keeps the list alphabetical.

export const cigarCountryOfOrigin = [
    'Cuba', 'Dominican Republic', 'Nicaragua', 'Honduras', 'Mexico', 'Brazil',
    'Peru', 'United States', 'Colombia', 'Costa Rica', 'Panama', 'Jamaica',
    'Philippines', 'India', 'El Salvador', 'Ecuador', 'Guatemala', 'Nicaragua'
].sort();

// Common cigar dimensions for various vitolas.
// This is used to fill the cigar length and ring gauge fields in the form when the user selects a vitola.
export const commonCigarDimensions = {
    'Corona': { length_inches: 5.5, ring_gauge: 42 },
    'Robusto': { length_inches: 5, ring_gauge: 50 },
    'Toro': { length_inches: 6, ring_gauge: 52 },
    'Churchill': { length_inches: 7, ring_gauge: 48 },
    'Double Corona': { length_inches: 7.5, ring_gauge: 49 },
    'Lonsdale': { length_inches: 6.5, ring_gauge: 42 },
    'Panetela': { length_inches: 6, ring_gauge: 38 },
    'Lancero': { length_inches: 7.5, ring_gauge: 38 },
    'Perfecto': { length_inches: 4.5, ring_gauge: 48 }, // Example, can vary widely
    'Piramide': { length_inches: 6.2, ring_gauge: 52 },
    'Torpedo': { length_inches: 6, ring_gauge: 52 },
    'Belicoso': { length_inches: 5, ring_gauge: 50 },
    'Figurado': { length_inches: null, ring_gauge: null }, // Varies too much
    'Parejo': { length_inches: null, ring_gauge: null }, // General term
    'Double Robusto': { length_inches: 5.5, ring_gauge: 54 },
    'Grand Corona': { length_inches: 5.6, ring_gauge: 46 },
    'Presidente': { length_inches: 8, ring_gauge: 52 }
};
