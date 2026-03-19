# APIs Documentation

## Get all films

* `GET /api/films`
* **Description**: Get the full list of films
* **Request body**: _None_
* **Response**: `200 OK` (success)
* **Response body**: Array of objects, each describing one film. Note that absence
of values is represented as null value in json.

``` json
[
    { "id": 1, "title": "Pulp Fiction", "favorite": 1, "watchDate": "2023-03-11" "rating": null, },
    ..
]
```

* **Error Responses:** `500 Internal Server Error` (generic error)

## Get a film by `id`

* `GET /api/films/:id`
* **Description**: Get the properties of a single Film object
* **Request body**: _None_
* **Response**: `200 OK` (success)
* **Response body**: A single film object

``` json
{ "id": 1, "title": "Pulp Fiction", "favorite": 1, "watchDate": "2023-03-11", "rating":** null,}
```

* **Error Responses:** `404 Not Found` if the film with the specified identifier does not exist in the database.

## Get a filtered list of films

* `GET /api/films?filter=value`
* **Description**: Retrieves a filtered list of films. For complex searches or filtering, standard API design uses the `?parameter=value` syntax within a GET operation on the collection.
* **Request body**: _None_
* **Response**: `200 OK` (success)
* **Response body**: Array of objects, each describing one film.

``` json
[
    { "id": 1, "title": "Pulp Fiction", "favorite": 1, "watchDate": "2023-03-11", "rating": null, },
    ..
]
```

* **Error Responses:** `422 Unprocessable Entity` if the query parameters fail formal validation checks.

## Create a film

* `POST /api/films`
* **Description**: Add a new film into films collection
* **Request body**: A JSON object containing the new film's information (without the ID, which is typically assigned by the database)

``` json
{"title": "Pulp Fiction", "favorite": 1, "watchDate": "2023-03-11", "rating":** null,}
```

* **Response**: `201 CREATED` (success)
* **Response body**: _None_

* **Error responses**: `422 Unprocessable Entity` if the incoming JSON payload fails formal data correctness validation (e.g., missing required fields, empty strings, or invalid numbers).

## Update an existing film

* `PUT /api/films/:id`
* **Description**: Replaces the values of the properties of a specific film.
* **Request body**: A JSON object containing the new film's information

``` json
{ "id": 1, "title": "Pulp Fiction", "favorite": 1, "watchDate": "2023-03-11", "rating":** null,}
```

* **Response**: `200 OK` (success)
* **Response body**: _None_
* **Error Responses:**  
  * `404 Not Found` if the film to update does not exist
  * `422 Unprocessable Entity` if the incoming JSON payload contains invalid data formats.

## Delete a film

* `DELETE /api/films/:id`
* **Description**: Deletes the specific element identified by its `:id`, from the films collection
* **Request body**: _None_
* **Response**: `200 OK` (success)
* **Response body**: _None_
* **Error Responses:** `204 Not Found` if the film to delete does not exist.

## Mark a film as favorite/unfavorite

* `PUT /api/films/:id/favorite`
* **Description**: Update an existing film to toggle its favorite status.
* **Request body**:  A JSON object containing the new favorite status (1 for true, 0 for false).

``` json
{ "favorite": 0 }
```

* **Response**: `200 OK` (success)
* **Response body**: _None_
* **Error Responses:**  
  * `404 Not Found` if the film does not exist
  * `422 Unprocessable Entity` if validation fails

## Change the rating

* `PUT /api/films/:id/rating`
* **Description**: Change the rating of a specific film by specifying a delta value (i.e., an amount to add or subtract to the rating, such as +1 or -1). Only ratings which are not null can be changed.
* **Request body**: A JSON object containing the delta value.

``` json
{ "delta": 1 }
```

* **Response**: `200 OK` (success)
* **Response body**: _None_
* **Error Responses:** `422 Unprocessable Entity` if the film's rating is null and cannot be changed, or if the resulting rating goes out of valid bounds.
