# APIs Documentation

## Get all films

* `GET /api/films`
* Description: Get the full list of films
* Request body: _None_
* Response: `200 OK` (success)
* Response body: Array of objects, each describing one film. Note that absence
of values is represented as null value in json.

``` json
[
    { "id": 1, "title": "Pulp Fiction", "favorite": 1, "watchDate": "2023-03-11",
    "rating": null, },
...
]
```

* Error responses: `500 Internal Server Error` (generic error)

## Get a film by `id`

* `GET /api/film/:id`
* Description: Get a single film by its id
* Request body: _None_
* Response: `200 OK` (success)
* Response body: A film object

``` json
    { "id": 1, "title": "Pulp Fiction", "favorite": 1, "watchDate": "2023-03-11",
    "rating": null, },
```

* Error responses: `500 Internal Server Error` (generic error)

## Create a film

* `POST /api/film`
* Description: Create a new film
* Request body: _None_
* Response: `200 OK` (success)
* Response body: Array of objects, each describing one film. Note that absence
of values is represented as null value in json.

``` json
[
    { "id": 1, "title": "Pulp Fiction", "favorite": 1, "watchDate": "2023-03-11",
    "rating": null, },
...
]
```

* Error responses: `500 Internal Server Error` (generic error)

## Mark a film as favorite/unfavorite

* `GET /api/film`
* Description: Get the full list of films
* Request body: _None_
* Response: `200 OK` (success)
* Response body: Array of objects, each describing one film. Note that absence
of values is represented as null value in json.

``` json
[
    { "id": 1, "title": "Pulp Fiction", "favorite": 1, "watchDate": "2023-03-11",
    "rating": null, },
...
]
```

* Error responses: `500 Internal Server Error` (generic error)

## Change the rating

* `GET /api/film`
* Description: Get the full list of films
* Request body: _None_
* Response: `200 OK` (success)
* Response body: Array of objects, each describing one film. Note that absence
of values is represented as null value in json.

``` json
[
    { "id": 1, "title": "Pulp Fiction", "favorite": 1, "watchDate": "2023-03-11",
    "rating": null, },
...
]
```

* Error responses: `500 Internal Server Error` (generic error)

## Delete a film

* `GET /api/film`
* Description: Get the full list of films
* Request body: _None_
* Response: `200 OK` (success)
* Response body: Array of objects, each describing one film. Note that absence
of values is represented as null value in json.

``` json
[
    { "id": 1, "title": "Pulp Fiction", "favorite": 1, "watchDate": "2023-03-11",
    "rating": null, },
...
]
```

* Error responses: `500 Internal Server Error` (generic error)

## Get a filtered list of films

* `GET /api/film`
* Description: Get the full list of films
* Request body: _None_
* Response: `200 OK` (success)
* Response body: Array of objects, each describing one film. Note that absence
of values is represented as null value in json.

``` json
[
    { "id": 1, "title": "Pulp Fiction", "favorite": 1, "watchDate": "2023-03-11",
    "rating": null, },
...
]
```

* Error responses: `500 Internal Server Error` (generic error)

## Update an existing film

* `GET /api/film`
* Description: Get the full list of films
* Request body: _None_
* Response: `200 OK` (success)
* Response body: Array of objects, each describing one film. Note that absence
of values is represented as null value in json.

``` json
[
    { "id": 1, "title": "Pulp Fiction", "favorite": 1, "watchDate": "2023-03-11",
    "rating": null, },
...
]
```

* Error responses: `500 Internal Server Error` (generic error)
