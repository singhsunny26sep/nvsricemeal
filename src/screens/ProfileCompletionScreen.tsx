import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  StatusBar,
  Platform,
  Modal,
  KeyboardAvoidingView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { theme } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../utils/apiService';
import { useNavigation, useRoute } from '@react-navigation/native';

const ProfileCompletionScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const initialUser = route.params?.user || {};
  const { login } = useAuth();

  const [name, setName] = useState(initialUser.name || '');
  const [email, setEmail] = useState(initialUser.email || '');
  const [dob, setDob] = useState(initialUser.dob ? initialUser.dob.split('T')[0] : '');
  const [imageUri, setImageUri] = useState<string | null>(initialUser.image || null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(dob ? new Date(dob) : new Date());
  const { strings } = useLanguage();

  const handlePickImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 800,
        maxHeight: 800,
      },
      (response) => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorCode) {
          console.log('ImagePicker Error: ', response.errorMessage);
          Alert.alert('Error', 'Failed to pick image: ' + response.errorMessage);
        } else if (response.assets && response.assets[0]) {
          const asset = response.assets[0];
          console.log('Selected image:', asset);
          setImageUri(asset.uri || null);
        }
      }
    );
  };

  const openDatePicker = () => {
    setTempDate(dob ? new Date(dob) : new Date());
    setIsDatePickerVisible(true);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setIsDatePickerVisible(false);
    }

    if (selectedDate) {
      setTempDate(selectedDate);
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      setDob(`${year}-${month}-${day}`);
    }
  };

  const validateForm = () => {
    // Validate name
    if (!name.trim()) {
      Alert.alert(
        strings?.common?.error || 'Error',
        'Please enter your name'
      );
      return false;
    }

    // Validate email (optional but if provided, should be valid)
    if (email.trim() && !/\S+@\S+\.\S+/.test(email.trim())) {
      Alert.alert(
        strings?.common?.error || 'Error',
        'Please enter a valid email address'
      );
      return false;
    }

    // Validate DOB format
    if (dob.trim() && !/^\d{4}-\d{2}-\d{2}$/.test(dob.trim())) {
      Alert.alert(
        strings?.common?.error || 'Error',
        'Date of Birth must be in YYYY-MM-DD format'
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // Create FormData
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('email', email.trim());

      if (dob.trim()) {
        formData.append('dob', dob.trim());
      }

      // Handle image upload
      if (imageUri) {
        const filename = imageUri.split('/').pop() || 'profile.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        // For React Native, we need to handle the file properly
        const fileObject = {
          uri: Platform.OS === 'android' ? imageUri : imageUri.replace('file://', ''),
          type: type,
          name: filename,
        };

        formData.append('image', fileObject as any);
        console.log('📸 Image attached:', fileObject);
      }

      console.log('📤 Submitting profile update...');
      console.log('Name:', name.trim());
      console.log('Email:', email.trim());
      console.log('DOB:', dob.trim());
      console.log('Image:', imageUri ? 'Present' : 'None');

      // Call API
      const response = await apiService.updateUserProfile(formData);

      console.log('📥 API Response:', JSON.stringify(response, null, 2));

      // Handle response
      if (response.success && response.data) {
        // Extract user data from response
        let userData = response.data;

        // If the response has a nested data structure
        if (userData.data) {
          userData = userData.data;
        }

        // If the response has a user object
        if (userData.user) {
          userData = userData.user;
        }

        console.log('👤 User data extracted:', userData);

        // Merge with initial user data
        const updatedUser = {
          ...initialUser,
          ...userData,
          name: userData.name || name,
          email: userData.email || email,
          dob: userData.dob || dob,
          image: userData.image || imageUri,
        };

        // Get current token
        const token = await AsyncStorage.getItem('userToken');
        console.log('🔑 Token for login:', token ? 'Present' : 'Missing');

        // Update auth context with new user data
        await login({
          ...updatedUser,
          token: token,
        });

        console.log('✅ Profile updated successfully!');

        // Show success message
        Alert.alert(
          strings?.login?.success || 'Success',
          'Profile updated successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate to home screen
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'HomeMain' }],
                });
              },
            },
          ]
        );
      } else {
        // Handle error response
        console.log('❌ API returned error:', response.error);
        Alert.alert(
          strings?.common?.error || 'Error',
          response.error || response.message || 'Failed to update profile'
        );
      }
    } catch (error) {
      console.error('❌ Profile update error:', error);

      // Handle errors
      let errorMessage = 'Network error occurred. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      Alert.alert(
        strings?.common?.error || 'Error',
        errorMessage
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />

        {/* Header */}
        <LinearGradient
          colors={['#1b50aa', '#3d81e8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Complete Your Profile</Text>
          <Text style={styles.headerSubtitle}>
            Please fill in your details to continue
          </Text>
        </LinearGradient>

        <View style={styles.formContainer}>
          {/* Profile Image */}
          <TouchableOpacity
            style={styles.imageContainer}
            onPress={handlePickImage}
            activeOpacity={0.7}
          >
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.profileImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Icon name="camera-alt" size={40} color={theme.colors.textSecondary} />
                <Text style={styles.imagePlaceholderText}>Add Photo</Text>
              </View>
            )}
            <View style={styles.cameraIconOverlay}>
              <Icon name="camera-alt" size={20} color={theme.colors.card} />
            </View>
          </TouchableOpacity>

          {/* Name Input */}
          <View style={styles.inputContainer}>
            <Icon name="person" size={20} color={theme.colors.textSecondary} />
            <TextInput
              style={styles.input}
              placeholder="Full Name *"
              placeholderTextColor={theme.colors.textSecondary}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              maxLength={50}
            />
          </View>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Icon name="email" size={20} color={theme.colors.textSecondary} />
            <TextInput
              style={styles.input}
              placeholder="Email (Optional)"
              placeholderTextColor={theme.colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              maxLength={100}
            />
          </View>

          {/* Date of Birth Picker */}
          <TouchableOpacity
            style={styles.inputContainer}
            onPress={openDatePicker}
            activeOpacity={0.7}
          >
            <Icon name="cake" size={20} color={theme.colors.textSecondary} />
            <Text style={[styles.input, !dob && styles.placeholderText]}>
              {dob || 'Date of Birth (Optional)'}
            </Text>
            <Icon name="calendar-today" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          {/* Date Picker Modal */}
          {(Platform.OS === 'ios' || isDatePickerVisible) && (
            <Modal
              visible={isDatePickerVisible}
              transparent
              animationType="slide"
              onRequestClose={() => setIsDatePickerVisible(false)}
            >
              <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setIsDatePickerVisible(false)}
              >
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Select Date of Birth</Text>
                    <TouchableOpacity onPress={() => setIsDatePickerVisible(false)}>
                      <Icon name="close" size={24} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.datePickerContainer}>
                    <DateTimePicker
                      value={tempDate}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={handleDateChange}
                      maximumDate={new Date()}
                      minimumDate={new Date(1900, 0, 1)}
                      style={styles.datePicker}
                    />

                  </View>
                </View>
              </TouchableOpacity>
            </Modal>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#1b50aa', '#3d81e8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitButtonGradient}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={theme.colors.card} />
              ) : (
                <Text style={styles.submitButtonText}>Complete Profile</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Note */}
          <Text style={styles.noteText}>
            * Required fields
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xlarge * 1.5,
    paddingHorizontal: theme.spacing.large,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTitle: {
    fontSize: theme.fonts.size.title,
    color: theme.colors.card,
    fontWeight: 'bold',
    fontFamily: theme.fonts.family.bold,
    marginBottom: theme.spacing.small,
  },
  headerSubtitle: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.card,
    opacity: 0.8,
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing.large,
    paddingTop: theme.spacing.xlarge,
    paddingBottom: theme.spacing.xlarge,
  },
  imageContainer: {
    alignSelf: 'center',
    marginBottom: theme.spacing.xlarge,
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: theme.colors.primary,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(27, 80, 170, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imagePlaceholderText: {
    marginTop: theme.spacing.small,
    fontSize: theme.fonts.size.medium,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.family.medium,
  },
  cameraIconOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: theme.colors.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.large,
    paddingHorizontal: theme.spacing.large,
    paddingVertical: theme.spacing.medium,
    marginBottom: theme.spacing.large,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.15)',
  },
  input: {
    flex: 1,
    fontSize: theme.fonts.size.large,
    color: theme.colors.text,
    fontFamily: theme.fonts.family.regular,
    paddingVertical: theme.spacing.small,
    marginLeft: theme.spacing.medium,
  },
  placeholderText: {
    color: theme.colors.textSecondary,
  },
  submitButton: {
    borderRadius: theme.borderRadius.large,
    overflow: 'hidden',
    marginTop: theme.spacing.large,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonGradient: {
    paddingVertical: theme.spacing.large,
    paddingHorizontal: theme.spacing.xlarge,
    borderRadius: theme.borderRadius.large,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 55,
  },
  submitButtonText: {
    color: theme.colors.card,
    fontSize: theme.fonts.size.large,
    fontWeight: 'bold',
    fontFamily: theme.fonts.family.bold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: theme.borderRadius.large,
    borderTopRightRadius: theme.borderRadius.large,
    paddingBottom: theme.spacing.large,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.large,
    paddingVertical: theme.spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    fontSize: theme.fonts.size.xlarge,
    fontWeight: 'bold',
    color: theme.colors.text,
    fontFamily: theme.fonts.family.bold,
  },
  datePickerContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.large,
  },
  datePicker: {
    width: '100%',
  },
  datePickerDoneButton: {
    marginTop: theme.spacing.medium,
    paddingVertical: theme.spacing.medium,
    paddingHorizontal: theme.spacing.xlarge,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.medium,
    minWidth: 100,
    alignItems: 'center',
  },
  datePickerDoneText: {
    color: theme.colors.card,
    fontSize: theme.fonts.size.large,
    fontWeight: 'bold',
    fontFamily: theme.fonts.family.bold,
  },
  noteText: {
    marginTop: theme.spacing.medium,
    fontSize: theme.fonts.size.small,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

export default ProfileCompletionScreen;