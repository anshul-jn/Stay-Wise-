import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { logoutUser } from '../redux/authSlice.js';

const BASE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Active Tab state (synced with URL pathname)
  const [activeTab, setActiveTab] = useState(() => {
    const path = window.location.pathname;
    if (path.includes('/admin/rooms')) return 'rooms';
    if (path.includes('/admin/bookings')) return 'bookings';
    if (path.includes('/admin/revenue')) return 'revenue';
    if (path.includes('/admin/settings')) return 'settings';
    return 'overview';
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync active tab with route path dynamically
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/admin/rooms')) setActiveTab('rooms');
    else if (path.includes('/admin/bookings')) setActiveTab('bookings');
    else if (path.includes('/admin/revenue')) setActiveTab('revenue');
    else if (path.includes('/admin/settings')) setActiveTab('settings');
    else if (path.includes('/admin/dashboard')) setActiveTab('overview');
  }, [location.pathname]);

  // Settings sub-tab state (general, policy, payments, staff)
  const [settingsSubTab, setSettingsSubTab] = useState('general');
  const [propertyName, setPropertyName] = useState('The Grand StayWise Hotel');
  const [contactEmail, setContactEmail] = useState('admin@grandstaywise.com');
  const [phoneNumber, setPhoneNumber] = useState('+1 (555) 123-4567');
  const [propertyDesc, setPropertyDesc] = useState('Luxury downtown accommodation featuring modern amenities, rooftop pool, and award-winning dining options.');
  const [checkInTime, setCheckInTime] = useState('14:00');
  const [checkOutTime, setCheckOutTime] = useState('11:00');
  const [cancelPolicy, setCancelPolicy] = useState('free_24h');
  const [razorpaySandbox, setRazorpaySandbox] = useState(true);

  // Stats states
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalBookingsCount: 0,
    occupancyRate: 75,
    activeProperties: 3
  });

  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter local states (Manage Rooms)
  const [roomSearch, setRoomSearch] = useState('');
  const [roomTypeFilter, setRoomTypeFilter] = useState('');
  const [roomStatusFilter, setRoomStatusFilter] = useState('');

  // Search local states (Manage Bookings)
  const [bookingSearch, setBookingSearch] = useState('');

  // Form states for creating rooms
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [selectedHotelId, setSelectedHotelId] = useState('');
  const [roomType, setRoomType] = useState('Standard');
  const [capacity, setCapacity] = useState(2);
  const [price, setPrice] = useState(150);
  const [imageFile, setImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  useEffect(() => {
    // Redirection if not admin
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchAdminData();
  }, [user, navigate]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // 1. Fetch bookings
      const bookingsRes = await axios.get(`${BASE_API_URL}/api/bookings`, getHeaders());
      const bookingsData = bookingsRes.data.data;
      setBookings(bookingsData);

      // 2. Fetch rooms
      const roomsRes = await axios.get(`${BASE_API_URL}/api/rooms`, getHeaders());
      const roomsData = roomsRes.data.data;
      setRooms(roomsData);

      // 3. Fetch hotels
      const hotelsRes = await axios.get(`${BASE_API_URL}/api/hotels`, getHeaders());
      const hotelsData = hotelsRes.data.data;
      setHotels(hotelsData);
      if (hotelsData.length > 0 && !selectedHotelId) {
        setSelectedHotelId(hotelsData[0]._id);
      }

      // 4. Calculate stats
      const totalRevenue = bookingsData
        .filter(b => b.bookingStatus === 'confirmed')
        .reduce((sum, b) => sum + b.totalAmount, 0);

      const activeBookingsCount = bookingsData.filter(b => b.bookingStatus === 'confirmed').length;
      const totalRoomsCount = roomsData.length;
      const occupancyRate = totalRoomsCount > 0 ? Math.round((activeBookingsCount / totalRoomsCount) * 100) : 0;

      setStats({
        totalRevenue,
        totalBookingsCount: bookingsData.length,
        occupancyRate: Math.min(100, Math.max(15, occupancyRate + 35)), // pad slightly for demo occupancy rate representation
        activeProperties: hotelsData.length
      });

    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      alert('Please upload an image for the room.');
      return;
    }
    setIsUploading(true);
    try {
      // 1. Upload the image
      const formData = new FormData();
      formData.append('image', imageFile);

      const uploadRes = await axios.post(`${BASE_API_URL}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!uploadRes.data.success) {
        throw new Error('Image upload failed');
      }

      const imageUrl = uploadRes.data.url;

      // 2. Create the room
      const response = await axios.post(`${BASE_API_URL}/api/rooms`, {
        hotelId: selectedHotelId,
        roomType,
        capacity,
        price,
        availability: true,
        images: [imageUrl]
      }, getHeaders());

      if (response.data.success) {
        alert('Room added successfully!');
        setIsAddRoomOpen(false);
        setImageFile(null);
        fetchAdminData(); // Refresh list
      }
    } catch (error) {
      console.error(error);
      alert('Failed to add room.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (window.confirm('Are you sure you want to delete this room configuration?')) {
      try {
        await axios.delete(`${BASE_API_URL}/api/rooms/${roomId}`, getHeaders());
        fetchAdminData();
      } catch (error) {
        alert('Failed to delete room.');
      }
    }
  };

  const handleToggleAvailability = async (roomId, currentAvailability) => {
    try {
      const response = await axios.put(`${BASE_API_URL}/api/rooms/${roomId}`, {
        availability: !currentAvailability
      }, getHeaders());

      if (response.data.success) {
        fetchAdminData();
      }
    } catch (error) {
      alert('Failed to update availability.');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Cancel this reservation? This will trigger refund parameters.')) {
      try {
        await axios.delete(`${BASE_API_URL}/api/bookings/${bookingId}`, getHeaders());
        fetchAdminData();
      } catch (error) {
        alert('Failed to cancel booking.');
      }
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/');
  };

  // Filtered rooms list
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.roomType.toLowerCase().includes(roomSearch.toLowerCase()) || 
                          (room.hotelId?.name && room.hotelId.name.toLowerCase().includes(roomSearch.toLowerCase())) ||
                          room._id.includes(roomSearch);
    const matchesType = roomTypeFilter === '' || room.roomType.toLowerCase() === roomTypeFilter.toLowerCase();
    
    let matchesStatus = true;
    if (roomStatusFilter === 'available') {
      matchesStatus = room.availability === true;
    } else if (roomStatusFilter === 'soldout') {
      matchesStatus = room.availability === false;
    }

    return matchesSearch && matchesType && matchesStatus;
  });

  // Filtered bookings list
  const filteredBookings = bookings.filter(booking => {
    const guestName = booking.guestDetails?.name || '';
    const hotelName = booking.hotelId?.name || '';
    const email = booking.guestDetails?.email || '';

    const matchesSearch = guestName.toLowerCase().includes(bookingSearch.toLowerCase()) || 
                          hotelName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
                          email.toLowerCase().includes(bookingSearch.toLowerCase()) ||
                          booking._id.includes(bookingSearch);
    return matchesSearch;
  });

  if (loading && hotels.length === 0) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-surface">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-vibrant"></div>
      </div>
    );
  }

  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: 'dashboard' },
    { id: 'rooms', label: 'Manage Rooms', icon: 'bed' },
    { id: 'bookings', label: 'Manage Bookings', icon: 'calendar_month' },
    { id: 'revenue', label: 'Revenue', icon: 'payments' },
    { id: 'settings', label: 'Settings', icon: 'settings' }
  ];

  return (
    <div className="min-h-screen bg-background flex text-on-background font-body-md text-body-md antialiased overflow-x-hidden">
      
      {/* ========================================================
          SIDEBAR NAVIGATION (Desktop & Drawer on Mobile) 
          ======================================================== */}
      
      {/* Overlay for mobile menu */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/40 z-40 md:hidden backdrop-blur-sm"
        />
      )}

      <aside className={`h-screen w-64 bg-primary text-white flex flex-col fixed left-0 top-0 border-r border-outline-variant/10 shadow-xl z-50 transition-transform duration-300 md:translate-x-0 ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6 pb-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-teal-vibrant flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>domain</span>
            </div>
            <div>
              <h1 className="font-headline-md text-headline-md text-white font-bold tracking-tight">StayWise.ai</h1>
              <p className="font-label-sm text-label-sm text-primary-fixed-dim">StayWise Management</p>
            </div>
          </div>
          
          <button 
            onClick={() => {
              navigate('/admin/rooms');
              setIsAddRoomOpen(true);
              setMobileMenuOpen(false);
            }}
            className="w-full bg-teal-vibrant text-white font-label-md text-label-md py-3 px-4 rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex justify-center items-center gap-2 font-semibold"
          >
            <span className="material-symbols-outlined">add</span>
            Add New Listing
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-grow overflow-y-auto py-4 px-2 space-y-1 font-label-md text-label-md">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                navigate(`/admin/${item.id === 'overview' ? 'dashboard' : item.id}`);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left rounded-lg mx-2 my-1 px-4 py-3 flex items-center gap-3 transition-all duration-150 ease-in-out ${
                activeTab === item.id 
                  ? 'bg-secondary-container text-white shadow-md font-semibold' 
                  : 'text-on-primary/70 hover:text-white hover:bg-primary-container/50'
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === item.id ? "'FILL' 1" : "'FILL' 0" }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Footer Support & Logout */}
        <div className="p-4 border-t border-on-primary/10 space-y-1 font-label-md text-label-md">
          <button 
            onClick={() => alert('Support portal is simulated. Please contact help@staywise.ai.')}
            className="w-full text-left text-on-primary/70 hover:text-white hover:bg-primary-container/50 rounded-lg mx-2 my-1 px-4 py-3 flex items-center gap-3 transition-all"
          >
            <span className="material-symbols-outlined">help</span>
            Support
          </button>
          <button 
            onClick={handleLogout}
            className="w-full text-left text-on-primary/70 hover:text-white hover:bg-primary-container/50 rounded-lg mx-2 my-1 px-4 py-3 flex items-center gap-3 transition-all"
          >
            <span className="material-symbols-outlined">logout</span>
            Logout
          </button>
        </div>
      </aside>

      {/* ========================================================
          MAIN AREA 
          ======================================================== */}
      <main className="flex-1 md:ml-64 w-full bg-background min-h-screen flex flex-col overflow-y-auto">
        
        {/* Sticky Header */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-outline-variant/20 px-6 py-4 flex justify-between items-center h-20 shadow-[0_1px_3px_rgba(0,39,104,0.05)]">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-on-surface hover:bg-surface-container rounded-full transition-colors"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary font-bold capitalize">
              {activeTab === 'overview' ? 'Overview' : activeTab.replace('_', ' ')}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Mock Search */}
            <div className="hidden sm:flex items-center bg-surface-container-low rounded-full px-4 py-2 border border-outline-variant/30">
              <span className="material-symbols-outlined text-outline mr-2 text-sm">search</span>
              <input 
                className="bg-transparent border-none focus:outline-none focus:ring-0 text-body-md font-body-md p-0 w-48 text-on-surface" 
                placeholder="Search analytics..." 
                type="text"
              />
            </div>
            
            {/* Notifications */}
            <button className="relative p-2 text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full"></span>
            </button>


          </div>
        </header>

        {/* Content Container */}
        <div className="flex-grow p-6 md:p-10 space-y-8 max-w-container-max mx-auto w-full pb-24">
          
          {/* ========================================================
              TAB CONTENT: OVERVIEW (DASHBOARD) 
              ======================================================== */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-[0px_4px_12px_rgba(0,59,149,0.04)] border border-outline-variant/20 flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-primary-container/10 rounded-lg text-primary">
                      <span className="material-symbols-outlined">payments</span>
                    </div>
                    <span className="flex items-center text-teal-vibrant font-label-sm text-label-sm bg-teal-vibrant/10 px-2 py-0.5 rounded-md">
                      <span className="material-symbols-outlined text-[14px] mr-0.5">trending_up</span> 12.4%
                    </span>
                  </div>
                  <div>
                    <p className="font-label-md text-label-md text-slate-500 mb-1">Total Revenue</p>
                    <h3 className="font-display-lg text-display-lg text-primary font-bold">${stats.totalRevenue}</h3>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-[0px_4px_12px_rgba(0,59,149,0.04)] border border-outline-variant/20 flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-primary-container/10 rounded-lg text-primary">
                      <span className="material-symbols-outlined">book_online</span>
                    </div>
                    <span className="flex items-center text-teal-vibrant font-label-sm text-label-sm bg-teal-vibrant/10 px-2 py-0.5 rounded-md">
                      <span className="material-symbols-outlined text-[14px] mr-0.5">trending_up</span> 8.5%
                    </span>
                  </div>
                  <div>
                    <p className="font-label-md text-label-md text-slate-500 mb-1">Total Bookings</p>
                    <h3 className="font-display-lg text-display-lg text-primary font-bold">{stats.totalBookingsCount}</h3>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-[0px_4px_12px_rgba(0,59,149,0.04)] border border-outline-variant/20 flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-primary-container/10 rounded-lg text-primary">
                      <span className="material-symbols-outlined">bed</span>
                    </div>
                    <span className="flex items-center text-error font-label-sm text-label-sm bg-error/10 px-2 py-0.5 rounded-md">
                      <span className="material-symbols-outlined text-[14px] mr-0.5">trending_down</span> 2%
                    </span>
                  </div>
                  <div>
                    <p className="font-label-md text-label-md text-slate-500 mb-1">Available Rooms</p>
                    <h3 className="font-display-lg text-display-lg text-primary font-bold">
                      {rooms.filter(r => r.availability).length}
                    </h3>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-[0px_4px_12px_rgba(0,59,149,0.04)] border border-outline-variant/20 flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-primary-container/10 rounded-lg text-primary">
                      <span className="material-symbols-outlined">pie_chart</span>
                    </div>
                    <span className="flex items-center text-teal-vibrant font-label-sm text-label-sm bg-teal-vibrant/10 px-2 py-0.5 rounded-md">
                      <span className="material-symbols-outlined text-[14px] mr-0.5">trending_up</span> 4%
                    </span>
                  </div>
                  <div>
                    <p className="font-label-md text-label-md text-slate-500 mb-1">Occupancy Rate</p>
                    <h3 className="font-display-lg text-display-lg text-teal-vibrant font-bold">{stats.occupancyRate}%</h3>
                  </div>
                </div>
              </div>

              {/* CSS Visual Charts Mockup */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Revenue Bar Chart */}
                <div className="bg-white rounded-xl p-6 shadow-[0px_4px_12px_rgba(0,59,149,0.04)] border border-outline-variant/20">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-headline-md text-headline-md text-primary font-bold">Monthly Revenue</h3>
                    <span className="material-symbols-outlined text-outline cursor-pointer">more_vert</span>
                  </div>
                  
                  <div className="h-64 flex items-end justify-between gap-2 border-b border-outline-variant/20 pb-2 relative">
                    <div className="absolute -left-2 bottom-0 top-0 w-8 flex flex-col justify-between text-xs text-slate-500 text-right py-2">
                      <span>$15k</span><span>$10k</span><span>$5k</span><span>0</span>
                    </div>
                    <div className="w-full flex justify-around items-end h-full pl-8">
                      <div className="w-1/12 bg-primary-container/20 rounded-t-sm h-[40%] hover:bg-primary transition-all cursor-pointer relative group">
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">$6k</div>
                      </div>
                      <div className="w-1/12 bg-primary-container/40 rounded-t-sm h-[60%] hover:bg-primary transition-all cursor-pointer relative group"></div>
                      <div className="w-1/12 bg-primary-container/60 rounded-t-sm h-[85%] hover:bg-primary transition-all cursor-pointer relative group"></div>
                      <div className="w-1/12 bg-primary-container/30 rounded-t-sm h-[50%] hover:bg-primary transition-all cursor-pointer relative group"></div>
                      <div className="w-1/12 bg-teal-vibrant rounded-t-sm h-[95%] hover:bg-teal-vibrant/80 transition-all cursor-pointer relative group shadow-[0_0_10px_rgba(0,191,179,0.3)]">
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">${stats.totalRevenue}</div>
                      </div>
                      <div className="w-1/12 bg-primary-container/50 rounded-t-sm h-[70%] hover:bg-primary transition-all cursor-pointer relative group"></div>
                    </div>
                  </div>
                  <div className="flex justify-around pl-8 mt-2 text-xs text-slate-500">
                    <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span className="font-bold text-primary">May</span><span>Jun</span>
                  </div>
                </div>

                {/* Booking Trends SVG mock */}
                <div className="bg-white rounded-xl p-6 shadow-[0px_4px_12px_rgba(0,59,149,0.04)] border border-outline-variant/20">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-headline-md text-headline-md text-primary font-bold">Booking Trends</h3>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-surface-container text-primary cursor-pointer">Weekly</span>
                    </div>
                  </div>
                  
                  <div className="h-64 relative border-b border-l border-outline-variant/20 p-4">
                    <div className="absolute inset-0 grid grid-rows-4 z-0">
                      <div className="border-b border-outline-variant/10"></div>
                      <div className="border-b border-outline-variant/10"></div>
                      <div className="border-b border-outline-variant/10"></div>
                      <div></div>
                    </div>
                    <div className="relative z-10 w-full h-full">
                      <svg className="w-full h-full text-teal-vibrant stroke-current" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M0,80 Q20,20 40,60 T80,30 T100,10" fill="none" strokeWidth="2" strokeLinecap="round" />
                        <path d="M0,80 Q20,20 40,60 T80,30 T100,10 L100,100 L0,100 Z" fill="currentColor" fillOpacity="0.1" stroke="none" />
                        <circle cx="40" cy="60" fill="#ffffff" r="3" stroke="#00BFB3" strokeWidth="2"></circle>
                        <circle cx="80" cy="30" fill="#ffffff" r="3" stroke="#00BFB3" strokeWidth="2"></circle>
                      </svg>
                    </div>
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-slate-500">
                    <span>Week 1</span><span>Week 2</span><span>Week 3</span><span>Week 4</span>
                  </div>
                </div>
              </div>

              {/* Recent Reservations Table */}
              <div className="bg-white rounded-xl shadow-[0px_4px_12px_rgba(0,59,149,0.04)] border border-outline-variant/20 overflow-hidden">
                <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center">
                  <h3 className="font-headline-md text-headline-md text-primary font-bold">Recent Reservations</h3>
                  <button 
                    onClick={() => navigate('/admin/bookings')}
                    className="font-label-md text-label-md text-teal-vibrant hover:underline flex items-center gap-1 font-semibold"
                  >
                    View All <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </div>
                
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left text-sm border-collapse min-w-[700px]">
                    <thead>
                      <tr className="border-b border-outline-variant/20 text-slate-500 bg-surface-container-low/50">
                        <th className="py-4 px-6 font-semibold">Hotel & Room</th>
                        <th className="py-4 px-6 font-semibold">Guest</th>
                        <th className="py-4 px-6 font-semibold">Dates</th>
                        <th className="py-4 px-6 font-semibold">Paid Amount</th>
                        <th className="py-4 px-6 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10">
                      {bookings.slice(0, 4).map((booking) => (
                        <tr key={booking._id} className="hover:bg-surface-container-low/30 transition-colors">
                          <td className="py-4 px-6 font-semibold text-primary">
                            {booking.hotelId?.name}
                            <span className="block font-normal text-xs text-slate-500">{booking.roomId?.roomType} Room</span>
                          </td>
                          <td className="py-4 px-6">
                            <p className="font-semibold">{booking.guestDetails?.name}</p>
                            <p className="text-xs text-slate-500">{booking.guestDetails?.email}</p>
                          </td>
                          <td className="py-4 px-6 text-xs text-slate-600">
                            {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-6 font-bold text-teal-vibrant">
                            ${booking.totalAmount}
                          </td>
                          <td className="py-4 px-6">
                            {booking.bookingStatus === 'confirmed' ? (
                              <button 
                                onClick={() => handleCancelBooking(booking._id)}
                                className="text-xs text-error hover:underline font-semibold"
                              >
                                Cancel
                              </button>
                            ) : (
                              <span className="text-xs text-slate-400 font-bold uppercase">{booking.bookingStatus}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB CONTENT: MANAGE ROOMS 
              ======================================================== */}
          {activeTab === 'rooms' && (
            <div className="space-y-6">
              {/* Header and Add Room Actions */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="font-headline-md text-headline-md text-primary font-bold">Properties Inventory</h3>
                  <p className="text-sm text-slate-500">Configure rooms details, availability status and pricing structures</p>
                </div>
                <button 
                  onClick={() => setIsAddRoomOpen(true)}
                  className="bg-teal-vibrant text-white font-label-md text-label-md px-6 py-3 rounded-lg flex items-center justify-center gap-2 hover:shadow-lg transition-all hover:bg-teal-vibrant/90 font-semibold shadow-md"
                >
                  <span className="material-symbols-outlined">add</span>
                  Add New Room
                </button>
              </div>

              {/* Filters Panel */}
              <div className="bg-white rounded-xl shadow-[0px_4px_12px_rgba(0,59,149,0.06)] p-6 flex flex-col md:flex-row items-end gap-4 border border-outline-variant/20">
                <div className="w-full md:w-1/3">
                  <label className="block font-label-sm text-label-sm text-slate-500 mb-1.5">Search Rooms</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">search</span>
                    <input 
                      value={roomSearch}
                      onChange={(e) => setRoomSearch(e.target.value)}
                      className="w-full pl-10 pr-4 h-12 rounded-lg border border-outline-variant/60 focus:border-teal-vibrant focus:outline-none bg-white text-on-surface text-sm transition-all" 
                      placeholder="Search by hotel or room class..." 
                      type="text"
                    />
                  </div>
                </div>

                <div className="w-full md:w-1/4">
                  <label className="block font-label-sm text-label-sm text-slate-500 mb-1.5">Room Class</label>
                  <select 
                    value={roomTypeFilter}
                    onChange={(e) => setRoomTypeFilter(e.target.value)}
                    className="w-full px-4 h-12 rounded-lg border border-outline-variant/60 focus:border-teal-vibrant focus:outline-none bg-white text-on-surface text-sm transition-all appearance-none"
                  >
                    <option value="">All Classes</option>
                    <option value="Suite">Suite</option>
                    <option value="Deluxe">Deluxe</option>
                    <option value="Standard">Standard</option>
                  </select>
                </div>

                <div className="w-full md:w-1/4">
                  <label className="block font-label-sm text-label-sm text-slate-500 mb-1.5">Availability Status</label>
                  <select 
                    value={roomStatusFilter}
                    onChange={(e) => setRoomStatusFilter(e.target.value)}
                    className="w-full px-4 h-12 rounded-lg border border-outline-variant/60 focus:border-teal-vibrant focus:outline-none bg-white text-on-surface text-sm transition-all appearance-none"
                  >
                    <option value="">All Statuses</option>
                    <option value="available">Available</option>
                    <option value="soldout">Sold Out</option>
                  </select>
                </div>

                <div className="w-full md:w-auto">
                  <button 
                    onClick={() => { setRoomSearch(''); setRoomTypeFilter(''); setRoomStatusFilter(''); }}
                    className="w-full md:w-auto h-12 px-6 bg-surface-container text-primary font-label-md text-label-md rounded-lg hover:bg-surface-container-high transition-colors font-semibold"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>

              {/* Rooms Inventory Data Table */}
              <div className="bg-white rounded-xl shadow-[0px_4px_12px_rgba(0,59,149,0.06)] border border-outline-variant/20 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px] text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container-low border-b border-outline-variant/20 text-slate-500">
                        <th className="py-4 px-6 font-semibold w-24">Room View</th>
                        <th className="py-4 px-6 font-semibold">Properties Name</th>
                        <th className="py-4 px-6 font-semibold">Room Class</th>
                        <th className="py-4 px-6 font-semibold">Rate / Night</th>
                        <th className="py-4 px-6 font-semibold text-center">Availability Toggle</th>
                        <th className="py-4 px-6 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10">
                      {filteredRooms.map((room) => (
                        <tr key={room._id} className="hover:bg-surface-container-low/30 transition-colors group">
                          <td className="py-4 px-6">
                            <div className="w-16 h-12 rounded-md overflow-hidden shadow-sm border border-outline-variant/10">
                              <img 
                                src={room.images?.[0] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=150&q=80'} 
                                alt={room.roomType} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <p className="font-semibold text-primary">{room.hotelId?.name || 'Seeded Property'}</p>
                            <p className="text-xs text-slate-500">ID: {room._id.substring(0, 12)}...</p>
                          </td>
                          <td className="py-4 px-6">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-surface-container-highest text-primary">
                              {room.roomType}
                            </span>
                          </td>
                          <td className="py-4 px-6 font-bold text-primary">
                            ${room.price}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <button
                              onClick={() => handleToggleAvailability(room._id, room.availability)}
                              className={`px-3 py-1 rounded-full text-xs font-bold transition-all shadow-sm ${
                                room.availability 
                                  ? 'bg-teal-vibrant/10 text-teal-vibrant hover:bg-teal-vibrant/20' 
                                  : 'bg-error/10 text-error hover:bg-error/20'
                              }`}
                            >
                              {room.availability ? 'Available' : 'Sold Out'}
                            </button>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button 
                              onClick={() => handleDeleteRoom(room._id)}
                              className="p-2 text-slate-500 hover:text-error hover:bg-error-container/20 rounded-md transition-colors"
                              title="Delete Room"
                            >
                              <span className="material-symbols-outlined text-[20px]">delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredRooms.length === 0 && (
                        <tr>
                          <td colSpan="6" className="py-12 text-center text-slate-500">
                            No rooms matching search filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB CONTENT: MANAGE BOOKINGS 
              ======================================================== */}
          {activeTab === 'bookings' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-headline-md text-headline-md text-primary font-bold">Platform Reservations</h3>
                <p className="text-sm text-slate-500">Audit check-in sheets and perform reservation cancellation overrides</p>
              </div>

              {/* Search Reservation Bar */}
              <div className="bg-white rounded-xl shadow-[0px_4px_12px_rgba(0,59,149,0.06)] p-6 border border-outline-variant/20">
                <label className="block font-label-sm text-label-sm text-slate-500 mb-1.5">Search Bookings</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">search</span>
                  <input 
                    value={bookingSearch}
                    onChange={(e) => setBookingSearch(e.target.value)}
                    className="w-full pl-10 pr-4 h-12 rounded-lg border border-outline-variant/60 focus:border-teal-vibrant focus:outline-none bg-white text-sm" 
                    placeholder="Search by customer name, hotel destination, email, or invoice ID..." 
                    type="text"
                  />
                </div>
              </div>

              {/* Data Table list */}
              <div className="bg-white rounded-xl shadow-[0px_4px_12px_rgba(0,59,149,0.06)] border border-outline-variant/20 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container-low border-b border-outline-variant/20 text-slate-500">
                        <th className="py-4 px-6 font-semibold">Invoice ID</th>
                        <th className="py-4 px-6 font-semibold">Customer details</th>
                        <th className="py-4 px-6 font-semibold">Destination hotel</th>
                        <th className="py-4 px-6 font-semibold">Stay Dates</th>
                        <th className="py-4 px-6 font-semibold">Paid Amount</th>
                        <th className="py-4 px-6 font-semibold text-center">Status</th>
                        <th className="py-4 px-6 font-semibold text-right">Action Override</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10">
                      {filteredBookings.map((booking) => (
                        <tr key={booking._id} className="hover:bg-surface-container-low/30 transition-colors">
                          <td className="py-4 px-6 font-mono text-xs text-primary font-bold">
                            {booking._id.substring(0, 16)}...
                          </td>
                          <td className="py-4 px-6">
                            <p className="font-semibold text-primary">{booking.guestDetails?.name}</p>
                            <p className="text-xs text-slate-500">{booking.guestDetails?.email}</p>
                          </td>
                          <td className="py-4 px-6">
                            <p className="font-semibold">{booking.hotelId?.name}</p>
                            <p className="text-xs text-slate-500">{booking.roomId?.roomType} Room</p>
                          </td>
                          <td className="py-4 px-6 text-xs text-slate-600">
                            {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-6 font-bold text-teal-vibrant">
                            ${booking.totalAmount}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                              booking.bookingStatus === 'confirmed' 
                                ? 'bg-teal-vibrant/10 text-teal-vibrant' 
                                : 'bg-error/10 text-error'
                            }`}>
                              {booking.bookingStatus}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            {booking.bookingStatus === 'confirmed' ? (
                              <button 
                                onClick={() => handleCancelBooking(booking._id)}
                                className="text-xs text-error hover:underline font-bold"
                              >
                                Cancel Booking
                              </button>
                            ) : (
                              <span className="text-xs text-slate-400 font-normal">No action available</span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {filteredBookings.length === 0 && (
                        <tr>
                          <td colSpan="7" className="py-12 text-center text-slate-500">
                            No reservations found matching search queries.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB CONTENT: REVENUE 
              ======================================================== */}
          {activeTab === 'revenue' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-headline-md text-headline-md text-primary font-bold">Revenue Analytics</h3>
                <p className="text-sm text-slate-500">Platform billing statements and transaction summary statistics</p>
              </div>

              {/* Stat ledgers */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
                  <span className="text-slate-500 text-xs uppercase font-semibold">Gross Income</span>
                  <h3 className="text-3xl font-bold text-primary mt-1">${stats.totalRevenue}</h3>
                </div>
                <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
                  <span className="text-slate-500 text-xs uppercase font-semibold">Simulated Razorpay Orders</span>
                  <h3 className="text-3xl font-bold text-primary mt-1">{stats.totalBookingsCount} Completed</h3>
                </div>
                <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
                  <span className="text-slate-500 text-xs uppercase font-semibold">Refund Volume</span>
                  <h3 className="text-3xl font-bold text-error mt-1">
                    ${bookings.filter(b => b.bookingStatus === 'cancelled').reduce((sum, b) => sum + b.totalAmount, 0)}
                  </h3>
                </div>
              </div>

              {/* Payment Method Breakdown */}
              <div className="bg-white rounded-xl shadow-[0px_4px_12px_rgba(0,59,149,0.04)] border border-outline-variant/20 p-6">
                <h4 className="font-semibold text-primary text-base mb-4">Payment Method Distribution</h4>
                <div className="flex items-center gap-4 text-sm font-semibold">
                  <div className="flex-1">
                    <p className="text-slate-500 mb-1">UPI (GPay / PhonePe) - 75%</p>
                    <div className="w-full bg-surface-container h-4 rounded-full overflow-hidden">
                      <div className="bg-teal-vibrant h-full rounded-full" style={{ width: '75%' }} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-500 mb-1">Credit / Debit Card - 25%</p>
                    <div className="w-full bg-surface-container h-4 rounded-full overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: '25%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB CONTENT: SETTINGS 
              ======================================================== */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <header className="flex justify-between items-center border-b border-outline-variant/20 pb-4">
                <div>
                  <h3 className="font-headline-md text-headline-md text-primary font-bold">Settings</h3>
                  <p className="text-sm text-slate-500">Manage your property details, policies, and operational preferences.</p>
                </div>
                <button 
                  onClick={() => alert('All settings changes saved successfully!')}
                  className="bg-primary hover:bg-primary/95 text-white font-label-md text-label-md py-2.5 px-6 rounded-lg transition-all shadow-md hover:shadow-lg font-semibold"
                >
                  Save All Changes
                </button>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                {/* Left Column: Sub-navigation & Quick Stats */}
                <div className="md:col-span-4 space-y-6">
                  {/* Navigation Menu */}
                  <div className="bg-white rounded-xl shadow-[0px_4px_12px_rgba(0,59,149,0.04)] border border-outline-variant/20 p-2">
                    <nav className="flex flex-col gap-1">
                      <button 
                        onClick={() => setSettingsSubTab('general')}
                        className={`w-full text-left font-label-md text-label-md py-3 px-4 rounded-lg flex items-center gap-3 transition-colors ${
                          settingsSubTab === 'general' 
                            ? 'bg-surface-container-low text-primary font-semibold' 
                            : 'text-slate-500 hover:bg-surface-container-low/50 hover:text-primary'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px] text-teal-vibrant" style={{ fontVariationSettings: settingsSubTab === 'general' ? "'FILL' 1" : "'FILL' 0" }}>domain</span>
                        General Settings
                      </button>
                      <button 
                        onClick={() => setSettingsSubTab('policy')}
                        className={`w-full text-left font-label-md text-label-md py-3 px-4 rounded-lg flex items-center gap-3 transition-colors ${
                          settingsSubTab === 'policy' 
                            ? 'bg-surface-container-low text-primary font-semibold' 
                            : 'text-slate-500 hover:bg-surface-container-low/50 hover:text-primary'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px] text-teal-vibrant" style={{ fontVariationSettings: settingsSubTab === 'policy' ? "'FILL' 1" : "'FILL' 0" }}>policy</span>
                        Booking Policies
                      </button>
                      <button 
                        onClick={() => setSettingsSubTab('payments')}
                        className={`w-full text-left font-label-md text-label-md py-3 px-4 rounded-lg flex items-center gap-3 transition-colors ${
                          settingsSubTab === 'payments' 
                            ? 'bg-surface-container-low text-primary font-semibold' 
                            : 'text-slate-500 hover:bg-surface-container-low/50 hover:text-primary'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px] text-teal-vibrant" style={{ fontVariationSettings: settingsSubTab === 'payments' ? "'FILL' 1" : "'FILL' 0" }}>credit_card</span>
                        Payment Settings
                      </button>
                      <button 
                        onClick={() => setSettingsSubTab('staff')}
                        className={`w-full text-left font-label-md text-label-md py-3 px-4 rounded-lg flex items-center gap-3 transition-colors ${
                          settingsSubTab === 'staff' 
                            ? 'bg-surface-container-low text-primary font-semibold' 
                            : 'text-slate-500 hover:bg-surface-container-low/50 hover:text-primary'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px] text-teal-vibrant" style={{ fontVariationSettings: settingsSubTab === 'staff' ? "'FILL' 1" : "'FILL' 0" }}>group</span>
                        Staff Management
                      </button>
                    </nav>
                  </div>

                  {/* Profile Completion Card */}
                  <div className="bg-primary text-white rounded-xl p-6 shadow-[0px_4px_12px_rgba(0,59,149,0.15)] relative overflow-hidden">
                    <div className="absolute -right-10 -top-10 w-32 h-32 bg-teal-vibrant/20 rounded-full blur-2xl"></div>
                    <h3 className="font-label-sm text-label-sm opacity-80 mb-1">Profile Completion</h3>
                    <div className="flex items-end gap-2 mb-4">
                      <span className="font-headline-lg text-headline-lg m-0 leading-none font-bold">85%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2 mb-3">
                      <div className="bg-teal-vibrant h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                    <p className="font-label-sm text-label-sm opacity-80 m-0">Complete Payment Settings to reach 100%.</p>
                  </div>
                </div>

                {/* Right Column: Forms Canvas */}
                <div className="md:col-span-8 space-y-6">
                  {/* General Settings */}
                  {settingsSubTab === 'general' && (
                    <section className="bg-white rounded-xl shadow-[0px_4px_12px_rgba(0,59,149,0.04)] border border-outline-variant/20 p-8 space-y-6 animate-fade-in">
                      <div className="border-b border-outline-variant/30 pb-4">
                        <h4 className="font-headline-md text-headline-md text-primary font-bold">General Settings</h4>
                        <p className="text-sm text-slate-500 mt-1">Basic information and branding details for your property.</p>
                      </div>

                      {/* Branding Logo Block */}
                      <div className="flex items-start gap-6 bg-surface-container-low/50 p-6 rounded-lg border border-outline-variant/20">
                        <div className="w-24 h-24 rounded-lg bg-white flex items-center justify-center border border-dashed border-outline-variant text-slate-400 shrink-0 relative overflow-hidden group cursor-pointer hover:border-teal-vibrant transition-colors">
                          <span className="material-symbols-outlined text-[32px] group-hover:text-teal-vibrant transition-colors">add_a_photo</span>
                          <div className="absolute inset-0 bg-primary/85 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="font-label-sm text-label-sm text-white">Upload</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h5 className="font-label-md text-label-md text-primary mb-1 font-semibold">Property Logo</h5>
                          <p className="text-sm text-slate-500 mb-3 font-normal">Used on receipts and invoice communications. Recommended size: 256x256px.</p>
                          <button type="button" onClick={() => alert('Simulating logo selection...')} className="text-teal-vibrant font-label-md text-label-md hover:underline font-semibold">Browse files</button>
                        </div>
                      </div>

                      {/* Form Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-1 md:col-span-2">
                          <label className="block font-label-sm text-label-sm text-slate-500 mb-1.5">Property Name</label>
                          <input 
                            type="text" 
                            value={propertyName} 
                            onChange={(e) => setPropertyName(e.target.value)}
                            className="w-full h-12 bg-white border border-outline-variant rounded-lg px-4 text-sm outline-none focus:border-teal-vibrant focus:ring-1 focus:ring-teal-vibrant transition-all"
                          />
                        </div>
                        <div>
                          <label className="block font-label-sm text-label-sm text-slate-500 mb-1.5">Contact Email</label>
                          <input 
                            type="email" 
                            value={contactEmail} 
                            onChange={(e) => setContactEmail(e.target.value)}
                            className="w-full h-12 bg-white border border-outline-variant rounded-lg px-4 text-sm outline-none focus:border-teal-vibrant focus:ring-1 focus:ring-teal-vibrant transition-all"
                          />
                        </div>
                        <div>
                          <label className="block font-label-sm text-label-sm text-slate-500 mb-1.5">Phone Number</label>
                          <input 
                            type="text" 
                            value={phoneNumber} 
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="w-full h-12 bg-white border border-outline-variant rounded-lg px-4 text-sm outline-none focus:border-teal-vibrant focus:ring-1 focus:ring-teal-vibrant transition-all"
                          />
                        </div>
                        <div className="col-span-1 md:col-span-2">
                          <label className="block font-label-sm text-label-sm text-slate-500 mb-1.5">Property Description</label>
                          <textarea 
                            rows="3"
                            value={propertyDesc} 
                            onChange={(e) => setPropertyDesc(e.target.value)}
                            className="w-full bg-white border border-outline-variant rounded-lg p-4 text-sm outline-none focus:border-teal-vibrant focus:ring-1 focus:ring-teal-vibrant transition-all resize-none"
                          />
                        </div>
                      </div>
                    </section>
                  )}

                  {/* Booking Policies */}
                  {settingsSubTab === 'policy' && (
                    <section className="bg-white rounded-xl shadow-[0px_4px_12px_rgba(0,59,149,0.04)] border border-outline-variant/20 p-8 space-y-6 animate-fade-in">
                      <div className="border-b border-outline-variant/30 pb-4">
                        <h4 className="font-headline-md text-headline-md text-primary font-bold">Booking Policies</h4>
                        <p className="text-sm text-slate-500 mt-1">Rules for check-in, check-out, and booking cancellations.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block font-label-sm text-label-sm text-slate-500 mb-1.5">Standard Check-In Time</label>
                          <input 
                            type="text" 
                            value={checkInTime} 
                            onChange={(e) => setCheckInTime(e.target.value)}
                            className="w-full h-12 bg-white border border-outline-variant rounded-lg px-4 text-sm outline-none focus:border-teal-vibrant focus:ring-1 focus:ring-teal-vibrant transition-all"
                          />
                        </div>
                        <div>
                          <label className="block font-label-sm text-label-sm text-slate-500 mb-1.5">Standard Check-Out Time</label>
                          <input 
                            type="text" 
                            value={checkOutTime} 
                            onChange={(e) => setCheckOutTime(e.target.value)}
                            className="w-full h-12 bg-white border border-outline-variant rounded-lg px-4 text-sm outline-none focus:border-teal-vibrant focus:ring-1 focus:ring-teal-vibrant transition-all"
                          />
                        </div>
                        <div className="col-span-1 md:col-span-2">
                          <label className="block font-label-sm text-label-sm text-slate-500 mb-1.5">Cancellation Policy</label>
                          <select 
                            value={cancelPolicy} 
                            onChange={(e) => setCancelPolicy(e.target.value)}
                            className="w-full h-12 bg-white border border-outline-variant rounded-lg px-4 text-sm outline-none focus:border-teal-vibrant focus:ring-1 focus:ring-teal-vibrant transition-all appearance-none"
                          >
                            <option value="free_24h">Free Cancellation (up to 24 hours before check-in)</option>
                            <option value="free_48h">Free Cancellation (up to 48 hours before check-in)</option>
                            <option value="non_refundable">Non-Refundable (100% cancellation charge applies)</option>
                          </select>
                        </div>
                      </div>
                    </section>
                  )}

                  {/* Payment Settings */}
                  {settingsSubTab === 'payments' && (
                    <section className="bg-white rounded-xl shadow-[0px_4px_12px_rgba(0,59,149,0.04)] border border-outline-variant/20 p-8 space-y-6 animate-fade-in">
                      <div className="border-b border-outline-variant/30 pb-4">
                        <h4 className="font-headline-md text-headline-md text-primary font-bold">Payment Settings</h4>
                        <p className="text-sm text-slate-500 mt-1">Configure credit card checkouts and payment processing gateways.</p>
                      </div>

                      <div className="space-y-6">
                        <div className="flex items-center justify-between bg-surface-container-low/50 p-4 rounded-lg border border-outline-variant/20">
                          <div>
                            <h5 className="font-label-md text-label-md text-primary font-semibold">Razorpay Simulated Sandbox Mode</h5>
                            <p className="text-xs text-slate-500 font-normal">Process payments inside the simulated checkout sandbox environment.</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={razorpaySandbox} 
                              onChange={(e) => setRazorpaySandbox(e.target.checked)} 
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-vibrant"></div>
                          </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block font-label-sm text-label-sm text-slate-500 mb-1.5">Razorpay Key ID</label>
                            <input 
                              type="text" 
                              disabled 
                              value="rzp_test_staywise2026demo" 
                              className="w-full h-12 bg-slate-50 text-slate-400 border border-outline-variant/40 rounded-lg px-4 text-sm cursor-not-allowed outline-none"
                            />
                          </div>
                          <div>
                            <label className="block font-label-sm text-label-sm text-slate-500 mb-1.5">Razorpay Key Secret</label>
                            <input 
                              type="password" 
                              disabled 
                              value="••••••••••••••••••••" 
                              className="w-full h-12 bg-slate-50 text-slate-400 border border-outline-variant/40 rounded-lg px-4 text-sm cursor-not-allowed outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </section>
                  )}

                  {/* Staff Management */}
                  {settingsSubTab === 'staff' && (
                    <section className="bg-white rounded-xl shadow-[0px_4px_12px_rgba(0,59,149,0.04)] border border-outline-variant/20 p-8 space-y-6 animate-fade-in">
                      <div className="border-b border-outline-variant/30 pb-4">
                        <h4 className="font-headline-md text-headline-md text-primary font-bold">Staff Management</h4>
                        <p className="text-sm text-slate-500 mt-1">Authorized administrative and receptionist account lists.</p>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse min-w-[500px]">
                          <thead>
                            <tr className="border-b border-outline-variant/20 text-slate-500 bg-surface-container-low/50">
                              <th className="py-3 px-4 font-semibold">Staff Member</th>
                              <th className="py-3 px-4 font-semibold">Access Role</th>
                              <th className="py-3 px-4 font-semibold">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-outline-variant/10 text-on-surface">
                            <tr className="hover:bg-surface-container-low/30 transition-colors">
                              <td className="py-3 px-4">
                                <p className="font-semibold text-primary">{user?.name || 'StayWise Administrator'}</p>
                                <p className="text-xs text-slate-500">{user?.email || 'admin@staywise.ai'}</p>
                              </td>
                              <td className="py-3 px-4 text-xs font-semibold text-primary">Super Administrator</td>
                              <td className="py-3 px-4">
                                <span className="text-[10px] bg-teal-vibrant/10 text-teal-vibrant px-2.5 py-1 rounded-full font-bold uppercase">Active</span>
                              </td>
                            </tr>
                            <tr className="hover:bg-surface-container-low/30 transition-colors">
                              <td className="py-3 px-4">
                                <p className="font-semibold text-primary">Alex FrontDesk</p>
                                <p className="text-xs text-slate-500">reception@staywise.ai</p>
                              </td>
                              <td className="py-3 px-4 text-xs font-semibold text-primary">Receptionist Agent</td>
                              <td className="py-3 px-4">
                                <span className="text-[10px] bg-teal-vibrant/10 text-teal-vibrant px-2.5 py-1 rounded-full font-bold uppercase">Active</span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </section>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ========================================================
          POPUP MODAL: ADD NEW ROOM INVENTORY 
          ======================================================== */}
      {isAddRoomOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-outline-variant/20 animate-fade-in-up p-6">
            <div className="flex justify-between items-center border-b border-outline-variant/10 pb-4 mb-4">
              <h3 className="text-lg font-bold text-primary">Add Room Inventory</h3>
              <button 
                onClick={() => setIsAddRoomOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="flex flex-col gap-4">
              <div>
                <label className="block font-label-sm text-label-sm text-slate-500 mb-1">Select Hotel Property</label>
                <select 
                  value={selectedHotelId}
                  required
                  onChange={(e) => setSelectedHotelId(e.target.value)}
                  className="w-full h-11 px-3 border border-outline-variant rounded-lg outline-none bg-white text-sm"
                >
                  {hotels.map(h => (
                    <option key={h._id} value={h._id}>{h.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-label-sm text-label-sm text-slate-500 mb-1">Room Class / Type</label>
                <select 
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                  className="w-full h-11 px-3 border border-outline-variant rounded-lg outline-none bg-white text-sm"
                >
                  <option value="Standard">Standard</option>
                  <option value="Deluxe">Deluxe</option>
                  <option value="Suite">Suite</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-label-sm text-label-sm text-slate-500 mb-1">Capacity</label>
                  <input 
                    type="number"
                    min="1"
                    required
                    value={capacity}
                    onChange={(e) => setCapacity(parseInt(e.target.value))}
                    className="w-full h-11 px-3 border border-outline-variant rounded-lg outline-none text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block font-label-sm text-label-sm text-slate-500 mb-1">Price / Night ($)</label>
                  <input 
                    type="number"
                    min="1"
                    required
                    value={price}
                    onChange={(e) => setPrice(parseInt(e.target.value))}
                    className="w-full h-11 px-3 border border-outline-variant rounded-lg outline-none text-sm bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-label-sm text-label-sm text-slate-500 mb-1">Room Image</label>
                <input 
                  type="file"
                  accept="image/*"
                  required
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="w-full h-11 px-3 border border-outline-variant rounded-lg outline-none bg-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-teal-vibrant/10 file:text-teal-vibrant hover:file:bg-teal-vibrant/20"
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button 
                  type="button"
                  onClick={() => setIsAddRoomOpen(false)}
                  className="flex-1 h-12 border border-outline-variant text-[#0b1c30] font-label-md text-label-md rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 h-12 bg-primary hover:bg-primary-container text-white font-label-md text-label-md rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? 'Uploading...' : 'Create Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
