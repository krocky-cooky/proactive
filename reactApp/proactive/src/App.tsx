
import './App.css';
import {BrowserRouter, Route} from 'react-router-dom';

import Top from './components/Top';
import Stats from './components/Stats';


function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Route exact path='/' component={Top} />
        <Route path='/stats' component={Stats} />
      </BrowserRouter>
    </div>
  );
}

export default App;
