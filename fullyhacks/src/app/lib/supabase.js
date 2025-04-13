import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function getFriendNamesById(userId) {
  try {
    // Step 1: Get the user's friend_ids
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('friends')
      .eq('id', userId)
      .single()

    if (userError) {
      throw userError
    }

    const friendIds = user?.friends
    if (!friendIds || friendIds.length === 0) {
      return [] // No friends
    }

    // Step 2: Get the names of those friends
    const { data: friends, error: friendsError } = await supabase
      .from('profiles')
      .select('id, name')
      .in('id', friendIds)

    if (friendsError) {
      throw friendsError
    }

    // Step 3: Return just the names
    return console.log(friends.map(friend => friend.name))
  } catch (err) {
    console.error('Error fetching friend names:', err.message)
    return null
  }
}
