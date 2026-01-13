'use client';

import { useState } from 'react';
import { useAuthStore, useSocialStore } from '@/stores/authStore';

export const FriendsSection = () => {
  const { user } = useAuthStore();
  const { 
    friends, 
    friendRequests, 
    sendFriendRequest, 
    acceptFriendRequest, 
    rejectFriendRequest,
    removeFriend,
    getFriendProgress 
  } = useSocialStore();
  
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [friendEmail, setFriendEmail] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);

  const pendingRequests = friendRequests.filter(r => r.toUserId === user?.id && r.status === 'pending');

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendEmail.trim()) return;
    
    const success = await sendFriendRequest(friendEmail);
    if (success) {
      setMessage({ type: 'success', text: 'Friend request sent!' });
      setFriendEmail('');
      setShowAddFriend(false);
    } else {
      setMessage({ type: 'error', text: 'User not found or already added' });
    }
    
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const friendProgress = selectedFriend ? getFriendProgress(selectedFriend) : null;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with Add Friend Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
          <span>👥</span> Friends
        </h2>
        <button
          onClick={() => setShowAddFriend(true)}
          className="px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold text-sm hover:bg-blue-600 transition flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">Add Friend</span>
        </button>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`px-4 py-3 rounded-lg text-sm font-medium ${
          message.type === 'success' ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="bg-amber-50 rounded-lg border border-amber-200 p-3 sm:p-4">
          <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
            <span>📬</span> Friend Requests ({pendingRequests.length})
          </h3>
          <div className="space-y-2">
            {pendingRequests.map(request => (
              <div key={request.id} className="bg-white rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{request.fromUserAvatar || '👤'}</span>
                  <div>
                    <p className="font-semibold text-gray-800">{request.fromUserName}</p>
                    <p className="text-xs text-gray-500">Wants to be friends</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => acceptFriendRequest(request.id)}
                    className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => rejectFriendRequest(request.id)}
                    className="px-3 py-1.5 bg-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-300"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="font-bold text-gray-800">Your Friends ({friends.length})</h3>
        </div>
        
        {friends.length === 0 ? (
          <div className="p-8 text-center">
            <span className="text-5xl block mb-3">🤝</span>
            <p className="text-gray-500 mb-4">No friends yet. Add friends to see their progress!</p>
            <button
              onClick={() => setShowAddFriend(true)}
              className="text-blue-600 font-semibold hover:underline"
            >
              + Add your first friend
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {friends.map(friend => (
              <div
                key={friend.id}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition ${
                  selectedFriend === friend.id ? 'bg-blue-50' : ''
                }`}
                onClick={() => setSelectedFriend(selectedFriend === friend.id ? null : friend.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{friend.avatar || '👤'}</span>
                    <div>
                      <p className="font-semibold text-gray-800">{friend.name}</p>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          🔥 {friend.streak} day streak
                        </span>
                        <span className="flex items-center gap-1">
                          📊 {friend.todayProgress}% today
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFriend(friend.id); }}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                    title="Remove friend"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {/* Friend Progress Detail */}
                {selectedFriend === friend.id && friendProgress && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h4 className="font-semibold text-gray-700 mb-3">Today's Progress</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-blue-50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {friendProgress.completedHabits}/{friendProgress.totalHabits}
                        </p>
                        <p className="text-xs text-blue-700">Habits Done</p>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-orange-600">
                          {friendProgress.streak}
                        </p>
                        <p className="text-xs text-orange-700">Day Streak</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {Math.round((friendProgress.completedHabits / friendProgress.totalHabits) * 100)}%
                        </p>
                        <p className="text-xs text-green-700">Completion</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3 text-center">
                        <p className="text-3xl">{friendProgress.mood}</p>
                        <p className="text-xs text-purple-700">Mood</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Friend Modal */}
      {showAddFriend && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setShowAddFriend(false)}
        >
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>➕</span> Add Friend
            </h3>
            <form onSubmit={handleSendRequest}>
              <input
                type="email"
                value={friendEmail}
                onChange={(e) => setFriendEmail(e.target.value)}
                placeholder="Enter friend's email"
                className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 text-sm text-gray-800 placeholder:text-gray-400 bg-gray-50"
                autoFocus
              />
              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddFriend(false)}
                  className="flex-1 py-2.5 border-2 border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600"
                >
                  Send Request
                </button>
              </div>
            </form>
            <p className="mt-4 text-xs text-gray-400 text-center">
              Try: john@test.com or jane@test.com
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FriendsSection;
