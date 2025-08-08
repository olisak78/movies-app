import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './store';

// Types
export interface Movie {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
}

export interface SearchItem {
  searchKeyword: string;
  searchResults: {
    [page: number]: Movie[];
  };
  totalResults: number;
}

interface MovieState {
  searches: SearchItem[];
  currentSearchKeyword: string | null;
  loading: boolean;
  error: string | null;
}

interface SearchParams {
  keyword: string;
  page: number;
}

interface ApiResponse {
  Search?: Movie[];
  totalResults?: string;
  Response: string;
  Error?: string;
}

// Initial state
const initialState: MovieState = {
  searches: [],
  currentSearchKeyword: null,
  loading: false,
  error: null,
};

// Async thunk for searching movies
export const searchMovies = createAsyncThunk<
  { movies: Movie[]; totalResults: number; keyword: string; page: number },
  SearchParams,
  { state: RootState }
>('movies/search', async ({ keyword, page }, { getState }) => {
  const state = getState();
  const existingSearch = state.movies.searches.find(
    (search) => search.searchKeyword === keyword
  );

  // Check if we already have this page in Redux
  if (existingSearch && existingSearch.searchResults[page]) {
    return {
      movies: existingSearch.searchResults[page],
      totalResults: existingSearch.totalResults,
      keyword,
      page,
    };
  }

  // Make API call
  const response = await fetch(
    `https://www.omdbapi.com/?s=${encodeURIComponent(
      keyword
    )}&apikey=c4503a0&r=json&type=movie&page=${page}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch movies');
  }

  const data: ApiResponse = await response.json();

  if (data.Response === 'False') {
    throw new Error(data.Error || 'Movie not found');
  }

  return {
    movies: data.Search || [],
    totalResults: parseInt(data.totalResults || '0', 10),
    keyword,
    page,
  };
});

// Slice
const movieSlice = createSlice({
  name: 'movies',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentSearchKeyword: (state, action: PayloadAction<string | null>) => {
      state.currentSearchKeyword = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchMovies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchMovies.fulfilled, (state, action) => {
        state.loading = false;
        const { movies, totalResults, keyword, page } = action.payload;

        // Set current search keyword
        state.currentSearchKeyword = keyword;

        // Find existing search or create new one
        const existingSearchIndex = state.searches.findIndex(
          (search) => search.searchKeyword === keyword
        );

        if (existingSearchIndex !== -1) {
          // Update existing search with new page
          state.searches[existingSearchIndex].searchResults[page] = movies;
          // Update total results in case it changed
          state.searches[existingSearchIndex].totalResults = totalResults;
        } else {
          // Create new search entry
          const newSearch: SearchItem = {
            searchKeyword: keyword,
            searchResults: {
              [page]: movies,
            },
            totalResults,
          };
          state.searches.push(newSearch);
        }
      })
      .addCase(searchMovies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to search movies';
      });
  },
});

export const { clearError, setCurrentSearchKeyword } = movieSlice.actions;
export default movieSlice.reducer;
