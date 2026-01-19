'use client';

import { useState } from 'react';
import { useAuthStore, useSocialStore } from '@/stores/authStore';

export const GroupsSection = () => {
  const { user } = useAuthStore();
  const { 
    groups, 
    groupInvites,
    createGroup,
    deleteGroup,
    inviteToGroup,
    acceptGroupInvite,
    rejectGroupInvite,
    leaveGroup,
    getGroupProgress
  } = useSocialStore();
  
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupForm, setGroupForm] = useState({ name: '', description: '', isPrivate: false });
  const [inviteEmail, setInviteEmail] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  const pendingInvites = groupInvites.filter(i => i.toUserId === user?.id && i.status === 'pending');
  const myGroups = groups.filter(g => g.members.some(m => m.userId === user?.id));

  const handleCreateGroup = (e) => {
    e.preventDefault();
    if (!groupForm.name.trim()) return;
    
    createGroup(groupForm.name, groupForm.description, groupForm.isPrivate);
    setGroupForm({ name: '', description: '', isPrivate: false });
    setShowCreateGroup(false);
    setMessage({ type: 'success', text: 'Group created successfully!' });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!showInviteModal || !inviteEmail.trim()) return;
    
    const success = await inviteToGroup(showInviteModal, inviteEmail);
    if (success) {
      setMessage({ type: 'success', text: 'Invitation sent!' });
      setInviteEmail('');
      setShowInviteModal(null);
    } else {
      setMessage({ type: 'error', text: 'User not found or already in group' });
    }
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const groupProgress = selectedGroup ? getGroupProgress(selectedGroup) : [];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
          <span>👨‍👩‍👧‍👦</span> Groups
        </h2>
        <button
          onClick={() => setShowCreateGroup(true)}
          className="px-3 sm:px-4 py-2 bg-purple-500 text-white rounded-lg font-semibold text-sm hover:bg-purple-600 transition flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">Create Group</span>
        </button>
      </div>

      {message.text && (
        <div className={`px-4 py-3 rounded-lg text-sm font-medium ${
          message.type === 'success' ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {pendingInvites.length > 0 && (
        <div className="bg-purple-50 rounded-lg border border-purple-200 p-3 sm:p-4">
          <h3 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
            <span>📨</span> Group Invitations ({pendingInvites.length})
          </h3>
          <div className="space-y-2">
            {pendingInvites.map(invite => (
              <div key={invite.id} className="bg-white rounded-lg p-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800">{invite.groupName}</p>
                  <p className="text-xs text-gray-500">Invited by {invite.fromUserName}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => acceptGroupInvite(invite.id)}
                    className="px-3 py-1.5 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600"
                  >
                    Join
                  </button>
                  <button
                    onClick={() => rejectGroupInvite(invite.id)}
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

      <div className="grid gap-4">
        {myGroups.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <span className="text-5xl block mb-3">👨‍👩‍👧‍👦</span>
            <p className="text-gray-500 mb-4">No groups yet. Create a group to track progress together!</p>
            <button
              onClick={() => setShowCreateGroup(true)}
              className="text-purple-600 font-semibold hover:underline"
            >
              + Create your first group
            </button>
          </div>
        ) : (
          myGroups.map(group => {
            const isAdmin = group.creatorId === user?.id;
            const isSelected = selectedGroup === group.id;
            
            return (
              <div
                key={group.id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden"
              >
                <div
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition ${isSelected ? 'bg-purple-50' : ''}`}
                  onClick={() => setSelectedGroup(isSelected ? null : group.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center text-2xl text-white">
                        {group.name[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-800">{group.name}</h3>
                          {group.isPrivate && (
                            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">Private</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{group.members.length} members</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isAdmin && (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); setShowInviteModal(group.id); }}
                            className="p-2 text-purple-500 hover:bg-purple-50 rounded-lg"
                            title="Invite member"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteGroup(group.id); }}
                            className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                            title="Delete group"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </>
                      )}
                      {!isAdmin && (
                        <button
                          onClick={(e) => { e.stopPropagation(); leaveGroup(group.id); }}
                          className="px-3 py-1.5 text-red-500 hover:bg-red-50 rounded-lg text-sm font-medium"
                        >
                          Leave
                        </button>
                      )}
                      <svg
                        className={`w-5 h-5 text-gray-400 transition-transform ${isSelected ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <div className="border-t border-gray-100 p-4">
                    {group.description && (
                      <p className="text-sm text-gray-600 mb-4">{group.description}</p>
                    )}
                    
                    <h4 className="font-bold text-gray-700 mb-3">Members Progress</h4>
                    <div className="space-y-3">
                      {groupProgress.map((member, idx) => (
                        <div key={idx} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{member.userAvatar || '👤'}</span>
                              <span className="font-medium text-gray-800">{member.odakName}</span>
                              {member.odak === user?.id && (
                                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">You</span>
                              )}
                            </div>
                            <span className="text-xl">{member.mood}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-gray-600">
                              <span className="font-semibold text-gray-800">{member.completedHabits}/{member.totalHabits}</span> habits
                            </span>
                            <span className="text-gray-600">
                              <span className="font-semibold text-orange-500">🔥 {member.streak}</span> streak
                            </span>
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                                style={{ width: `${(member.completedHabits / member.totalHabits) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {showCreateGroup && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setShowCreateGroup(false)}
        >
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>➕</span> Create Group
            </h3>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Group Name</label>
                <input
                  type="text"
                  value={groupForm.name}
                  onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                  placeholder="e.g., Morning Warriors"
                  className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-purple-500 text-sm text-gray-800 placeholder:text-gray-400 bg-gray-50"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Description (optional)</label>
                <textarea
                  value={groupForm.description}
                  onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
                  placeholder="What's this group about?"
                  className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-purple-500 text-sm text-gray-800 placeholder:text-gray-400 bg-gray-50 resize-none"
                  rows={2}
                />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={groupForm.isPrivate}
                  onChange={(e) => setGroupForm({ ...groupForm, isPrivate: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">Make this group private (invite only)</span>
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateGroup(false)}
                  className="flex-1 py-2.5 border-2 border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600"
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showInviteModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setShowInviteModal(null)}
        >
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>📨</span> Invite to Group
            </h3>
            <form onSubmit={handleInvite}>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Enter user's email"
                className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-purple-500 text-sm text-gray-800 placeholder:text-gray-400 bg-gray-50"
                autoFocus
              />
              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(null)}
                  className="flex-1 py-2.5 border-2 border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600"
                >
                  Send Invite
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

export default GroupsSection;
