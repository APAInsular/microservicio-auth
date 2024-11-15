// types.ts
export interface DbConfig {
    host: string;
    user: string;
    password: string;
    database: string;
}

export interface LoginRequest {
    email: string;
    password: string;
    dbConfig: DbConfig;
}

export interface JwtPayload {
    email: string;
    role: string;
}


/*
{
  "email": "user@example.com",
  "password": "password123",
  "dbConfig": {
    "host": "localhost",
    "user": "root",
    "password": "example_password",
    "database": "db_project1"
  }
}
*/