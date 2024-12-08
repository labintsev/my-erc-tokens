import {
  customers,
  invoices,
  question_choices,
  questions,
  revenue,
  shareholder_question_answers,
  shareholders,
  users,
} from "./placeholder-data";
import { db } from "@vercel/postgres";
import bcrypt from "bcrypt";

const client = await db.connect();

async function seedShareholders() {
  await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await client.sql`
    CREATE TABLE IF NOT EXISTS shareholders (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `;

  const insertedShareholders = await Promise.all(
    shareholders.map(async sholder => {
      const hashedPassword = await bcrypt.hash(sholder.password, 10);
      return client.sql`
        INSERT INTO shareholders (id, name, email, password)
        VALUES (${sholder.id}, ${sholder.name}, ${sholder.email}, ${hashedPassword})
        ON CONFLICT (id) DO NOTHING;
      `;
    }),
  );

  return insertedShareholders;
}

async function seedQuestions() {
  await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await client.sql`
    CREATE TABLE IF NOT EXISTS questions (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      question VARCHAR(255) NOT NULL,
      is_active INT NOT NULL
    );
  `;

  const insertedQuestions = await Promise.all(
    questions.map(
      question => client.sql`
        INSERT INTO questions (id, question, is_active)
        VALUES (${question.id}, ${question.question}, ${question.is_active} )
        ON CONFLICT (id) DO NOTHING;
      `,
    ),
  );

  return insertedQuestions;
}

async function seedChoices() {
  await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await client.sql`
    CREATE TABLE IF NOT EXISTS choices (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      question_id UUID NOT NULL,
      choice VARCHAR(255) NOT NULL,
    );
  `;

  const insertedChoices = await Promise.all(
    question_choices.map(
      choice => client.sql`
        INSERT INTO choices (id, question_id, choice)
        VALUES (${choice.id}, ${choice.question_id}, ${choice.choice} )
        ON CONFLICT (id) DO NOTHING;
      `,
    ),
  );

  return insertedChoices;
}

async function seedShareholderAnswers() {
  await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await client.sql`
    CREATE TABLE IF NOT EXISTS answers (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      sh_id UUID NOT NULL,
      question_id UUID NOT NULL,
      choice_id VARCHAR(255) NOT NULL,
      answer_time TIMESTAMP NOT NULL
    );
  `;

  const insertedAnswers = await Promise.all(
    shareholder_question_answers.map(
      answer => client.sql`
        INSERT INTO answers (id, sh_id, question_id, choice_id, answer_time)
        VALUES (${answer.id}, ${answer.q_id}, ${answer.choice_id}, to_timestamp(${Date.now()} / 1000.0) )
        ON CONFLICT (id) DO NOTHING;
      `,
    ),
  );

  return insertedAnswers;
}

async function seedUsers() {
  await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await client.sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `;

  const insertedUsers = await Promise.all(
    users.map(async user => {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      return client.sql`
        INSERT INTO users (id, name, email, password)
        VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword})
        ON CONFLICT (id) DO NOTHING;
      `;
    }),
  );

  return insertedUsers;
}

async function seedInvoices() {
  await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await client.sql`
    CREATE TABLE IF NOT EXISTS invoices (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      customer_id UUID NOT NULL,
      amount INT NOT NULL,
      status VARCHAR(255) NOT NULL,
      date DATE NOT NULL
    );
  `;

  const insertedInvoices = await Promise.all(
    invoices.map(
      invoice => client.sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${invoice.customer_id}, ${invoice.amount}, ${invoice.status}, ${invoice.date})
        ON CONFLICT (id) DO NOTHING;
      `,
    ),
  );

  return insertedInvoices;
}

async function seedCustomers() {
  await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await client.sql`
    CREATE TABLE IF NOT EXISTS customers (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      image_url VARCHAR(255) NOT NULL
    );
  `;

  const insertedCustomers = await Promise.all(
    customers.map(
      customer => client.sql`
        INSERT INTO customers (id, name, email, image_url)
        VALUES (${customer.id}, ${customer.name}, ${customer.email}, ${customer.image_url})
        ON CONFLICT (id) DO NOTHING;
      `,
    ),
  );

  return insertedCustomers;
}

async function seedRevenue() {
  await client.sql`
    CREATE TABLE IF NOT EXISTS revenue (
      month VARCHAR(4) NOT NULL UNIQUE,
      revenue INT NOT NULL
    );
  `;

  const insertedRevenue = await Promise.all(
    revenue.map(
      rev => client.sql`
        INSERT INTO revenue (month, revenue)
        VALUES (${rev.month}, ${rev.revenue})
        ON CONFLICT (month) DO NOTHING;
      `,
    ),
  );

  return insertedRevenue;
}

export async function GET() {
  // return Response.json({
  //   message:
  //     'Uncomment this file and remove this line. You can delete this file when you are finished.',
  // });
  try {
    await client.sql`BEGIN`;
    await seedShareholders();
    await seedQuestions();
    await seedChoices();
    await seedShareholderAnswers();
    await seedUsers();
    await seedCustomers();
    await seedInvoices();
    await seedRevenue();
    await client.sql`COMMIT`;

    return Response.json({ message: "Database seeded successfully" });
  } catch (error) {
    await client.sql`ROLLBACK`;
    return Response.json({ error }, { status: 500 });
  }
}
