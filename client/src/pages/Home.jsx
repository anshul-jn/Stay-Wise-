import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { setSearchParams, fetchRecommendations } from '../redux/hotelSlice.js';
import HotelCard from '../components/HotelCard.jsx';

export const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { recommendations, loading } = useSelector((state) => state.hotels);

  // Search local states
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);

  useEffect(() => {
    // Fetch AI recommendations based on user or fallback to guest
    const uid = user ? user._id : 'guest';
    dispatch(fetchRecommendations(uid));
  }, [dispatch, user]);

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(setSearchParams({
      location: destination,
      checkIn,
      checkOut,
      guests
    }));
    navigate('/search-results');
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center px-margin-mobile md:px-margin-desktop pt-20">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img 
            alt="Luxury Hotel" 
            className="w-full h-full object-cover object-center" 
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=80"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/40 via-transparent to-background"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-container-max mx-auto flex flex-col items-center">
          <h1 className="font-display-lg text-display-lg text-white text-center mb-4 drop-shadow-lg max-w-3xl leading-tight">
            Find your perfect stay with AI precision
          </h1>
          <p className="font-body-lg text-body-lg text-white/90 text-center mb-12 max-w-2xl drop-shadow">
            Experience seamless booking and personalized recommendations tailored to your unique travel style.
          </p>

          {/* Search Panel */}
          <div className="glass-panel w-full max-w-4xl rounded-xl p-4 md:p-6 shadow-[0px_12px_24px_rgba(0,39,104,0.15)]">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full relative">
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1 ml-1">Destination</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">location_on</span>
                  <input 
                    type="text"
                    required
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full h-14 pl-12 pr-4 bg-white border border-outline-variant rounded-lg focus:border-teal-vibrant focus:ring-1 focus:ring-teal-vibrant outline-none transition-all font-body-md text-body-md text-on-surface"
                    placeholder="Where are you going?"
                  />
                </div>
              </div>

              <div className="flex gap-4 w-full md:w-auto md:flex-1">
                <div className="flex-1 relative">
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1 ml-1">Check-in</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">calendar_month</span>
                    <input 
                      type="date"
                      required
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full h-14 pl-10 pr-2 bg-white border border-outline-variant rounded-lg focus:border-teal-vibrant focus:ring-1 focus:ring-teal-vibrant outline-none transition-all font-body-md text-body-md text-on-surface"
                    />
                  </div>
                </div>

                <div className="flex-1 relative">
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1 ml-1">Check-out</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">calendar_month</span>
                    <input 
                      type="date"
                      required
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full h-14 pl-10 pr-2 bg-white border border-outline-variant rounded-lg focus:border-teal-vibrant focus:ring-1 focus:ring-teal-vibrant outline-none transition-all font-body-md text-body-md text-on-surface"
                    />
                  </div>
                </div>
              </div>

              <div className="w-full md:w-[120px] relative">
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1 ml-1">Guests</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">group</span>
                  <input 
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value))}
                    className="w-full h-14 pl-10 pr-2 bg-white border border-outline-variant rounded-lg focus:border-teal-vibrant focus:ring-1 focus:ring-teal-vibrant outline-none transition-all font-body-md text-body-md text-on-surface"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full md:w-auto h-14 bg-teal-vibrant hover:bg-teal-vibrant/90 text-white px-8 rounded-lg font-label-md text-label-md flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95 duration-200"
              >
                <span className="material-symbols-outlined">search</span>
                Search
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* SmartStay Recommender Section */}
      <section className="py-24 px-margin-mobile md:px-margin-desktop bg-surface-container-low border-t border-outline-variant/10">
        <div className="max-w-container-max mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-teal-vibrant text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              <div>
                <h2 className="font-headline-lg text-headline-lg text-primary">SmartStay Recommendations</h2>
                <p className="font-body-md text-body-md text-slate-500 mt-1">
                  {user 
                    ? "AI recommendations personalized for your location budget and style preferences."
                    : "Popular recommendations curated by our intelligent travel matching engine."
                  }
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => navigate('/search-results')} 
              className="text-teal-vibrant font-label-md text-label-md hover:underline flex items-center gap-1 self-end"
            >
              Explore all hotels <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-vibrant"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
              {recommendations?.map((hotel) => (
                <div key={hotel._id} className="bg-white rounded-xl overflow-hidden shadow-[0px_4px_12px_rgba(0,59,149,0.08)] border border-outline-variant/20 hover:-translate-y-1 transition-transform duration-300">
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <div className="absolute top-4 left-4 z-10 bg-teal-vibrant text-white font-label-sm text-label-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                      <span className="material-symbols-outlined text-[14px]">psychology</span>
                      AI Recommended
                    </div>
                    <img 
                      src={hotel.images?.[0]} 
                      alt={hotel.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <Link to={`/hotel/${hotel._id}`}>
                        <h3 className="font-headline-md text-headline-md text-on-surface hover:text-primary transition-colors cursor-pointer line-clamp-1">{hotel.name}</h3>
                      </Link>
                      <div className="flex items-center gap-1 bg-surface-container rounded px-2 py-0.5 text-sm">
                        <span className="material-symbols-outlined text-accent-gold text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span className="font-semibold">{hotel.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <p className="font-body-md text-body-md text-slate-500 mb-4 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">location_on</span>
                      {hotel.location}
                    </p>
                    <div className="flex justify-between items-end border-t border-outline-variant/10 pt-4 mt-4">
                      <div>
                        <span className="text-slate-500 text-xs block">Starting from</span>
                        <span className="font-headline-md text-headline-md text-primary font-bold">
                          ${hotel.minPrice || 150}<span className="text-slate-500 font-normal text-sm">/night</span>
                        </span>
                      </div>
                      <Link 
                        to={`/hotel/${hotel._id}`}
                        className="text-teal-vibrant font-label-md text-label-md hover:underline font-semibold flex items-center"
                      >
                        View Details <span className="material-symbols-outlined text-sm">chevron_right</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
export default Home;
