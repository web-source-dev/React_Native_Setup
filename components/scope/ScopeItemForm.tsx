/**
 * Scope Item Form Component
 * 
 * Modal form for creating/editing scope items
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Modal,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { useTheme } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../ui';
import type { ScopeItem, RenovationOption } from '../../lib/database/repositories/scope';

interface ScopeItemFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    roomName: string;
    componentArea: string;
    optionName: string;
    quantity?: number;
    unit?: string;
    notes?: string;
    complexity: string;
    permitLikely: string;
    primaryTrades?: string;
  }) => Promise<void>;
  initialData?: {
    roomName: string;
    componentArea: string;
    optionName: string;
    quantity?: number;
    unit?: string;
    notes?: string;
    complexity: string;
    permitLikely: string;
    primaryTrades?: string;
  };
  renovationOption?: RenovationOption;
  currentRoom?: { name: string } | null;
  currentComponent?: { area: string } | null;
}

const COMPLEXITY_OPTIONS = ['Low', 'Medium', 'High'];
const PERMIT_OPTIONS = ['Yes', 'No', 'Maybe'];
const UNIT_OPTIONS = ['sq ft', 'linear ft', 'each', 'sq yd', 'cu ft', 'other'];

export const ScopeItemForm = ({
  visible,
  onClose,
  onSubmit,
  initialData,
  renovationOption,
  currentRoom,
  currentComponent,
}: ScopeItemFormProps) => {
  const { theme } = useTheme();
  // Initialize from initialData if editing, otherwise use currentRoom/currentComponent
  const [roomName, setRoomName] = useState(
    initialData?.roomName || currentRoom?.name || ''
  );
  const [componentArea, setComponentArea] = useState(
    initialData?.componentArea || currentComponent?.area || ''
  );
  const [optionName, setOptionName] = useState(initialData?.optionName || '');
  const [quantity, setQuantity] = useState(initialData?.quantity?.toString() || '');
  const [unit, setUnit] = useState(initialData?.unit || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [complexity, setComplexity] = useState(initialData?.complexity || 'Medium');
  const [permitLikely, setPermitLikely] = useState(initialData?.permitLikely || 'Maybe');
  const [primaryTrades, setPrimaryTrades] = useState(initialData?.primaryTrades || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update when modal opens with new data
  useEffect(() => {
    if (visible) {
      if (initialData) {
        // Editing existing item
        setRoomName(initialData.roomName);
        setComponentArea(initialData.componentArea);
        setOptionName(initialData.optionName);
        setQuantity(initialData.quantity?.toString() || '');
        setUnit(initialData.unit || '');
        setNotes(initialData.notes || '');
        setComplexity(initialData.complexity);
        setPermitLikely(initialData.permitLikely);
        setPrimaryTrades(initialData.primaryTrades || '');
      } else {
        // Creating new item - use current room and component
        const room = currentRoom?.name || '';
        const component = currentComponent?.area || '';
        const option = renovationOption?.optionName || '';
        
        setRoomName(room);
        setComponentArea(component);
        setOptionName(option);
        setQuantity('');
        setUnit('');
        setNotes('');
        
        // Set defaults from renovationOption if available
        if (renovationOption) {
          setComplexity(renovationOption.defaultComplexity || 'Medium');
          setPermitLikely(renovationOption.defaultPermitLikely || 'Maybe');
          setPrimaryTrades(renovationOption.primaryTrades || '');
        } else {
          setComplexity('Medium');
          setPermitLikely('Maybe');
          setPrimaryTrades('');
        }
      }
    }
  }, [visible, initialData, currentRoom, currentComponent, renovationOption]);

  const handleSubmit = async () => {
    if (!roomName || !componentArea || !optionName) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        roomName,
        componentArea,
        optionName,
        quantity: quantity ? parseFloat(quantity) : undefined,
        unit: unit || undefined,
        notes: notes || undefined,
        complexity,
        permitLikely,
        primaryTrades: primaryTrades || undefined,
      });
      onClose();
      // Reset form
      setQuantity('');
      setUnit('');
      setNotes('');
      setPrimaryTrades('');
    } catch (error) {
      Alert.alert('Error', 'Failed to save scope item');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: theme.backgroundPrimary }]}>
        <View style={[styles.header, { borderBottomColor: theme.borderPrimary }]}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            {initialData ? 'Edit Scope Item' : 'Add Scope Item'}
          </Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={theme.textPrimary} />
          </Pressable>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Room and Component (read-only) */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Room</Text>
            <Text style={[styles.value, { color: theme.textPrimary }]}>
              {roomName || 'Not selected'}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Component</Text>
            <Text style={[styles.value, { color: theme.textPrimary }]}>
              {componentArea || 'Not selected'}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Option</Text>
            <Text style={[styles.value, { color: theme.textPrimary }]}>
              {optionName || 'Not selected'}
            </Text>
          </View>

          {/* Quantity and Unit */}
          <View style={styles.row}>
            <View style={[styles.section, styles.flex1]}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Quantity</Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.backgroundSecondary, color: theme.textPrimary, borderColor: theme.borderPrimary },
                ]}
                value={quantity}
                onChangeText={setQuantity}
                placeholder="0"
                keyboardType="numeric"
                placeholderTextColor={theme.textTertiary}
              />
            </View>

            <View style={[styles.section, styles.flex1, styles.marginLeft]}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Unit</Text>
              <View style={styles.unitContainer}>
                {UNIT_OPTIONS.map((u) => (
                  <Pressable
                    key={u}
                    onPress={() => setUnit(u)}
                    style={[
                      styles.unitChip,
                      {
                        backgroundColor: unit === u ? theme.primary : theme.backgroundSecondary,
                        borderColor: theme.borderPrimary,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.unitChipText,
                        { color: unit === u ? '#fff' : theme.textPrimary },
                      ]}
                    >
                      {u}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          {/* Complexity */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Complexity</Text>
            <View style={styles.optionsRow}>
              {COMPLEXITY_OPTIONS.map((opt) => (
                <Pressable
                  key={opt}
                  onPress={() => setComplexity(opt)}
                  style={[
                    styles.optionChip,
                    {
                      backgroundColor: complexity === opt ? theme.primary : theme.backgroundSecondary,
                      borderColor: theme.borderPrimary,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.optionChipText,
                      { color: complexity === opt ? '#fff' : theme.textPrimary },
                    ]}
                  >
                    {opt}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Permit Likely */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Permit Likely</Text>
            <View style={styles.optionsRow}>
              {PERMIT_OPTIONS.map((opt) => (
                <Pressable
                  key={opt}
                  onPress={() => setPermitLikely(opt)}
                  style={[
                    styles.optionChip,
                    {
                      backgroundColor: permitLikely === opt ? theme.primary : theme.backgroundSecondary,
                      borderColor: theme.borderPrimary,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.optionChipText,
                      { color: permitLikely === opt ? '#fff' : theme.textPrimary },
                    ]}
                  >
                    {opt}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Primary Trades */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Primary Trades</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: theme.backgroundSecondary, color: theme.textPrimary, borderColor: theme.borderPrimary },
              ]}
              value={primaryTrades}
              onChangeText={setPrimaryTrades}
              placeholder="e.g., Electrician, Plumber"
              placeholderTextColor={theme.textTertiary}
            />
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Notes</Text>
            <TextInput
              style={[
                styles.textArea,
                { backgroundColor: theme.backgroundSecondary, color: theme.textPrimary, borderColor: theme.borderPrimary },
              ]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Additional notes..."
              multiline
              numberOfLines={4}
              placeholderTextColor={theme.textTertiary}
            />
          </View>
        </ScrollView>

        <View style={[styles.footer, { borderTopColor: theme.borderPrimary }]}>
          <Button
            title="Cancel"
            onPress={onClose}
            variant="outline"
            style={styles.footerButton}
          />
          <Button
            title={initialData ? 'Update' : 'Add'}
            onPress={handleSubmit}
            loading={isSubmitting}
            style={styles.footerButton}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  flex1: {
    flex: 1,
  },
  marginLeft: {
    marginLeft: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  optionChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  optionChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  unitContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  unitChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 4,
  },
  unitChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  footerButton: {
    flex: 1,
  },
});

