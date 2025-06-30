import { useState, useCallback } from 'react';

interface ContactVisibilityState {
  visibleContacts: Set<string>;
  visibilityOrder: string[];
}

export const useContactVisibility = () => {
  const [state, setState] = useState<ContactVisibilityState>({
    visibleContacts: new Set(),
    visibilityOrder: [],
  });

  const toggleContactVisibility = useCallback((propertyId: string) => {
    setState(prevState => {
      const newVisibleContacts = new Set(prevState.visibleContacts);
      const newVisibilityOrder = [...prevState.visibilityOrder];

      if (newVisibleContacts.has(propertyId)) {
        // If already visible, hide it
        newVisibleContacts.delete(propertyId);
        const index = newVisibilityOrder.indexOf(propertyId);
        if (index > -1) {
          newVisibilityOrder.splice(index, 1);
        }
      } else {
        // If not visible, show it
        if (newVisibleContacts.size >= 10) {
          // Remove the oldest visible contact (first in order)
          const oldestContact = newVisibilityOrder.shift();
          if (oldestContact) {
            newVisibleContacts.delete(oldestContact);
          }
        }
        
        // Add the new contact
        newVisibleContacts.add(propertyId);
        newVisibilityOrder.push(propertyId);
      }

      return {
        visibleContacts: newVisibleContacts,
        visibilityOrder: newVisibilityOrder,
      };
    });
  }, []);

  const isContactVisible = useCallback((propertyId: string) => {
    return state.visibleContacts.has(propertyId);
  }, [state.visibleContacts]);

  const getVisibleContactsCount = useCallback(() => {
    return state.visibleContacts.size;
  }, [state.visibleContacts]);

  return {
    toggleContactVisibility,
    isContactVisible,
    getVisibleContactsCount,
  };
};
