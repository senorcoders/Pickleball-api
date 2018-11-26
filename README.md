# pickle-ball-api

API for pickleball senorcoders app 

## Getting Started
API development with sails


### Common Endpoints

All the models in the api have the following endpoints for create, destroy, update, find all, find one, search, populate

```
GET ALL => GET				http://server_address/api/:model_name
CREATE  => POST 			http://server_address/api/:model_name
GET ONE => GET				http://server_address/api/:model_name/:id
UPDATE  => PUT				http://server_address/api/:model_name/:id
DELETE  => DELETE 		    http://server_address/api/:model_name/:id
```

#### Search
SEARCH 	=> GET				http://server_address/api/:model_name?where={"name":{"contains":"theodore"}}

the api allow the followin criterias
```
    '<' / 'lessThan'
    '<=' / 'lessThanOrEqual'
    '>' / 'greaterThan'
    '>=' / 'greaterThanOrEqual'
    '!' / 'not'
    'like'
    'contains'
    'startsWith'
    'endsWith'
```
#### Sort and Limit
In your GET petition you can ask the for sort and/or limit the results
```
GET ALL => GET				http://server_address/:model_name?createdAt DESC&limit=30
```

### Current Models

```
User
```

### Custom endpoints:

#### Login and Logout
```
PUT   /login
POST  /signup
PUT /login-facebook
```

#### Save y Get image of user
```
PATCH /image/user/:userId 

GET /images/:type/:nameFile/:id
```

#### For User
```
GET users/finds?search={"email":"example@pa.com","name": "example juares"}
``