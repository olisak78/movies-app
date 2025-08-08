import { Provider } from 'react-redux';
import './Main.css';
import SearchBar from '../SearchBar/SearchBar';
import List from '../List/List';
import { store } from '../../store/store';

const Main = () => {
  return (
    <div className='main-container'>
      <Provider store={store}>
        <div className='App'>
          <main className='app-main'>
            <SearchBar />
            <List />
          </main>
        </div>
      </Provider>
    </div>
  );
};
export default Main;
