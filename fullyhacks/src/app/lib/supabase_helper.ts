import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

// Define types for the data structure
interface User {
  friends: number[]; // Assuming `friends` is an array of user IDs
}

interface Friend {
  name: string;
}

export async function getFriendNames(userId: number): Promise<string[]> {
  // Fetch the user and their friends
  const { data: user, error: userError } = await supabase
    .from<User>('people')
    .select('friends')
    .eq('id', userId)
    .single();

  if (userError || !user) return [];

  const friendIds = user.friends;

  // Fetch the names of the friends
  const { data: friends, error: friendsError } = await supabase
    .from<Friend>('people')
    .select('name')
    .in('id', friendIds);

  if (friendsError || !friends) return [];

  return friends.map((f) => f.name);
}