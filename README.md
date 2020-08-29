## Cider
An experimental GraphQL project to easily manage a bill of material (BOM) of products.

**Project stack**

 - Nestjs
 - GraphQL
 - Mongoose
 - Mongodb

**Use case**

The project contains a multi-level bill of material of a bicycle. With the provided data, you can experiment with  complex graph traversal queries such as obtaining the ancestors / descendants of an item.

**Installation**

**Database**

 - Configure  mongodb locally and run the server. You can change the
   default database server URI and port in the app.module.ts file.
```
	MongooseModule.forRoot('mongodb://localhost:27017/cider', {
		useNewUrlParser:  true,
		useUnifiedTopology:  true,
	})
```
 - Import the sample data (db.json) provided to the mongodb items collection.


**NestJs**

```bash

$ npm install

```

**Running the server**

```bash

# development

$ npm run start

# watch mode

$ npm run start:dev

# production mode

$ npm run start:prod

```
**GraphQL playground** 
The gql playground already provided a documentation for the available queries, mutations and subscription.
You can go the local running application url and have fun.
```
http://localhost:3000/graphql

```
**Import the sample data to mongodb collection**
```
mongoimport --db cider --collection items --file "sample data\bicycleBOM.json"

```
