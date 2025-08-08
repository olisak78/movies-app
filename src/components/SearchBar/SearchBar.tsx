import './SearchBar.css';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store/store';
import { searchMovies, toggleShowFavoritesOnly } from '../../store/movieSlice';
import { IoMdClose } from 'react-icons/io';
import { FaStar, FaRegStar } from 'react-icons/fa';

const SearchBar: React.FC = () => {
  const [searchInput, setSearchInput] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, showFavoritesOnly } = useSelector(
    (state: RootState) => state.movies
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = searchInput.trim();

    if (trimmedInput) {
      dispatch(searchMovies({ keyword: trimmedInput, page: 1 }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handleClearInput = () => {
    setSearchInput('');
  };

  const handleToggleFavorites = () => {
    dispatch(toggleShowFavoritesOnly());
  };

  const handleAddMovie = () => {
    // To be implemented later
    console.log('Add Movie clicked');
  };

  return (
    <div className='search-bar-container'>
      <form onSubmit={handleSubmit} className='search-form'>
        <div className='search-input-wrapper'>
          <input
            type='text'
            value={searchInput}
            onChange={handleInputChange}
            placeholder='Search for movies...'
            className='search-input'
            disabled={loading}
          />
          {searchInput && (
            <button
              type='button'
              className='clear-button'
              onClick={handleClearInput}
              aria-label='Clear search input'
            >
              <IoMdClose />
            </button>
          )}
        </div>
        <button
          type='submit'
          className='search-button'
          disabled={loading || !searchInput.trim()}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
        <button
          type='button'
          className='add-movie-button'
          onClick={handleAddMovie}
        >
          Add Movie
        </button>

        <button
          type='button'
          className={`favorites-toggle ${showFavoritesOnly ? 'active' : ''}`}
          onClick={handleToggleFavorites}
          aria-label={
            showFavoritesOnly ? 'Show all movies' : 'Show favorites only'
          }
          title={showFavoritesOnly ? 'Show all movies' : 'Show favorites only'}
        >
          {showFavoritesOnly ? <FaStar /> : <FaRegStar />}
        </button>
      </form>
      {error && <div className='error-message'>{error}</div>}
    </div>
  );
};

export default SearchBar;
