import { auth } from '@clerk/nextjs/server';

export default async function getUserId() {
  const { sessionClaims } = await auth();

  // Type assertion to help TypeScript understand the structure
  const claims = sessionClaims as CustomJwtSessionClaims;

  // Access userId from the nested object
  const Id = claims?.userId?.userId as string;

  return Id;
}
