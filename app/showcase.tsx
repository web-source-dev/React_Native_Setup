import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../theme';
import {
  Button,
  Input,
  Card,
  Modal,
  Drawer,
  Select,
  MultiSelect,
  DatePicker,
  TimePicker,
  DateTimePicker,
  ListItem,
  Avatar,
  Badge,
  Switch,
  Loading,
  Alert as AlertComponent,
} from '../components';

export default function Showcase() {
  const { theme, mode, toggleTheme } = useTheme();
  const [inputValue, setInputValue] = useState('');
  const [switchValue, setSwitchValue] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectValue, setSelectValue] = useState('');
  const [multiSelectValue, setMultiSelectValue] = useState<string[]>([]);
  const [dateValue, setDateValue] = useState<Date>();
  const [timeValue, setTimeValue] = useState<Date>();
  const [dateTimeValue, setDateTimeValue] = useState<Date>();
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const showAlert = (message: string) => {
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const selectOptions = [
    { label: 'Option 1', value: 'option1' },
    { label: 'Option 2', value: 'option2' },
    { label: 'Option 3', value: 'option3' },
    { label: 'Option 4', value: 'option4' },
    { label: 'Option 5', value: 'option5' },
  ];

  const multiSelectOptions = [
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' },
    { label: 'Orange', value: 'orange' },
    { label: 'Grape', value: 'grape' },
    { label: 'Pineapple', value: 'pineapple' },
    { label: 'Mango', value: 'mango' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundPrimary }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            UI Components Showcase
          </Text>
          <Button
            title={`Switch to ${mode === 'light' ? 'Dark' : 'Light'} Mode`}
            variant="outline"
            onPress={toggleTheme}
            size="sm"
          />
        </View>

        {/* Buttons Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Buttons
          </Text>
          <View style={styles.buttonGrid}>
            <Button
              title="Primary"
              variant="primary"
              onPress={() => showAlert('Primary button pressed!')}
            />
            <Button
              title="Secondary"
              variant="secondary"
              onPress={() => showAlert('Secondary button pressed!')}
            />
            <Button
              title="Outline"
              variant="outline"
              onPress={() => showAlert('Outline button pressed!')}
            />
            <Button
              title="Ghost"
              variant="ghost"
              onPress={() => showAlert('Ghost button pressed!')}
            />
            <Button
              title="Danger"
              variant="danger"
              onPress={() => showAlert('Danger button pressed!')}
            />
            <Button
              title="Loading"
              variant="primary"
              loading
              onPress={() => {}}
            />
          </View>

          <View style={styles.buttonSizes}>
            <Button
              title="Small"
              size="sm"
              onPress={() => showAlert('Small button pressed!')}
            />
            <Button
              title="Medium"
              size="md"
              onPress={() => showAlert('Medium button pressed!')}
            />
            <Button
              title="Large"
              size="lg"
              onPress={() => showAlert('Large button pressed!')}
            />
          </View>
        </View>

        {/* Inputs Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Inputs
          </Text>
          <Input
            label="Default Input"
            placeholder="Enter some text..."
            value={inputValue}
            onChangeText={setInputValue}
          />
          <Input
            label="Email Input"
            placeholder="Enter your email..."
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input
            label="Password Input"
            placeholder="Enter your password..."
            secureTextEntry
          />
          <Input
            label="Input with Error"
            placeholder="This field has an error..."
            error="This field is required"
          />
        </View>

        {/* Cards Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Cards
          </Text>

          {/* Card with Title and Underline */}
          <Card
            title="Card with Title"
            showTitleUnderline
            variant="default"
            onPress={() => showAlert('Card with title pressed!')}
          >
            <Text style={[styles.cardText, { color: theme.textPrimary }]}>
              This card has a title with an underline accent. The design is more polished with improved shadows and spacing.
            </Text>
          </Card>

          {/* Card with Title and Footer */}
          <Card
            title="Settings Card"
            variant="elevated"
            footer={
              <View style={styles.cardFooter}>
                <Button
                  title="Save Changes"
                  size="sm"
                  onPress={() => showAlert('Save pressed!')}
                />
              </View>
            }
          >
            <Text style={[styles.cardText, { color: theme.textPrimary }]}>
              This elevated card has both a title and a footer with action buttons. Perfect for settings or form cards.
            </Text>
          </Card>

          {/* Simple Card */}
          <Card variant="outlined">
            <Text style={[styles.cardText, { color: theme.textPrimary }]}>
              This is a simple outlined card without title or footer. Clean and minimal design.
            </Text>
          </Card>

          {/* Card Sizes */}
          <View style={styles.cardSizes}>
            <Card size="sm">
              <Text style={[styles.cardText, { color: theme.textPrimary, fontSize: 14 }]}>
                Small Card
              </Text>
            </Card>
            <Card size="md">
              <Text style={[styles.cardText, { color: theme.textPrimary }]}>
                Medium Card
              </Text>
            </Card>
            <Card size="lg">
              <Text style={[styles.cardText, { color: theme.textPrimary }]}>
                Large Card
              </Text>
            </Card>
          </View>
        </View>

        {/* List Items Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            List Items
          </Text>
          <Card variant="outlined" style={{ padding: 0 }}>
            <ListItem
              title="Profile Settings"
              subtitle="Manage your account"
              variant="chevron"
              onPress={() => showAlert('Profile settings pressed!')}
            />
            <ListItem
              title="Notifications"
              subtitle="Push notification preferences"
              variant="chevron"
              onPress={() => showAlert('Notifications pressed!')}
            />
            <ListItem
              title="Dark Mode"
              subtitle="Toggle between light and dark themes"
              rightIcon={<Switch value={switchValue} onValueChange={setSwitchValue} />}
              onPress={() => setSwitchValue(!switchValue)}
            />
          </Card>
        </View>

        {/* Avatars and Badges Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Avatars & Badges
          </Text>
          <View style={styles.avatarRow}>
            <Avatar name="John Doe" size="sm" />
            <Avatar name="Jane Smith" size="md" />
            <Avatar name="Bob Johnson" size="lg" />
            <Avatar name="Alice Wilson" size="xl" />
          </View>

          <View style={styles.badgeRow}>
            <Badge title="Default" />
            <Badge title="Primary" variant="primary" />
            <Badge title="Success" variant="success" />
            <Badge title="Warning" variant="warning" />
            <Badge title="Danger" variant="danger" />
          </View>
        </View>

        {/* Switches Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Switches
          </Text>
          <View style={styles.switchRow}>
            <View style={styles.switchItem}>
              <Text style={[styles.switchLabel, { color: theme.textPrimary }]}>
                Small Switch
              </Text>
              <Switch
                value={switchValue}
                onValueChange={setSwitchValue}
                size="sm"
              />
            </View>
            <View style={styles.switchItem}>
              <Text style={[styles.switchLabel, { color: theme.textPrimary }]}>
                Medium Switch
              </Text>
              <Switch
                value={!switchValue}
                onValueChange={(value) => setSwitchValue(!value)}
                size="md"
              />
            </View>
            <View style={styles.switchItem}>
              <Text style={[styles.switchLabel, { color: theme.textPrimary }]}>
                Large Switch
              </Text>
              <Switch
                value={switchValue}
                onValueChange={setSwitchValue}
                size="lg"
              />
            </View>
          </View>
        </View>

        {/* Select Components */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Select Components
          </Text>
          <Select
            label="Single Select"
            placeholder="Choose an option..."
            options={selectOptions}
            value={selectValue}
            onValueChange={(value) => {
              setSelectValue(value.toString());
              showAlert(`Selected: ${value}`);
            }}
          />

          <MultiSelect
            label="Multi Select"
            placeholder="Choose multiple options..."
            options={multiSelectOptions}
            value={multiSelectValue}
            onValueChange={(value) => {
              setMultiSelectValue(value as string[]);
              showAlert(`Selected: ${value.join(', ')}`);
            }}
            style={{ marginTop: 16 }}
          />
        </View>

        {/* Picker Components */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Picker Components
          </Text>
          <DatePicker
            label="Date Picker"
            placeholder="Select a date..."
            value={dateValue}
            onDateChange={(date) => {
              setDateValue(date);
              showAlert(`Selected date: ${date.toDateString()}`);
            }}
          />

          <TimePicker
            label="Time Picker"
            placeholder="Select a time..."
            value={timeValue}
            onTimeChange={(time) => {
              setTimeValue(time);
              showAlert(`Selected time: ${time.toTimeString()}`);
            }}
            style={{ marginTop: 16 }}
          />

          <DateTimePicker
            label="Date & Time Picker"
            placeholder="Select date and time..."
            value={dateTimeValue}
            onDateTimeChange={(dateTime) => {
              setDateTimeValue(dateTime);
              showAlert(`Selected: ${dateTime.toLocaleString()}`);
            }}
            style={{ marginTop: 16 }}
          />
        </View>

        {/* Drawer Button */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Drawer
          </Text>
          <View style={styles.drawerButtons}>
            <Button
              title="Open Left Drawer"
              onPress={() => setDrawerVisible(true)}
              style={{ flex: 1, marginRight: 8 }}
            />
            <Button
              title="Open Right Drawer"
              variant="outline"
              onPress={() => setDrawerVisible(true)}
              style={{ flex: 1, marginLeft: 8 }}
            />
          </View>
        </View>

        {/* Modal Button */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Modal
          </Text>
          <Button
            title="Open Modal"
            onPress={() => setModalVisible(true)}
          />
        </View>

        {/* Loading Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Loading States
          </Text>
          <View style={styles.loadingRow}>
            <Loading size="sm" />
            <Loading size="md" />
            <Loading size="lg" />
          </View>
          <Loading text="Loading with text..." />
        </View>
      </ScrollView>

      {/* Modal */}
      <Modal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        size="md"
      >
        <View style={styles.modalContent}>
          <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
            Modal Title
          </Text>
          <Text style={[styles.modalText, { color: theme.textSecondary }]}>
            This is a modal dialog. You can put any content here.
          </Text>
          <View style={styles.modalButtons}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={() => setModalVisible(false)}
              style={{ flex: 1, marginRight: 8 }}
            />
            <Button
              title="Confirm"
              onPress={() => {
                setModalVisible(false);
                showAlert('Modal confirmed!');
              }}
              style={{ flex: 1, marginLeft: 8 }}
            />
          </View>
        </View>
      </Modal>

      {/* Drawer */}
      <Drawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        position="left"
        size="md"
      >
        <View style={styles.drawerContent}>
          <Text style={[styles.drawerTitle, { color: theme.textPrimary }]}>
            Navigation Drawer
          </Text>
          <Text style={[styles.drawerText, { color: theme.textSecondary }]}>
            This is a slide-out drawer component. You can put navigation items, settings, or any content here.
          </Text>
          <View style={styles.drawerActions}>
            <Button
              title="Close Drawer"
              onPress={() => setDrawerVisible(false)}
              style={{ marginBottom: 8 }}
            />
            <Button
              title="Action Button"
              variant="outline"
              onPress={() => showAlert('Drawer action pressed!')}
            />
          </View>
        </View>
      </Drawer>

      {/* Alert */}
      <AlertComponent
        visible={alertVisible}
        message={alertMessage}
        variant="info"
        position="bottom"
        onDismiss={() => setAlertVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  buttonGrid: {
    gap: 12,
  },
  buttonSizes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cardText: {
    fontSize: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cardSizes: {
    gap: 12,
  },
  avatarRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  switchRow: {
    gap: 16,
  },
  switchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 16,
    flex: 1,
  },
  loadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  modalContent: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
  },
  drawerButtons: {
    flexDirection: 'row',
  },
  drawerContent: {
    padding: 20,
    flex: 1,
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  drawerText: {
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 22,
  },
  drawerActions: {
    marginTop: 'auto',
  },
});