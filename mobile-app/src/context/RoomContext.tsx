import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api/client';
import { Room, RoomMode, MemberRole } from '../types';
import { useAuth } from './AuthContext';

interface RoomContextType {
  activeRoom: Room | null;
  activeMonth: string; // YYYY-MM
  loading: boolean;
  userRole: MemberRole | null;
  isManager: boolean;
  canEdit: boolean;
  setActiveMonth: (month: string) => void;
  createRoom: (name: string, mode: RoomMode) => Promise<{ success: boolean; message?: string; room?: Room }>;
  joinRoom: (roomCode: string) => Promise<{ success: boolean; message?: string; room?: Room }>;
  leaveRoom: () => Promise<{ success: boolean; message?: string }>;
  switchRoom: (roomId: string) => Promise<void>;
  updateMemberRole: (targetUserId: string, newRole: MemberRole) => Promise<{ success: boolean; message?: string }>;
  fetchRoomDetails: (roomId?: string) => Promise<void>;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export const RoomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  
  // Format current YYYY-MM
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [activeMonth, setActiveMonthState] = useState<string>(defaultMonth);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchRoomDetails = useCallback(async (roomIdToFetch?: string) => {
    const id = roomIdToFetch || activeRoom?._id || user?.activeRoomId;
    if (!id) return;
    try {
      setLoading(true);
      const res = await apiClient.get(`/rooms/${id}`);
      const roomObj = res.data?.data || res.data?.room;
      if (res.data?.success && roomObj) {
        setActiveRoom(roomObj);
        await AsyncStorage.setItem('active_room_id', roomObj._id);
      }
    } catch (err) {
      console.log('Error fetching room details:', err);
    } finally {
      setLoading(false);
    }
  }, [activeRoom?._id, user?.activeRoomId]);

  // Load saved active room on login / app start
  useEffect(() => {
    if (!token || !user) {
      setActiveRoom(null);
      return;
    }

    if (user.activeRoomId) {
      fetchRoomDetails(user.activeRoomId);
    } else {
      AsyncStorage.getItem('active_room_id').then((savedId) => {
        if (savedId) {
          fetchRoomDetails(savedId);
        }
      });
    }
  }, [token, user, fetchRoomDetails]);

  const setActiveMonth = (month: string) => {
    setActiveMonthState(month);
  };

  const createRoom = async (name: string, mode: RoomMode) => {
    try {
      setLoading(true);
      const res = await apiClient.post('/rooms', { name, mode });
      const roomObj = res.data?.data || res.data?.room;
      if (res.data?.success && roomObj) {
        setActiveRoom(roomObj);
        await AsyncStorage.setItem('active_room_id', roomObj._id);
        return { success: true, room: roomObj };
      }
      return { success: false, message: res.data?.message || 'Failed to create room' };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || 'Failed to create room' };
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async (roomCode: string) => {
    try {
      setLoading(true);
      const res = await apiClient.post('/rooms/join', { inviteCode: roomCode, roomCode });
      const roomObj = res.data?.data || res.data?.room;
      if (res.data?.success && roomObj) {
        setActiveRoom(roomObj);
        await AsyncStorage.setItem('active_room_id', roomObj._id);
        return { success: true, room: roomObj };
      }
      return { success: false, message: res.data?.message || 'Failed to join room' };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || 'Failed to join room' };
    } finally {
      setLoading(false);
    }
  };

  const leaveRoom = async () => {
    if (!activeRoom) return { success: false, message: 'No active room' };
    try {
      setLoading(true);
      const res = await apiClient.post('/rooms/leave', { roomId: activeRoom._id });
      if (res.data?.success) {
        setActiveRoom(null);
        await AsyncStorage.removeItem('active_room_id');
        return { success: true };
      }
      return { success: false, message: res.data?.message || 'Failed to leave room' };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || 'Failed to leave room' };
    } finally {
      setLoading(false);
    }
  };

  const switchRoom = async (roomId: string) => {
    await fetchRoomDetails(roomId);
  };

  const updateMemberRole = async (targetUserId: string, newRole: MemberRole) => {
    if (!activeRoom) return { success: false, message: 'No active room' };
    try {
      const res = await apiClient.patch('/rooms/members/role', {
        roomId: activeRoom._id,
        targetUserId,
        newRole
      });
      if (res.data?.success) {
        await fetchRoomDetails();
        return { success: true };
      }
      return { success: false, message: res.data?.message };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || 'Failed to update role' };
    }
  };

  // Determine current user role & edit permissions
  const currentUserMember = activeRoom?.members?.find((m) => {
    const uId = typeof m.userId === 'object' ? m.userId._id : m.userId;
    return uId === user?._id;
  });

  const userRole: MemberRole | null = currentUserMember?.role || (activeRoom?.managerId === user?._id ? MemberRole.MANAGER : null);
  const isManager = userRole === MemberRole.MANAGER || activeRoom?.managerId === user?._id;
  
  // In Collaborative mode, ALL members can edit. In Single Manager mode, Manager & Delegated Editor can edit.
  const canEdit = activeRoom?.mode === RoomMode.COLLABORATIVE ? true : (isManager || userRole === MemberRole.DELEGATED_EDITOR);

  return (
    <RoomContext.Provider
      value={{
        activeRoom,
        activeMonth,
        loading,
        userRole,
        isManager,
        canEdit,
        setActiveMonth,
        createRoom,
        joinRoom,
        leaveRoom,
        switchRoom,
        updateMemberRole,
        fetchRoomDetails
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};

export const useRoom = () => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoom must be used within RoomProvider');
  }
  return context;
};
