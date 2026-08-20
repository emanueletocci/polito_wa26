import dayjs from 'dayjs';

import {useState} from 'react';
import {Form, Button, Alert} from 'react-bootstrap';
import { useNavigate, Link } from 'react-router';

import API from '../API.js';

const FilmForm = (props) => {
  const navigate = useNavigate();

  // If an error occurs, the error message will be shown using a state.
  const handleServerError = (err) => {
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
    setErrorMsg(msg);
  }

  /*
   * Creating a state for each parameter of the film.
   * There are two possible cases: 
   * - if we are creating a new film, the form is initialized with the default values.
   * - if we are editing a film, the form is pre-filled with the previous values.
   */
  const [title, setTitle] = useState(props.filmToEdit ? props.filmToEdit.title : '');
  const [favorite, setFavorite] = useState(props.filmToEdit ? props.filmToEdit.favorite : false);
  const [watchDate, setWatchDate] = useState((props.filmToEdit && props.filmToEdit.watchDate) ? props.filmToEdit.watchDate.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'));
  const [rating, setRating] = useState((props.filmToEdit && props.filmToEdit.rating) ? props.filmToEdit.rating : 0);

  const [errorMsg, setErrorMsg] = useState('');
  const [formDisabled, setFormDisabled] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();

    // String.trim() method is used for removing leading and ending whitespaces from the title.
    const film = { "title": title.trim(), "favorite": favorite, "rating": (isNaN(parseInt(rating))? rating : parseInt(rating)) }
    if (watchDate)  // adding watchDate only if it is defined
      film.watchDate = dayjs(watchDate);

    // Here some data validation can be inserted, if not yet forced with HTML5 attributes on form controls
    if (film.title.length == 0) {
      setErrorMsg('Title length cannot be 0');
    } else if (typeof film.rating === "string") {
      setErrorMsg('Invalid Rating value');
    } else if (film.rating < 0 || film.rating > 5) {
      setErrorMsg('Invalid value for Rating');
    } else {
      // Proceed to update the data

      setFormDisabled(true);  // disable the form to prevent multiple submissions
      if (props.filmToEdit) {
        // Film was edited, not created from scratch
        film.id = props.filmToEdit.id;
        API.updateFilm(film)
          .then( () => navigate('/') )
          .catch( err => { handleServerError(err); } )
          .finally(() => setFormDisabled(false) );
      } else {
        API.addFilm(film)
          .then( () => navigate('/') )
          .catch( err => { handleServerError(err); } )
          .finally(() => setFormDisabled(false) );
      }
    }
  }

  return (
    <>
    {errorMsg? <Alert variant='danger' onClose={()=>setErrorMsg('')} dismissible>{errorMsg}</Alert> : false }
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>Title</Form.Label>
        {/* required={true} forces the user to insert some characters, but if they are all spaces this is not checked */}
        <Form.Control type="text" required={true} value={title} onChange={event => setTitle(event.target.value)} 
          disabled={formDisabled}/>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Check type="checkbox" label="Favorite" name="favorite" checked={favorite} onChange={(event) => setFavorite(event.target.checked)} 
          disabled={formDisabled} />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Watch Date</Form.Label>
        { /* watchDate is an optional parameter. It have to be properly rendered only if available. */ }
        <Form.Control type="date" value={watchDate} onChange={event => {event.target.value ? setWatchDate(dayjs(event.target.value).format('YYYY-MM-DD')) : setWatchDate("")}}
          disabled={formDisabled} />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Rating</Form.Label>
        <Form.Control type="number" min={0} max={5} step={1} value={isNaN(rating)?'':rating} onChange={event => setRating(parseInt(event.target.value))}
           disabled={formDisabled} />
      </Form.Group>

      <Button className="mb-3" variant="primary" type="submit" disabled={formDisabled}>{formDisabled? 'Saving...':'Save'}</Button>
      &nbsp;
      <Button className="mb-3" variant="danger" onClick={()=>navigate('/')} disabled={formDisabled} >Cancel</Button>
    </Form>
    </>
  )

}

export { FilmForm };
