// Field definitions for data import/export and form validation
// These constants define the structure and validation rules for humidor and cigar data

export const APP_HUMIDOR_FIELDS = [
    { key: 'name', label: 'Humidor Name', required: true },
    { key: 'shortDescription', label: 'Short Description', required: false },
    { key: 'longDescription', label: 'Long Description', required: false },
    { key: 'size', label: 'Size', required: false },
    { key: 'location', label: 'Location', required: false },
    { key: 'image', label: 'Image URL', required: false },
    { key: 'type', label: 'Type', required: false },
    { key: 'temp', label: 'Temperature', required: false, type: 'number' },
    { key: 'humidity', label: 'Humidity', required: false, type: 'number' },
    { key: 'goveeDeviceId', label: 'Govee Device ID', required: false },
    { key: 'goveeDeviceModel', label: 'Govee Device Model', required: false },
];

export const APP_CIGAR_FIELDS = [
    { key: 'name', label: 'Cigar Name', required: true },
    { key: 'brand', label: 'Brand', required: true },
    { key: 'line', label: 'Product Line', required: false },
    { key: 'shape', label: 'Shape', required: false },
    { key: 'isBoxPress', label: 'Is Box Pressed', required: false, type: 'boolean' },
    { key: 'length_inches', label: 'Length (in)', required: false, type: 'number' },
    { key: 'ring_gauge', label: 'Ring Gauge', required: false, type: 'number' },
    { key: 'size', label: 'Size (e.g., 5.5x50)', required: false },
    { key: 'country', label: 'Country', required: false },
    { key: 'wrapper', label: 'Wrapper', required: false },
    { key: 'binder', label: 'Binder', required: false },
    { key: 'filler', label: 'Filler', required: false },
    { key: 'strength', label: 'Strength', required: false },
    { key: 'flavorNotes', label: 'Flavor Notes (semicolon-separated)', required: false, type: 'array' },
    { key: 'rating', label: 'Rating (Official)', required: false, type: 'number' },
    { key: 'userRating', label: 'My Rating', required: false, type: 'number' },
    { key: 'price', label: 'Price', required: false, type: 'number' },
    { key: 'quantity', label: 'Quantity', required: true, type: 'number' },
    { key: 'image', label: 'Image URL', required: false },
    { key: 'shortDescription', label: 'Short Description', required: false },
    { key: 'description', label: 'Long Description', required: false },
    { key: 'dateAdded', label: 'Date Added', required: false, type: 'date' }
];