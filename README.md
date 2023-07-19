# Optimart
Welcome to Optimart, the XRPL NFT Marketplace!


## Getting Started
### Prerequisites

- Node.js
- PostgreSQL
- Package manager(Npm, Yarn, Pnpm, etc.)

### Installation

1. Clone the repository.
```sh
git clone https://github.com/Jaybee020/Optimart.git
```

2. Navigate to the directory and install the dependencies.
```sh
cd Optimart
```

3. Populate the required environment variables using `.env.example` as a template.
```sh
cp .env.example .env.dev
```

4. Run database migration.
```sh
npm run db:migrate:dev
```

5. Seed your database using the steps provided in this [guide](https://gist.github.com/prettyirrelevant/de01f52ce066de9e6fb3575513370964)

### Usage

To run the Optimart API server, execute the following command
```sh
npm run dev
```

### Testing

To run the test suite, execute the following command
```sh
npm test
```
