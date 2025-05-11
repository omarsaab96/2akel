import React, { useState, useEffect } from 'react';
import { BookmarkPlus, BookmarkCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';
import { saveRestaurant, unsaveRestaurant, isRestaurantSaved } from '../../lib/api';
import Button from '../common/Button';

interface SaveButtonProps {
  restaurantId: string;
  onSaveChange?: (isSaved: boolean) => void;
}

const SaveButton: React.FC<SaveButtonProps> = ({ restaurantId, onSaveChange }) => {
  const { user } = useAuthStore();
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user?.role === 'customer') {
      checkIfSaved();
    }
  }, [user, restaurantId]);

  const checkIfSaved = async () => {
    try {
      const saved = await isRestaurantSaved(restaurantId);
      setIsSaved(saved);
      onSaveChange?.(saved);
    } catch (error) {
      console.error('Error checking saved status:', error);
    }
  };

  const handleToggleSave = async () => {
    if (!user) {
      toast.error('Please sign in to save restaurants');
      return;
    }

    if (user.role !== 'customer') {
      toast.error('Only customers can save restaurants');
      return;
    }

    setIsLoading(true);

    try {
      if (isSaved) {
        await unsaveRestaurant(restaurantId, user.id);
        toast.success('Unsaved');
      } else {
        await saveRestaurant(restaurantId, user.id);
        toast.success('Saved!');
      }

      setIsSaved(!isSaved);
      onSaveChange?.(!isSaved);
    } catch (error) {
      console.error('Error toggling save:', error);
      toast.error('Failed to update saved status');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant='outline'
      icon={isSaved ? BookmarkCheck : BookmarkPlus}
      onClick={handleToggleSave}
      isLoading={isLoading}
      className={`text-white !p-0 !border-0 !focus:ring-0 ${isSaved ? '' : ''}`}
    >
      {isSaved ? 'Saved' : 'Save'}
    </Button>
  );
};

export default SaveButton;