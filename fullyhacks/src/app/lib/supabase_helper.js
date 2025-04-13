import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)


export async function getFriendNames(userId) {
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('friends')
      .eq('id', userId)
      .single();
  
    if (userError || !user) return [];
  
    const friendIds = user.friends;
  
    const { data: friends, error: friendsError } = await supabase
      .from('profiles')
      .select('name')
      .in('id', friendIds);
  
    if (friendsError) return [];
  
    return friends.map(f => f.name);
      
  }

  export async function getAllPeople() {
    const { data: people, error: peopleError } = await supabase
      .from('profiles')
      .select('*');

    if (peopleError) return [];

    return people;
  }


  