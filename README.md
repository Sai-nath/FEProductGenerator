# Insurance Screen Builder - Prisma Schema

This project contains the Prisma schema for an insurance screen builder application with three related PostgreSQL tables:
- LineOfBusiness
- ScreenConfiguration
- InsuranceProduct

## Setup Instructions

1. **Install dependencies**
   ```
   npm install
   ```

2. **Generate Prisma Client**
   ```
   npm run prisma:generate
   ```

3. **Create database migrations**
   ```
   npm run prisma:migrate
   ```

4. **Explore your database with Prisma Studio**
   ```
   npm run prisma:studio
   ```

## Database Schema

### LineOfBusiness
Represents different lines of insurance business (Health, Life, etc.)

### ScreenConfiguration
Holds screen layouts with accordions, sections, widgets, and tables that can be shared across products

### InsuranceProduct
Represents insurance products that belong to a line of business and use specific screen configurations

## Relations
- InsuranceProduct → ScreenConfiguration (many-to-one)
- InsuranceProduct → LineOfBusiness (many-to-one, optional)
