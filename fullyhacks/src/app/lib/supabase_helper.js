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


  

  export async function addFriend(userId, friendId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('friends')
      .eq('id', userId)
      .single();
  
    if (error || !data) return false;
  
    const friendIds = Array.isArray(data.friends) ? data.friends : [];
  
    if (!friendIds.includes(friendId)) {
      friendIds.push(friendId);
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ friends: friendIds })
        .eq('id', userId);
      return !updateError;
    }
  
    return true; 
  }
  
  export async function removeFriend(userId, friendId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('friends')
      .eq('id', userId)
      .single();
  
    if (error || !data) return false;
  
    const friendIds = Array.isArray(data.friends) ? data.friends : [];
  
    if (friendIds.includes(friendId)) {
      const updatedFriends = friendIds.filter(id => id !== friendId);
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ friends: updatedFriends })
        .eq('id', userId);
      return !updateError;
    }
  
    return true; 
}

/**
 * Fetch new nodes from the database.
 * @returns {Promise<Array>} An array of new nodes.
 */
export async function fetchNewNodes() {
    try {
        // Fetch nodes from the "nodes" table
        const { data, error } = await supabase
          .from('profiles') // Replace 'nodes' with your actual table name
          .select('*');

        if (error) {
            console.error('Error fetching nodes:', error);
            return [];
        }

        // Return the fetched nodes
        return data || [];
    } catch (err) {
        console.error('Unexpected error fetching nodes:', err);
        return [];
    }
}