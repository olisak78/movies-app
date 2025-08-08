import './SearchBar.css';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store/store';
import { searchMovies } from '../../store/movieSlice';
import { IoMdClose } from 'react-icons/io';

const SearchBar: React.FC = () => {
  const [searchInput, setSearchInput] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.movies);

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

  return (
    <div className='search-bar-container'>
      <form onSubmit={handleSubmit} className='search-form'>
        {/* Wrapper div for input and clear button */}
        <div className='search-input-wrapper'>
          <input
            type='text'
            value={searchInput}
            onChange={handleInputChange}
            placeholder='Search for movies...'
            className='search-input'
            disabled={loading}
          />
          {/* Clear button - only visible when input has content */}
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
      </form>
      {error && <div className='error-message'>{error}</div>}
    </div>
  );
};

export default SearchBar;
