/*
 * Web Applications
 */

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

import dayjs from 'dayjs';

import { React, useState, useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Routes, Route, Outlet, Link, useParams, Navigate, useNavigate } from 'react-router';

//import FILMS from './films';

import { GenericLayout, NotFoundLayout, TableLayout, AddLayout, EditLayout, LoginLayout, TotpLayout } from './components/Layout';
import API from './API.js';

function App() {

  const navigate = useNavigate();  // To be able to call useNavigate, the component must already be in BrowserRouter, done in main.jsx

  // This state keeps track if the user is currently logged-in.
  const [loggedIn, setLoggedIn] = useState(false);
  // This state contains the user's info.
  const [user, setUser] = useState(null);
  const [loggedInTotp, setLoggedInTotp] = useState(false);


  const [filmList, setFilmList] = useState([]);
  const [message, setMessage] = useState('');

  const [disabled, setDisabled] = useState(false);

  // If an error occurs, the error message will be shown using a state.
  const handleErrors = (err) => {
    //console.log('DEBUG: err: '+JSON.stringify(err));
    let msg = '';
    if (err.error)
      msg = err.error;
    else if (err.errors) {
      if (err.errors[0].msg)
        msg = err.errors[0].msg + " : " + err.errors[0].path;
    } else if (Array.isArray(err))
      msg = err[0].msg + " : " + err[0].path;
    else if (typeof err === "string") msg = String(err);
    else msg = "Unknown Error";
    setMessage(msg); // WARNING: a more complex application requires a queue of messages. In this example only the last error is shown.
    console.log(err);

  }

  useEffect(()=> {
    const checkAuth = async() => {
      try {
        // here you have the user info, if already logged in
        const user = await API.getUserInfo();
        setLoggedIn(true);
        setUser(user);
        if (user.isTotp)
          setLoggedInTotp(true);
      } catch(err) {
        // NO need to do anything: user is simply not yet authenticated
        //handleError(err);
      }
    };
    checkAuth();
  }, []);  // The useEffect callback is called only the first time the component is mounted.


  /**
   * Defining a structure for Filters
   * Each filter is identified by a unique name and is composed by the following fields:
   * - A label to be shown in the GUI
   * - A URL for the router
   * - A filter function applied before passing the films to the FilmTable component
   */
  const filters = {
    'all': { label: 'All', url: '/', filterFunction: () => true },
    'favorite': { label: 'Favorites', url: '/filter/favorite', filterFunction: film => film.favorite },
    'best': { label: 'Best Rated', url: '/filter/best', filterFunction: film => film.rating >= 5 },
    'lastmonth': { label: 'Seen Last Month', url: '/filter/lastmonth', filterFunction: film => isSeenLastMonth(film) },
    'unseen': { label: 'Unseen', url: '/filter/unseen', filterFunction: film => film.watchDate ? false : true }
  };

  const isSeenLastMonth = (film) => {
    if ('watchDate' in film) {  // Accessing watchDate only if defined
      const diff = film.watchDate.diff(dayjs(), 'month')
      const isLastMonth = diff <= 0 && diff > -1;      // last month
      return isLastMonth;
    }
  }

  const filtersToArray = Object.entries(filters);
  //console.log(JSON.stringify(filtersToArray));

  // NB: to implicitly return an object in an arrow function, use () around the object {}
  // const filterArray = filtersToArray.map( e => ({filterName: e[0], ...e[1]}) );
  // alternative with destructuring directly in the parameter of the callback 
  const filterArray = filtersToArray.map(([filterName, obj ]) =>
     ({ filterName: filterName, ...obj }));

  /**
   * This function handles the login process.
   * It requires a username and a password inside a "credentials" object.
   */
  const handleLogin = async (credentials) => {
    try {
      const user = await API.logIn(credentials);
      setUser(user);
      setLoggedIn(true);
      setDisabled(false);
    } catch (err) {
      // error is handled and visualized in the login form, do not manage error, throw it
      throw err;
    }
  };

  /**
   * This function handles the logout process.
   */ 
  const handleLogout = async () => {
    try {
      await API.logOut();
    } catch (err) {
      // Cannot do anything more if logout fails: just avoid uncaught rejected promise
      console.log(err);
    } finally {
      setLoggedIn(false);
      setLoggedInTotp(false);
      // clean up everything
      setUser(null);
      setFilmList([]);
      setMessage('');
      setDisabled(false);
    }
  };

  const refreshFilmList = (filterId) => {
    API.getFilms(filterId || '')
      .then(films => {
        setFilmList(films);
      })
      .catch(err => { handleErrors(err); } )
      .finally(() => setDisabled(false));
  }


  function deleteFilm(filmId, filterId) {
    setDisabled(true);
    API.deleteFilm(filmId)
      .catch(err=>handleErrors(err))
      .finally(()=>refreshFilmList(filterId));
  }

  function editFilm(film, filterId) {
    setDisabled(true);
    API.updateFilm(film)
      .catch(err=>handleErrors(err))
      .finally(()=>{ refreshFilmList(filterId); if (!filterId) navigate('/'); });
  }

  function setFilmFavorite(id, favorite, filterId) {
    setDisabled(true);
    API.setFilmFavorite(id, favorite)
      .catch(err=>handleErrors(err))
      .finally(()=>{ refreshFilmList(filterId); if (!filterId) navigate('/'); });
  }

  function setFilmRating(id, favorite, filterId) {
    setDisabled(true);
    API.setFilmRating(id, favorite)
      .catch(err=>handleErrors(err))
      .finally(()=>{ refreshFilmList(filterId); if (!filterId) navigate('/'); });
  }

  function addFilm(film) {
    API.addFilm(film)
      .catch(err=>handleErrors(err))
      .finally(()=>{ refreshFilmList(); navigate('/'); });
  }

  return (
      <Container fluid>
        <Routes>
          <Route path="/" element={loggedIn? <GenericLayout filterArray={filterArray} 
                                    message={message} setMessage={setMessage}
                                    loggedIn={loggedIn} user={user} loggedInTotp={loggedInTotp} 
                                    logout={handleLogout} /> : <Navigate replace to='/login' />} >
            <Route index element={loggedIn? <TableLayout 
                 filmList={filmList} setFilmList={setFilmList} filters={filters} 
                 deleteFilm={deleteFilm} editFilm={editFilm}
                 setFilmFavorite={setFilmFavorite} setFilmRating={setFilmRating}
                 handleErrors={handleErrors}
                 disabled={disabled}
                 disableActions={!loggedInTotp} /> : <Navigate replace to='/' />} />
            <Route path="add" element={loggedInTotp? <AddLayout addFilm={addFilm} /> : <Navigate replace to='/' />} />
            <Route path="edit/:filmId" element={loggedInTotp? <EditLayout films={filmList} editFilm={editFilm} /> : <Navigate replace to='/' />} />
            <Route path="filter/:filterId" element={loggedIn? <TableLayout 
                 filmList={filmList} setFilmList={setFilmList}
                 filters={filters} deleteFilm={deleteFilm} editFilm={editFilm}
                 setFilmFavorite={setFilmFavorite} setFilmRating={setFilmRating}
                 handleErrors={handleErrors}
                 disabled={disabled} 
                 disableActions={!loggedInTotp} />
                 : <Navigate replace to='/' />} />
            <Route path="*" element={<NotFoundLayout />} />
          </Route>
          <Route path="/login" element={ <LoginWithTotp loggedIn={loggedIn} login={handleLogin}
                                        user={user} setLoggedInTotp={setLoggedInTotp} setLoggedIn={setLoggedIn} /> } />
        </Routes>
      </Container>
  );
}

function LoginWithTotp(props) {
  if (props.loggedIn) {
    if (props.user.canDoTotp) {
      if (props.loggedInTotp) {
        return <Navigate replace to='/' />;
      } else {
        return <TotpLayout totpSuccessful={() => props.setLoggedInTotp(true)} setLoggedIn={props.setLoggedIn} />;
      }
    } else {
      return <Navigate replace to='/' />;
    }
  } else {
    return <LoginLayout login={props.login} />;
  }
}

export default App;
