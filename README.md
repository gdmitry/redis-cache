Redis with Node Crash Course - Cache Data for Improved Performance

1. Basic operations - https://medium.com/@erickzanetti/redis-and-node-js-with-typescript-a-complete-guide-2bac6e300497

2. Check endpoint in console ```curl "http://localhost:3000/get?key=myKey"```

## Redis

1. Run redis container in console ```docker run -d --name my-redis -p 6379:6379 redis```


## Postgres

1. Run Postgres container in console ```docker run --name my-postgres -e POSTGRES_PASSWORD=mysecretpassword -p 5432:5432 -d postgres```


## Prisma

1. Initialize Prisma ORM ```pnpm dlx prisma```

2. Create your prisma schema ```pnpm dlx prisma init --datasource-provider postgresql --output ../generated/prisma```

3. Create and apply migration ```pnpm dlx prisma migrate dev --name init```

4. Generate the Prisma client ```pnpm dlx prisma generate```

## PG admin

1. ```docker run --name pgadmin-container -p 5050:80 -e PGADMIN_DEFAULT_EMAIL=admin@gmail.com -e PGADMIN_DEFAULT_PASSWORD=admin -d dpage/pgadmin4``


