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

export interface MovieDetails {
  Title: string;
  Year: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Poster: string;
  imdbID: string;
  Type: string;
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
  movieDetailsCache: { [imdbID: string]: MovieDetails };
  favoriteMovies: string[]; // Array of imdbIDs
  showFavoritesOnly: boolean;
  loading: boolean;
  detailsLoading: boolean;
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
  movieDetailsCache: {},
  favoriteMovies: [],
  showFavoritesOnly: false,
  loading: false,
  detailsLoading: false,
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

// Async thunk for fetching movie details
export const fetchMovieDetails = createAsyncThunk<
  MovieDetails,
  string,
  { state: RootState }
>('movies/fetchDetails', async (imdbID, { getState }) => {
  const state = getState();

  // Check cache first
  if (state.movies.movieDetailsCache[imdbID]) {
    return state.movies.movieDetailsCache[imdbID];
  }

  // Make API call
  const response = await fetch(
    `https://www.omdbapi.com/?i=${imdbID}&apikey=c4503a0`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch movie details');
  }

  const data = await response.json();

  if (data.Response === 'False') {
    throw new Error(data.Error || 'Movie details not found');
  }

  return data as MovieDetails;
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
    toggleFavorite: (state, action: PayloadAction<string>) => {
      const imdbID = action.payload;
      const index = state.favoriteMovies.indexOf(imdbID);
      if (index > -1) {
        state.favoriteMovies.splice(index, 1);
      } else {
        state.favoriteMovies.push(imdbID);
      }
    },
    toggleShowFavoritesOnly: (state) => {
      state.showFavoritesOnly = !state.showFavoritesOnly;
    },
    updateMovieDetails: (state, action: PayloadAction<MovieDetails>) => {
      const movie = action.payload;
      state.movieDetailsCache[movie.imdbID] = movie;

      // Also update in search results if present
      state.searches.forEach((search) => {
        Object.values(search.searchResults).forEach((pageResults) => {
          const movieIndex = pageResults.findIndex(
            (m) => m.imdbID === movie.imdbID
          );
          if (movieIndex > -1) {
            pageResults[movieIndex] = {
              ...pageResults[movieIndex],
              Title: movie.Title,
              Year: movie.Year,
            };
          }
        });
      });
    },
  },
  extraReducers: (builder) => {
    builder
      // Search movies cases
      .addCase(searchMovies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchMovies.fulfilled, (state, action) => {
        state.loading = false;
        const { movies, totalResults, keyword, page } = action.payload;

        // Set current search keyword
        state.currentSearchKeyword = keyword;
        state.showFavoritesOnly = false; // Reset filter when new search

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
      })
      // Fetch movie details cases
      .addCase(fetchMovieDetails.pending, (state) => {
        state.detailsLoading = true;
      })
      .addCase(fetchMovieDetails.fulfilled, (state, action) => {
        state.detailsLoading = false;
        const movieDetails = action.payload;
        state.movieDetailsCache[movieDetails.imdbID] = movieDetails;
      })
      .addCase(fetchMovieDetails.rejected, (state) => {
        state.detailsLoading = false;
      });
  },
});

export const {
  clearError,
  setCurrentSearchKeyword,
  toggleFavorite,
  toggleShowFavoritesOnly,
  updateMovieDetails,
} = movieSlice.actions;
export default movieSlice.reducer;
