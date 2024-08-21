import { doc, getDoc } from 'firebase/firestore';
import { create } from 'zustand';
import { db } from './firebase';
import { useUserStore } from './userStore';

export const useChatStore = create((set) => ({
  chatId: null,
  user: null, // Set to null initially to avoid confusion
  isCurrentUserBlocked: false,
  isReciverBlocked: false,

  changeChat: async (chatId, userId) => {
      
    const currentUser = useUserStore.getState().currentUser;
    if (!currentUser) {
        console.error('Current user is not available');
        return;
      }

      try {
        // Assuming you're fetching the `user` document based on `userId`
        const userDoc = await getDoc(doc(db, 'users', userId));
        const user = userDoc.exists() ? userDoc.data() : null;

        if (!user) {
          console.error('User not found');
          return;
        }

        if (user.blocked.includes(currentUser.id)) {
          return set({
            chatId,
            user: null,
            isCurrentUserBlocked: true,
            isReciverBlocked: false,
          });
        } else if (currentUser.blocked.includes(user.id)) {
          return set({
            chatId,
            user:user,
            isCurrentUserBlocked: false,
            isReciverBlocked: true,
          });
        } else {
          return set({
            chatId,
            user,
            isCurrentUserBlocked: false,
            isReciverBlocked: false,
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    },

  changeBlock: () => {
    set((state) => ({
      ...state,
      isReciverBlocked: !state.isReciverBlocked,
    }));
  },
}));
