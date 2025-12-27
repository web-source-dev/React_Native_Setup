/**
 * Room List Component
 * 
 * Optimized list component for selecting rooms
 * Uses FlatList for performance with large lists
 */

import React, { memo } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import type { Room } from '../../lib/database/repositories/scope';

interface RoomListProps {
  rooms: Room[];
  selectedRoom: Room | null;
  onSelectRoom: (room: Room) => void;
}

const RoomItem = memo(({ room, isSelected, onPress, theme }: {
  room: Room;
  isSelected: boolean;
  onPress: () => void;
  theme: any;
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.roomItem,
        { backgroundColor: theme.backgroundPrimary },
        isSelected && { backgroundColor: theme.primary + '20', borderColor: theme.primary },
      ]}
    >
      <Text style={[styles.roomName, { color: theme.textPrimary }, isSelected && { color: theme.primary, fontWeight: '600' }]}>
        {room.name}
      </Text>
      {isSelected && <Ionicons name="checkmark-circle" size={24} color={theme.primary} />}
    </Pressable>
  );
});

RoomItem.displayName = 'RoomItem';

export const RoomList = memo(({ rooms, selectedRoom, onSelectRoom }: RoomListProps) => {
  const { theme } = useTheme();

  const renderItem = ({ item }: { item: Room }) => (
    <RoomItem
      room={item}
      isSelected={selectedRoom?.id === item.id}
      onPress={() => onSelectRoom(item)}
      theme={theme}
    />
  );

  const keyExtractor = (item: Room) => `room-${item.id}`;

  if (rooms.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
          No rooms available
        </Text>
        <Text style={[styles.emptySubtext, { color: theme.textTertiary }]}>
          Catalog may still be loading...
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={rooms}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      style={styles.list}
      contentContainerStyle={styles.listContent}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      initialNumToRender={20}
      windowSize={10}
    />
  );
});

RoomList.displayName = 'RoomList';

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listContent: {
    padding: 8,
  },
  roomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  roomName: {
    fontSize: 16,
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 12,
    textAlign: 'center',
  },
});

