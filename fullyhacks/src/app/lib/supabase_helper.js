async function getFriendNames(userId) {
    const { data: user, error: userError } = await supabase
      .from('people')
      .select('friends')
      .eq('id', userId)
      .single();
  
    if (userError || !user) return [];
  
    const friendIds = user.friends;
  
    const { data: friends, error: friendsError } = await supabase
      .from('people')
      .select('name')
      .in('id', friendIds);
  
    if (friendsError) return [];
  
    return friends.map(f => f.name);
  }
  