import React from 'react';
import { Link } from 'react-router-dom';

export const HotelCard = ({ hotel, isRecommended }) => {
  const getBadgeText = () => {
    if (isRecommended) return 'Recommended';
    if (hotel.rating >= 4.9) return 'Top Pick';
    if (hotel.tags?.includes('budget')) return 'Best Value';
    return null;
  };

  const badgeText = getBadgeText();
  const badgeColorClass = badgeText === 'Recommended' 
    ? 'bg-teal-vibrant text-white' 
    : badgeText === 'Top Pick'
      ? 'bg-accent-gold text-on-primary font-bold'
      : 'bg-primary-container text-on-primary-container font-semibold';

  return (
    <div className="group flex flex-col sm:flex-row bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0px_4px_12px_rgba(0,59,149,0.08)] hover:shadow-[0px_8px_24px_rgba(0,59,149,0.12)] transition-shadow duration-300 border border-outline-variant/20 h-auto sm:h-[240px]">
      {/* Image Area */}
      <div className="relative w-full sm:w-[320px] h-[200px] sm:h-full shrink-0 overflow-hidden">
        {badgeText && (
          <div className={`absolute top-4 left-4 z-10 font-label-sm text-label-sm px-2.5 py-1 rounded shadow-md uppercase tracking-wider flex items-center gap-1 ${badgeColorClass}`}>
            {badgeText === 'Recommended' && <span className="material-symbols-outlined text-[14px]">recommend</span>}
            {badgeText}
          </div>
        )}
        <img 
          src={hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'} 
          alt={hotel.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        />
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 flex flex-col justify-between">
        {/* Header & Rating */}
        <div className="flex justify-between items-start gap-4">
          <div>
            <Link to={`/hotel/${hotel._id}`}>
              <h3 className="font-headline-md text-headline-md-mobile sm:text-headline-md text-on-surface mb-1 group-hover:text-primary transition-colors cursor-pointer line-clamp-1">
                {hotel.name}
              </h3>
            </Link>
            <p className="font-body-md text-body-md text-slate-500 flex items-center gap-1 mb-2">
              <span className="material-symbols-outlined text-[16px] text-slate-500">location_on</span>
              {hotel.location}
            </p>
          </div>
          <div className="flex flex-col items-end shrink-0">
            <div className="bg-primary text-on-primary font-label-md text-label-md px-2.5 py-1 rounded mb-1">
              {hotel.rating.toFixed(1)}
            </div>
            <span className="font-label-sm text-label-sm text-slate-500">
              {hotel.rating >= 4.8 ? 'Superb' : 'Excellent'}
            </span>
          </div>
        </div>

        {/* Amenities Icons */}
        <div className="flex flex-wrap items-center gap-4 text-slate-500 font-label-sm text-label-sm my-2">
          {hotel.amenities?.slice(0, 4).map((amenity, idx) => (
            <div key={idx} className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px]">
                {amenity.toLowerCase().includes('wifi') ? 'wifi' :
                 amenity.toLowerCase().includes('pool') ? 'pool' :
                 amenity.toLowerCase().includes('gym') ? 'fitness_center' :
                 amenity.toLowerCase().includes('spa') ? 'spa' :
                 amenity.toLowerCase().includes('workspace') ? 'business_center' :
                 amenity.toLowerCase().includes('breakfast') ? 'local_cafe' :
                 'check_circle'}
              </span>
              {amenity}
            </div>
          ))}
        </div>

        {/* Footer: Price & CTA */}
        <div className="flex justify-between items-end mt-auto pt-4 border-t border-outline-variant/20">
          <div>
            {hotel.tags?.includes('luxury') && (
              <p className="font-label-sm text-label-sm text-teal-vibrant font-medium mb-1">Premium Package Available</p>
            )}
            <p className="font-body-md text-body-md text-slate-500 line-through text-sm">
              ${(hotel.minPrice * 1.15).toFixed(0)}
            </p>
          </div>
          <div className="text-right flex flex-col items-end gap-2">
            <div className="flex items-baseline gap-1">
              <span className="font-headline-md text-headline-md text-on-surface font-bold">
                ${hotel.minPrice || 150}
              </span>
              <span className="font-body-md text-body-md text-slate-500">/ night</span>
            </div>
            <Link 
              to={`/hotel/${hotel._id}`}
              className="bg-teal-vibrant text-on-primary font-label-md text-label-md px-6 py-2.5 rounded-lg shadow-md hover:shadow-lg hover:bg-teal-vibrant/90 transition-all active:scale-95 duration-200 block text-center"
            >
              View Options
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default HotelCard;
