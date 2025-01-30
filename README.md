# Website Profile Desa Karangbendo with CMS

## Setup Environment Variables
Create a .env file in the root of the project and add the following environment variables:

```bash
DATABASE_URL="postgres://postgres:postgres@localhost:5432/pd-karangbendo"
NEXT_PUBLIC_API_BASE_URL="http://localhost:3000/api"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET=supersecretvalue123!
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="drqyqumln"
CLOUDINARY_API_SECRET="Ahnp7J3wghRldRdGNFXKpAlMteU"
NEXT_PUBLIC_CLOUDINARY_API_KEY="235533316717314"
CLOUDINARY_URL="cloudinary://235533316717314:Ahnp7J3wghRldRdGNFXKpAlMteU@drqyqumln"
```

## Run the Setup Commands
1.  Install Dependencies
```bash
npm install
```
2. Seed the database
```bash
npx prisma db seed
```

## Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Login User
Role User Admin
- email: admin@gmail.com
- password: admin1234

Role User UMKM
- email: umkm@gmail.com
- password: umkm1234