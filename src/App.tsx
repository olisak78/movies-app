import './App.css';
import Header from './components/Header/Header';
import Main from './components/Main/Main';

function App() {
  return (
    <div className='app-container'>
      <Header title='Movies App' />
      <Main />
    </div>
  );
}

export default App;
