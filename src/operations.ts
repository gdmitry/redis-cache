import { RedisClientType } from 'redis';

export async function basicStringOperations(client: RedisClientType): Promise<void> {
  // Setting a value
  await client.set('key', 'value');

  // Retrieving a value
  const value: string | null = await client.get('key');
  console.log(value); // Output: value

  // Setting with expiration (10 seconds)
  await client.set('temporary_key', 'temporary_value', {
    EX: 10,
  });

  // Getting the value before expiration
  const temporaryValue: any = await client.get('temporary_key');
  console.log(temporaryValue); // Output: temporary_value

  // Waiting for the key to expire
  await new Promise((resolve) => setTimeout(resolve, 11000));

  // Getting the value after expiration
  const expiredValue: any = await client.get('temporary_key');
  console.log(expiredValue); // Output: null
}
