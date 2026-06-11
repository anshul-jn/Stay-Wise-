import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;

export const fetchHotels = createAsyncThunk(
  'hotels/fetchAll',
  async (filters = {}, thunkAPI) => {
    try {
      // Build query string
      const params = new URLSearchParams();
      if (filters.location) params.append('location', filters.location);
      if (filters.rating) params.append('rating', filters.rating);
      if (filters.priceMin) params.append('priceMin', filters.priceMin);
      if (filters.priceMax) params.append('priceMax', filters.priceMax);
      if (filters.query) params.append('query', filters.query);
      if (filters.amenities && filters.amenities.length > 0) {
        params.append('amenities', filters.amenities.join(','));
      }

      const response = await axios.get(`${API_URL}/hotels?${params.toString()}`);
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchHotelDetails = createAsyncThunk(
  'hotels/fetchDetails',
  async (id, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/hotels/${id}`);
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchRecommendations = createAsyncThunk(
  'hotels/fetchRecommendations',
  async (userId = 'guest', thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/recommendations/${userId}`);
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const hotelSlice = createSlice({
  name: 'hotels',
  initialState: {
    list: [],
    details: null,
    recommendations: [],
    loading: false,
    error: null,
    searchParams: {
      location: '',
      checkIn: '',
      checkOut: '',
      guests: 1
    }
  },
  reducers: {
    setSearchParams: (state, action) => {
      state.searchParams = { ...state.searchParams, ...action.payload };
    },
    clearDetails: (state) => {
      state.details = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Hotels
      .addCase(fetchHotels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHotels.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchHotels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Hotel Details
      .addCase(fetchHotelDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHotelDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.details = action.payload;
      })
      .addCase(fetchHotelDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Recommendations
      .addCase(fetchRecommendations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecommendations.fulfilled, (state, action) => {
        state.loading = false;
        state.recommendations = action.payload;
      })
      .addCase(fetchRecommendations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { setSearchParams, clearDetails } = hotelSlice.actions;
export default hotelSlice.reducer;
