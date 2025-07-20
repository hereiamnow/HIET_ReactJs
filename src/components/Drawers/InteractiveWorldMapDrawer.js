import React, { useState, useMemo } from 'react';
import { MapPin, ChevronDown, Minus, Plus, Sparkles } from 'lucide-react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";

// List of countries known for producing cigars, used in the app for filtering and categorization.
const cigarCountries = [
    "United States",
    "Mexico",
    "Cuba",
    "Dominican Republic",
    "Honduras",
    "Nicaragua"
];

// URL for the world map data used in the Map component.
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const InteractiveWorldMapDrawer = ({ cigars, navigate, theme, isCollapsed, onToggle }) => {
    const countryCounts = useMemo(() => {
        return cigars.reduce((acc, cigar) => {
            const country = cigar.country || 'Unknown';
            if (country !== 'Unknown') {
                acc[country] = (acc[country] || 0) + cigar.quantity;
            }
            return acc;
        }, {});
    }, [cigars]);

    // Find the region with the most cigars (by country)
    const topCountry = useMemo(() => {
        let max = 0, top = "United States";
        Object.entries(countryCounts).forEach(([country, count]) => {
            if (count > max) {
                max = count;
                top = country;
            }
        });
        return top;
    }, [countryCounts]);

    // Map country names to approximate coordinates (longitude, latitude)
    const countryCenters = {
        "United States": [-98, 39],
        "Mexico": [-102, 23],
        "Cuba": [-79, 21],
        "Dominican Republic": [-70.7, 19],
        "Honduras": [-86.5, 15],
        "Nicaragua": [-85, 12],
        // Add more as needed
    };

    // Default center: top country or fallback to USA
    const initialCenter = countryCenters[topCountry] || [-98, 39];
    const initialZoom = 2.5; // More zoomed in than default

    // State for zoom and position
    const [zoom, setZoom] = useState(initialZoom);
    const [center, setCenter] = useState(initialCenter);

    // Handler for zoom controls
    const handleZoomIn = () => setZoom(z => Math.min(z + 0.5, 8));
    const handleZoomOut = () => setZoom(z => Math.max(z - 0.5, 1));
    const handleReset = () => {
        setZoom(initialZoom);
        setCenter(initialCenter);
    };

    // Handler for dragging the map
    const handleMoveEnd = (position) => {
        // Defensive: Ensure position is an array [lng, lat]
        if (Array.isArray(position) && position.length === 2 && typeof position[0] === "number" && typeof position[1] === "number") {
            setCenter(position);
        } else if (position && typeof position === "object" && "coordinates" in position && Array.isArray(position.coordinates)) {
            setCenter(position.coordinates);
        } else {
            // fallback: do not update center
            console.warn("Invalid center position from ZoomableGroup:", position);
        }
    };

    // Theme-based map colors
    const mapColors = {
        highlighted: theme.mapHighlightedCountry || "#fbbf24",
        cigarCountry: theme.mapCigarCountry || "#fde68a",
        other: theme.mapOtherCountry || "#f3f4f6",
        hover: theme.mapHover || "#f59e0b",
        border: theme.mapBorder || "#d1d5db"
    };

    return (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
            <button onClick={onToggle} className="w-full p-4 flex justify-between items-center">
                <h3 className="font-bold text-amber-300 text-lg flex items-center">
                    <MapPin className="w-5 h-5 mr-2" /> World Map
                </h3>
                <ChevronDown className={`w-5 h-5 text-amber-300 transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`} />
            </button>

            {!isCollapsed && (
                <div className="p-4">
                    <p className="text-sm text-gray-400 mb-1">
                        Tap on a highlighted country to filter your collection by its origin.
                    </p>
                    <div className="w-full" style={{ minHeight: 300, position: "relative" }}>
                        {/* Overlay zoom controls in bottom right */}
                        <div
                            className="absolute bottom-2 right-2 flex gap-2 z-10"
                            style={{ pointerEvents: "auto" }}
                        >
                            <button
                                onClick={handleZoomOut}
                                className="p-3 bg-gray-800/70 border border-gray-700 rounded-full text-amber-300 hover:bg-gray-700 transition-colors flex items-center justify-center shadow-lg"
                                title="Zoom Out"
                            >
                                <Minus className="w-5 h-5" />
                            </button>
                            <button
                                onClick={handleZoomIn}
                                className="p-3 bg-gray-800/70 border border-gray-700 rounded-full text-amber-300 hover:bg-gray-700 transition-colors flex items-center justify-center shadow-lg"
                                title="Zoom In"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                            <button
                                onClick={handleReset}
                                className="p-3 bg-gray-800/70 border border-gray-700 rounded-full text-amber-300 hover:bg-gray-700 transition-colors flex items-center justify-center shadow-lg"
                                title="Reset"
                            >
                                <Sparkles className="w-5 h-5" />
                            </button>
                        </div>
                        <ComposableMap
                            width={1000}
                            height={350}
                            style={{ width: "100%", height: "350px" }}
                        >
                            <ZoomableGroup
                                center={center}
                                zoom={zoom}
                                onMoveEnd={handleMoveEnd}
                                minZoom={3}
                                maxZoom={8}
                            >
                                <Geographies geography={geoUrl}>
                                    {({ geographies }) =>
                                        geographies.map(geo => {
                                            const countryName = geo.properties.name;
                                            const isCigarCountry = cigarCountries.includes(countryName);
                                            const hasCigars = countryCounts[countryName] > 0;
                                            return (
                                                <Geography
                                                    key={geo.rsmKey}
                                                    geography={geo}
                                                    onClick={() => hasCigars && navigate('HumidorsScreen', { preFilterCountry: countryName })}
                                                    style={{
                                                        default: {
                                                            fill: hasCigars
                                                                ? mapColors.highlighted
                                                                : isCigarCountry
                                                                    ? mapColors.cigarCountry
                                                                    : mapColors.other,
                                                            outline: "none",
                                                            cursor: hasCigars ? "pointer" : "default",
                                                            stroke: mapColors.border,
                                                            strokeWidth: 0.5
                                                        },
                                                        hover: {
                                                            fill: hasCigars
                                                                ? mapColors.hover
                                                                : isCigarCountry
                                                                    ? mapColors.cigarCountry
                                                                    : mapColors.other, // do not highlight if no cigars
                                                            outline: "none",
                                                            cursor: hasCigars ? "pointer" : "default"
                                                        },
                                                        pressed: {
                                                            fill: mapColors.hover,
                                                            outline: "none"
                                                        }
                                                    }}
                                                />
                                            );
                                        })
                                    }
                                </Geographies>
                            </ZoomableGroup>
                        </ComposableMap>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InteractiveWorldMapDrawer;