import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchHotelDetails, clearDetails } from '../redux/hotelSlice.js';

export const HotelDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { details, loading, searchParams } = useSelector((state) => state.hotels);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchHotelDetails(id));
    return () => {
      dispatch(clearDetails());
    };
  }, [dispatch, id]);

  const handleSelectRoom = (roomId) => {
    if (!user) {
      navigate('/login');
    } else {
      navigate(`/booking/${id}?roomId=${roomId}`);
    }
  };

  if (loading || !details) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-surface pt-32">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-vibrant"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pt-32 pb-16">
      <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop flex flex-col gap-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-primary font-bold">{details.name}</h1>
            <p className="font-body-md text-body-md text-slate-500 mt-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-slate-500">location_on</span>
              {details.location}
            </p>
          </div>
          
          <div className="flex items-center gap-3 bg-white border border-outline-variant/30 rounded-xl px-4 py-3 shadow-[0px_4px_12px_rgba(0,59,149,0.08)]">
            <span className="font-headline-md text-headline-md text-primary font-bold">{details.rating.toFixed(1)}</span>
            <div className="border-l border-outline-variant/30 pl-3">
              <span className="font-label-md text-label-md text-primary block">
                {details.rating >= 4.8 ? 'Superb' : 'Excellent'}
              </span>
              <span className="font-label-sm text-label-sm text-slate-500">Verified Reviews</span>
            </div>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[300px] md:h-[400px] overflow-hidden rounded-2xl shadow-md border border-outline-variant/10">
          <div className="md:col-span-2 h-full overflow-hidden">
            <img 
              src={details.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'} 
              alt={details.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="hidden md:flex flex-col gap-4 h-full">
            <div className="flex-1 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80" 
                alt="Room detail"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="flex-1 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80" 
                alt="Bathroom/lobby"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>

        {/* Description & Amenities */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 bg-white rounded-xl border border-outline-variant/30 p-6 shadow-sm flex flex-col gap-4">
            <h2 className="font-headline-md text-headline-md text-primary font-bold">About the Property</h2>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              {details.description}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-outline-variant/30 p-6 shadow-sm flex flex-col gap-4">
            <h2 className="font-headline-md text-label-md text-primary font-bold text-lg">Key Amenities</h2>
            <div className="grid grid-cols-2 gap-4">
              {details.amenities?.map((amenity, idx) => (
                <div key={idx} className="flex items-center gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-teal-vibrant text-[18px]">check_circle</span>
                  <span className="font-body-md text-sm">{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Available Rooms Grid */}
        <div className="flex flex-col gap-6 mt-4">
          <h2 className="font-headline-lg text-headline-md text-primary font-bold">Available Room Options</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {details.rooms?.map((room) => (
              <div 
                key={room._id} 
                className="bg-white border border-outline-variant/30 rounded-xl overflow-hidden shadow-[0px_4px_12px_rgba(0,59,149,0.08)] flex flex-col justify-between"
              >
                <div className="h-[200px] overflow-hidden">
                  <img 
                    src={room.images?.[0] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'} 
                    alt={room.roomType}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="p-6 flex-grow flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-headline-md text-headline-md text-primary font-bold">{room.roomType} Room</h3>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                        room.availability ? 'bg-teal-vibrant/10 text-teal-vibrant' : 'bg-error/10 text-error'
                      }`}>
                        {room.availability ? 'Available' : 'Sold Out'}
                      </span>
                    </div>
                    
                    <p className="font-body-md text-body-md text-slate-500 flex items-center gap-1.5 mt-2">
                      <span className="material-symbols-outlined text-sm">group</span>
                      Sleeps up to {room.capacity} adults
                    </p>
                  </div>

                  <div className="flex justify-between items-end border-t border-outline-variant/10 pt-4 mt-2">
                    <div>
                      <span className="text-slate-500 text-xs block">Price per night</span>
                      <span className="font-headline-md text-headline-md text-primary font-bold">${room.price}</span>
                    </div>
                    
                    <button 
                      onClick={() => handleSelectRoom(room._id)}
                      disabled={!room.availability}
                      className="bg-teal-vibrant text-on-primary font-label-md text-label-md px-6 py-2.5 rounded-lg shadow-md hover:shadow-lg hover:bg-teal-vibrant/90 disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed transition-all active:scale-95 duration-200"
                    >
                      {room.availability ? 'Reserve' : 'Sold Out'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
};
export default HotelDetails;
