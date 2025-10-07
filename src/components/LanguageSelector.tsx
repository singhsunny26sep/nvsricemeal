import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useLanguage } from '../context/LanguageContext';
import { theme } from '../constants/theme';

interface Language {
  code: string;
  name: string;
  nativeName: string;
}

const languages: Language[] = [
  { code: 'kn', name: 'ಕನ್ನಡ', nativeName: 'ಕನ್ನಡ' },
  { code: 'en', name: 'English', nativeName: 'English' },
];

interface LanguageSelectorProps {
  visible: boolean;
  onClose: () => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ visible, onClose }) => {
  const { currentLanguage, setLanguage, strings } = useLanguage();

  const handleLanguageSelect = (languageCode: string) => {
    setLanguage(languageCode);
    onClose();
  };

  const renderLanguageItem = ({ item }: { item: Language }) => (
    <TouchableOpacity
      style={[
        styles.languageItem,
        currentLanguage === item.code && styles.selectedLanguageItem,
      ]}
      onPress={() => handleLanguageSelect(item.code)}
    >
      <View style={styles.languageInfo}>
        <Text style={[
          styles.languageName,
          currentLanguage === item.code && styles.selectedLanguageName,
        ]}>
          {item.nativeName}
        </Text>
        <Text style={[
          styles.languageCode,
          currentLanguage === item.code && styles.selectedLanguageCode,
        ]}>
          {item.name}
        </Text>
      </View>
      {currentLanguage === item.code && (
        <Icon name="check-circle" size={24} color={theme.colors.primary} />
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>{strings?.common?.language || 'Select Language'}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={languages}
            renderItem={renderLanguageItem}
            keyExtractor={(item) => item.code}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '50%',
    minHeight: '30%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.large,
    paddingVertical: theme.spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(76, 175, 80, 0.1)',
  },
  title: {
    fontSize: theme.fonts.size.large,
    fontWeight: 'bold',
    color: theme.colors.text,
    fontFamily: theme.fonts.family.bold,
  },
  closeButton: {
    padding: theme.spacing.small,
  },
  listContainer: {
    paddingBottom: theme.spacing.large,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.large,
    paddingVertical: theme.spacing.medium,
    marginHorizontal: theme.spacing.large,
    marginVertical: theme.spacing.small,
    borderRadius: theme.borderRadius.large,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.1)',
  },
  selectedLanguageItem: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderColor: theme.colors.primary,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: theme.fonts.size.medium,
    fontWeight: 'bold',
    color: theme.colors.text,
    fontFamily: theme.fonts.family.bold,
    marginBottom: 2,
  },
  selectedLanguageName: {
    color: theme.colors.primary,
  },
  languageCode: {
    fontSize: theme.fonts.size.small,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.family.regular,
  },
  selectedLanguageCode: {
    color: theme.colors.primary,
  },
});

export default LanguageSelector;