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
      .select('friend_ids')
      .eq('id', userId)
      .single()

    if (userError) {
      throw userError
    }

    const friendIds = user?.friend_ids
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

export async function addFriend(userId, newFriendId) {
  try {
    // Step 1: Get the current friend_ids
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('friend_ids')
      .eq('id', userId)
      .single()

    if (userError) throw userError

    let currentFriends = user?.friend_ids || []

    // Step 2: Avoid duplicates
    if (currentFriends.includes(newFriendId)) {
      console.log('Already friends.')
      return { success: false, message: 'Already friends.' }
    }

    // Step 3: Add new friend and update
    const updatedFriends = [...currentFriends, newFriendId]

    const { error: updateError } = await supabase
      .from('users')
      .update({ friend_ids: updatedFriends })
      .eq('id', userId)

    if (updateError) throw updateError

    return { success: true, message: 'Friend added successfully.' }
  } catch (err) {
    console.error('Error adding friend:', err.message)
    return { success: false, message: err.message }
  }
}