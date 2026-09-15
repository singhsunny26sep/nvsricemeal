import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';
import { updateService, UpdateInfo } from '../utils/updateService';

const AppUpdateBanner: React.FC = () => {
  const { strings } = useLanguage();
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    checkUpdate();
  }, []);

  const checkUpdate = async () => {
    try {
      const info = await updateService.checkForUpdate();
      if (info.hasUpdate) {
        setUpdateInfo(info);
        setVisible(true);
      }
    } catch (error) {
      console.log('AppUpdateBanner: Error checking update', error);
    }
  };

  const handleUpdate = () => {
    if (updateInfo) {
      Linking.openURL(updateInfo.playStoreUrl).catch((error) => {
        console.log('AppUpdateBanner: Failed to open Play Store', error);
        Alert.alert(
          strings?.common?.error || 'Error',
          'Could not open Play Store. Please update manually.',
        );
      });
    }
  };

  const handleRemindLater = async () => {
    await updateService.setRemindLater();
    setVisible(false);
  };

  const handleClose = () => {
    if (updateInfo?.isForced) {
      return;
    }
    setVisible(false);
  };

  if (!updateInfo || !visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      hardwareAccelerated
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Icon name="system-update" size={32} color={theme.colors.card} />
            </View>
            {!updateInfo.isForced && (
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Icon name="close" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>
              {strings?.update?.title || 'Update Available'}
            </Text>
            <Text style={styles.message}>
              {updateInfo.message ||
                (strings?.update?.message ||
                  `A new version (v${updateInfo.latestVersion}) of the app is available. Please update to enjoy the latest features and improvements.`)}
            </Text>
            <View style={styles.versionRow}>
              <Text style={styles.versionLabel}>
                {strings?.update?.currentVersion || 'Current'}:
              </Text>
              <Text style={styles.versionValue}>{updateInfo.currentVersion}</Text>
              <Text style={styles.versionLabel}>
                {strings?.update?.latestVersion || 'Latest'}:
              </Text>
              <Text style={styles.versionValue}>{updateInfo.latestVersion}</Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            {!updateInfo.isForced && (
              <TouchableOpacity
                style={[styles.button, styles.remindButton]}
                onPress={handleRemindLater}
              >
                <Icon name="schedule" size={20} color={theme.colors.primary} />
                <Text style={styles.remindButtonText}>
                  {strings?.update?.remindLater || 'Remind Me Later'}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.button, styles.updateButton]}
              onPress={handleUpdate}
            >
              <Icon name="cloud-download" size={20} color={theme.colors.card} />
              <Text style={styles.updateButtonText}>
                {strings?.update?.updateNow || 'Update Now'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.medium,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.large,
    overflow: 'hidden',
    ...theme.shadows.card,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.medium,
    backgroundColor: theme.colors.primary,
    position: 'relative',
  },
  iconContainer: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.medium,
  },
  closeButton: {
    position: 'absolute',
    top: theme.spacing.small,
    right: theme.spacing.small,
    padding: theme.spacing.small,
    zIndex: 1,
  },
  content: {
    paddingHorizontal: theme.spacing.large,
    paddingVertical: theme.spacing.medium,
  },
  title: {
    fontSize: theme.fonts.size.xlarge,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.medium,
    fontFamily: theme.fonts.family.bold,
  },
  message: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing.medium,
    fontFamily: theme.fonts.family.regular,
  },
  versionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing.small,
    paddingTop: theme.spacing.medium,
    borderTopWidth: 1,
    borderTopColor: 'rgba(76, 175, 80, 0.1)',
  },
  versionLabel: {
    fontSize: theme.fonts.size.small,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.family.regular,
  },
  versionValue: {
    fontSize: theme.fonts.size.small,
    fontWeight: 'bold',
    color: theme.colors.primary,
    fontFamily: theme.fonts.family.bold,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: theme.spacing.medium,
    gap: theme.spacing.medium,
    borderTopWidth: 1,
    borderTopColor: 'rgba(76, 175, 80, 0.1)',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
    gap: theme.spacing.small,
  },
  updateButton: {
    backgroundColor: theme.colors.primary,
    elevation: 3,
  },
  updateButtonText: {
    color: theme.colors.card,
    fontSize: theme.fonts.size.large,
    fontWeight: 'bold',
    fontFamily: theme.fonts.family.bold,
  },
  remindButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.2)',
  },
  remindButtonText: {
    color: theme.colors.primary,
    fontSize: theme.fonts.size.medium,
    fontWeight: '600',
    fontFamily: theme.fonts.family.medium,
  },
});

export default AppUpdateBanner;
