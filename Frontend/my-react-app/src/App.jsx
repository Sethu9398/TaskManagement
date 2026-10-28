import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Signin from './Signin/signin';
import Home from './Home/home';
import Register from './Register/Register';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/register" element={<Register/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
