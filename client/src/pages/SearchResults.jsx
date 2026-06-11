import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHotels } from '../redux/hotelSlice.js';
import HotelCard from '../components/HotelCard.jsx';

export const SearchResults = () => {
  const dispatch = useDispatch();
  const { list, loading, searchParams } = useSelector((state) => state.hotels);

  // Filter local states
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [selectedRating, setSelectedRating] = useState(null);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [sortBy, setSortBy] = useState('recommended');

  const amenitiesOptions = ['Free WiFi', 'Swimming Pool', 'Spa & Wellness', 'Restaurant', 'Breakfast', 'Workspace', 'Gym'];

  useEffect(() => {
    // Initial fetch using parameters from Home page search bar
    applyFilters();
  }, [dispatch, searchParams]);

  const handleAmenityChange = (amenity) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const handleRatingChange = (rating) => {
    setSelectedRating(selectedRating === rating ? null : rating);
  };

  const applyFilters = () => {
    dispatch(fetchHotels({
      location: searchParams.location,
      priceMin,
      priceMax,
      rating: selectedRating,
      amenities: selectedAmenities
    }));
  };

  const clearAllFilters = () => {
    setPriceMin('');
    setPriceMax('');
    setSelectedRating(null);
    setSelectedAmenities([]);
    dispatch(fetchHotels({
      location: searchParams.location
    }));
  };

  const sortedList = [...list].sort((a, b) => {
    if (sortBy === 'price_low') {
      return a.minPrice - b.minPrice;
    }
    if (sortBy === 'price_high') {
      return b.minPrice - a.minPrice;
    }
    if (sortBy === 'rating') {
      return b.rating - a.rating;
    }
    // recommended
    return b.rating - a.rating; 
  });

  return (
    <div className="flex-grow pt-[104px] pb-16 min-h-screen bg-surface">
      <main className="max-w-container-max mx-auto w-full px-margin-mobile md:px-margin-desktop grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        
        {/* Left Sidebar Filters */}
        <aside className="hidden lg:block lg:col-span-3">
          <div className="sticky top-[104px] bg-white border border-outline-variant/30 rounded-xl p-6 shadow-[0px_4px_12px_rgba(0,59,149,0.08)] max-h-[calc(100vh-120px)] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-headline-md text-label-md text-on-surface font-semibold text-lg">Filters</h2>
              <button 
                onClick={clearAllFilters}
                className="text-teal-vibrant font-label-sm text-label-sm hover:underline"
              >
                Clear All
              </button>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <h3 className="font-label-md text-label-md text-on-surface font-semibold mb-3">Price per night</h3>
              <div className="flex items-center gap-3">
                <div className="relative w-full">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
                  <input 
                    type="number"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    className="w-full h-10 pl-7 pr-2 border border-outline-variant rounded-md text-sm outline-none focus:border-teal-vibrant"
                    placeholder="Min"
                  />
                </div>
                <span className="text-outline-variant">-</span>
                <div className="relative w-full">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
                  <input 
                    type="number"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    className="w-full h-10 pl-7 pr-2 border border-outline-variant rounded-md text-sm outline-none focus:border-teal-vibrant"
                    placeholder="Max"
                  />
                </div>
              </div>
            </div>

            {/* Star Rating */}
            <div className="mb-6 border-t border-outline-variant/20 pt-4">
              <h3 className="font-label-md text-label-md text-on-surface font-semibold mb-3">Minimum Rating</h3>
              <div className="flex flex-col gap-2">
                {[4.5, 4.0, 3.5].map((rating) => (
                  <label key={rating} className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox"
                      checked={selectedRating === rating}
                      onChange={() => handleRatingChange(rating)}
                      className="w-4 h-4 rounded border-outline-variant text-teal-vibrant focus:ring-teal-vibrant cursor-pointer"
                    />
                    <span className="font-body-md text-on-surface-variant group-hover:text-primary transition-colors text-sm">
                      {rating.toFixed(1)} & above
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div className="mb-6 border-t border-outline-variant/20 pt-4">
              <h3 className="font-label-md text-label-md text-on-surface font-semibold mb-3">Amenities</h3>
              <div className="flex flex-col gap-2">
                {amenitiesOptions.map((amenity) => (
                  <label key={amenity} className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox"
                      checked={selectedAmenities.includes(amenity)}
                      onChange={() => handleAmenityChange(amenity)}
                      className="w-4 h-4 rounded border-outline-variant text-teal-vibrant focus:ring-teal-vibrant cursor-pointer"
                    />
                    <span className="font-body-md text-on-surface-variant group-hover:text-primary transition-colors text-sm">
                      {amenity}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <button 
              onClick={applyFilters}
              className="w-full h-11 bg-teal-vibrant text-white rounded-lg font-label-md text-label-md hover:bg-teal-vibrant/90 transition-colors shadow-md mt-4"
            >
              Apply Filters
            </button>
          </div>
        </aside>

        {/* Right Content Area */}
        <section className="col-span-1 lg:col-span-9 flex flex-col gap-6">
          {/* Top Action Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-[0px_4px_12px_rgba(0,59,149,0.08)] border border-outline-variant/20">
            <div>
              <h1 className="font-headline-md text-headline-md text-primary font-bold">
                {searchParams.location ? `Hotels in ${searchParams.location}` : 'All Hotel Properties'}
              </h1>
              <p className="font-body-md text-body-md text-slate-500 mt-1">
                Showing {sortedList.length} properties found
              </p>
            </div>
            
            <div className="flex items-center gap-4 w-full sm:w-auto self-end">
              <div className="relative w-full sm:w-auto">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full sm:w-auto appearance-none bg-white border border-outline-variant rounded-lg py-2 pl-4 pr-10 font-label-md text-label-md text-on-surface focus:border-teal-vibrant outline-none cursor-pointer"
                >
                  <option value="recommended">Sort by: Recommended</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="rating">Guest Rating</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-outline">expand_more</span>
              </div>
            </div>
          </div>

          {/* Hotel Listing Cards */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-vibrant"></div>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {sortedList.length > 0 ? (
                sortedList.map((hotel) => (
                  <HotelCard key={hotel._id} hotel={hotel} />
                ))
              ) : (
                <div className="bg-white rounded-xl border border-outline-variant/30 p-12 text-center text-slate-500 shadow-sm">
                  <span className="material-symbols-outlined text-5xl text-outline mb-4">search_off</span>
                  <h3 className="font-semibold text-lg text-primary mb-2">No Properties Found</h3>
                  <p className="max-w-md mx-auto">
                    We couldn't find any hotel properties matching your selected filters. Try clearing filters or broadening your destination search.
                  </p>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
export default SearchResults;
