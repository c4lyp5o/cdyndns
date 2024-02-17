# 🌐 cdyndns

A service for managing dynamic DNS records.

## 📝 Description

This project is a Node.js application that uses Prisma for database operations. It provides functionality for managing dynamic DNS records.

## 🚀 Installation

First, clone the repository:

```bash
git clone https://github.com/c4lyp5o/cdyndns.git
```

Install the dependencies:

```bash
yarn
```

Create a `.env` file in the root of the project with the following content:

```env
DATABASE_URL="file:../database/dev.db"
```

Run the database migrations:

```bash
npx prisma migrate dev
```

Generate the Prisma client:

```bash
npx prisma generate
```

## Usage

To start the development server, run:

```bash
yarn dev
```

To run the server in production mode, run:

```bash
yarn start
```

## 📚 API

### GET /api/records

Returns a list of all records.

### POST /api/records

Creates a new record.

### PUT /api/records

Updates a record.

### DELETE /api/records/:serviceId/:domainId?

Deletes a record. If `domainId` is not provided, all records for the specified service will be deleted.

## 👥 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
