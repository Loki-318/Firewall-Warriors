import Link from "./components/Link";
import Route from "./components/Route";
import Insights from "./pages/InsightsPage";
import MapPage from "./pages/MapPage";
import Profile from "./pages/Profile";
import './styles.css';
import Img from './assets/img.jpg';


function App() {
  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="navbar-logo">
          <h1>AQI SENTINEL</h1>
        </div>
        <div className="navbar-menu">
          <Link className="nav-item" to="/map">MAP</Link>
          <Link className="nav-item" to="/insights">INSIGHTS</Link>
        </div>
        <div className="navbar-user">
          <Link to="/profile" className="user-icon">
            <i className="fa fa-user"></i>
            {/* Alternatively, you can use an image: */}
            <img src={Img} alt="User" />
          </Link>
        </div>
      </nav>

      <div className="content">
        <Route path='/map'>
          <MapPage />
        </Route>
        <Route path='/insights'>
          <Insights />
        </Route>
        <Route path='/profile'>
          <Profile />
        </Route>
      </div>
    </div>
  );
}

export default App;


//     <Route path='/tutorial'>
//       <TutorialPage />
//     </Route>

//     <Route path='/boxes'>
//       <BoxesPage />
//     </Route>

//     <Route path='/solar'>
//       <SolarPage />
//     </Route>

//     <Route path='/temp'>
//       <Temp />
//     </Route>

//   </div>
//   <div className='absolute bottom-0 right-0 p-4 '>
//     <Link className="bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-4 rounded mr-2" to="/flowfield">Flow</Link>
//     <Link className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2" to="/boxes">Boxes</Link>
//     <Link className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2" to="/tutorial">Tute</Link>
//     <Link className="bg-black hover:bg-grey-800 text-white font-bold py-2 px-4 rounded mr-2" to="/solar">Sol</Link>
//     <Link className="bg-white hover:bg-grey-800 text-black font-bold py-2 px-4 rounded mr-2" to="/temp">Temp</Link>
//   </div>
// </div>