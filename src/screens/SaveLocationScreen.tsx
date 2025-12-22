import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  RefreshControl,
  
} from 'react-native';
import { theme } from '../constants/theme';
import { apiService } from '../utils/apiService';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Statusbar from '../constants/Statusbar';

// Types for location data
interface Location {
  _id: string;
  name: string | null;
  address: string;
  area: string;
  city: string;
  district: string;
  state: string;
  country: string;
  formattedAddress: string;
  zipcode: string;
  coordinates: [number, number];
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface LocationsResponse {
  total: number;
  totalPages: number;
  page: number;
  limit: number;
  data: Location[];
}

export default function SaveLocationScreen() {
  const navigation = useNavigation();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  // Fetch locations from API
  const fetchLocations = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      console.log('🌍 Fetching locations from API...');
      const response = await apiService.getLocations('india');
      
      if (response.success && response.data) {
        // Handle the nested response structure
        const locationsData = response.data.data || response.data;
        
        if (locationsData && Array.isArray(locationsData.data)) {
          setLocations(locationsData.data);
          console.log('✅ Locations fetched successfully:', locationsData.data.length, 'locations');
        } else {
          console.log('⚠️ No locations data found in response');
          setLocations([]);
        }
      } else {
        console.log('❌ API call failed:', response.error);
        setError(response.error || 'Failed to fetch locations');
      }
    } catch (err) {
      console.log('🚨 Error fetching locations:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load locations on component mount
  useEffect(() => {
    fetchLocations();
  }, []);

  // Refresh locations when screen comes into focus (e.g., after creating a new location)
  useFocusEffect(
    React.useCallback(() => {
      fetchLocations();
    }, [])
  );

  // Handle pull-to-refresh
  const onRefresh = () => {
    fetchLocations(true);
  };

  // Handle location selection
  const selectLocation = (location: Location) => {
    setSelectedLocation(location);
    console.log('📍 Location selected:', location.formattedAddress);
    
    // Show confirmation alert
    Alert.alert(
      'Location Selected',
      `You have selected:\n${location.formattedAddress}`,
      [
        {
          text: 'OK',
          onPress: () => console.log('Location selection confirmed')
        }
      ]
    );
  };

  // Handle navigation to create location page
  const handleCreateLocation = () => {
    console.log('🆕 Navigating to Create Location page');
    // @ts-ignore - TypeScript issue with navigation
    navigation.navigate('CreateLocationScreen');
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Invalid Date';
    }
  };

  // Render location item
  const renderLocationItem = (location: Location) => {
    const isSelected = selectedLocation?._id === location._id;
    
    return (
      <TouchableOpacity
        key={location._id}
        style={[
          styles.locationCard,
          isSelected && styles.selectedLocationCard
        ]}
        onPress={() => selectLocation(location)}
        activeOpacity={0.7}
      >
        <View style={styles.locationHeader}>
          <View style={styles.locationTitleContainer}>
            <Text style={[
              styles.locationName,
              isSelected && styles.selectedLocationName
            ]}>
              {location.name || 'Unnamed Location'}
            </Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: location.isActive ? theme.colors.success : theme.colors.error }
            ]}>
              <Text style={styles.statusBadgeText}>
                {location.isActive ? 'Active' : 'Inactive'}
              </Text>
            </View>
            {isSelected && (
              <View style={styles.selectedBadge}>
                <Text style={styles.selectedBadgeText}>✓ Selected</Text>
              </View>
            )}
          </View>
          {location.address && (
            <Text style={styles.locationAddress}>{location.address}</Text>
          )}
        </View>

        <View style={styles.locationDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Area:</Text>
            <Text style={styles.detailValue}>{location.area}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>City:</Text>
            <Text style={styles.detailValue}>{location.city}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>District:</Text>
            <Text style={styles.detailValue}>{location.district}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>State:</Text>
            <Text style={styles.detailValue}>{location.state}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Country:</Text>
            <Text style={styles.detailValue}>{location.country}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>ZIP Code:</Text>
            <Text style={styles.detailValue}>{location.zipcode}</Text>
          </View>
          {location.coordinates && location.coordinates.length === 2 && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Coordinates:</Text>
              <Text style={styles.detailValue}>
                {location.coordinates[0].toFixed(6)}, {location.coordinates[1].toFixed(6)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.locationFooter}>
          <Text style={styles.formattedAddress}>{location.formattedAddress}</Text>
          <Text style={styles.createdDate}>
            Created: {formatDate(location.createdAt)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Render loading state
  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading locations...</Text>
      </View>
    );
  }

  // Render error state
  if (error && !loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={() => fetchLocations()}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Statusbar/>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Saved Locations</Text>
          <TouchableOpacity 
            style={styles.createButton}
            onPress={handleCreateLocation}
          >
            <Text style={styles.createButtonText}>+ Create Location</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>
          {locations.length} location{locations.length !== 1 ? 's' : ''} found
        </Text>
        {selectedLocation && (
          <View style={styles.selectedLocationInfo}>
            <Text style={styles.selectedLocationLabel}>Selected Location:</Text>
            <Text style={styles.selectedLocationValue}>
              {selectedLocation.formattedAddress}
            </Text>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {locations.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text style={styles.noDataText}>No locations found</Text>
            <Text style={styles.noDataSubtext}>
              Pull down to refresh or check your connection
            </Text>
          </View>
        ) : (
          locations.map(renderLocationItem)
        )}
      </ScrollView>

      {locations.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={() => fetchLocations()}
          >
            <Text style={styles.refreshButtonText}>Refresh Locations</Text>
          </TouchableOpacity>
          {selectedLocation && (
            <TouchableOpacity 
              style={styles.clearSelectionButton}
              onPress={() => setSelectedLocation(null)}
            >
              <Text style={styles.clearSelectionButtonText}>Clear Selection</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.small,
  },
  createButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.small,
    borderRadius: theme.borderRadius.medium,
  },
  createButtonText: {
    color: 'white',
    fontSize: theme.fonts.size.medium,
    fontWeight: theme.fonts.weight.medium,
  },
  headerTitle: {
    fontSize: theme.fonts.size.xlarge,
    fontWeight: theme.fonts.weight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.small,
  },
  headerSubtitle: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.medium,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xlarge,
  },
  loadingText: {
    marginTop: theme.spacing.medium,
    fontSize: theme.fonts.size.medium,
    color: theme.colors.textSecondary,
  },
  errorText: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: theme.spacing.medium,
  },
  noDataText: {
    fontSize: theme.fonts.size.large,
    fontWeight: theme.fonts.weight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.small,
  },
  noDataSubtext: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.large,
    paddingVertical: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
  },
  retryButtonText: {
    color: 'white',
    fontSize: theme.fonts.size.medium,
    fontWeight: theme.fonts.weight.medium,
  },
  locationCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.medium,
    marginBottom: theme.spacing.medium,
    ...theme.shadows.card,
  },
  locationHeader: {
    marginBottom: theme.spacing.medium,
  },
  locationTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.small,
  },
  locationName: {
    fontSize: theme.fonts.size.large,
    fontWeight: theme.fonts.weight.bold,
    color: theme.colors.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.small,
    paddingVertical: theme.spacing.small,
    borderRadius: theme.borderRadius.small,
  },
  statusBadgeText: {
    color: 'white',
    fontSize: theme.fonts.size.small,
    fontWeight: theme.fonts.weight.medium,
  },
  locationAddress: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  locationDetails: {
    marginBottom: theme.spacing.medium,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.small,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailLabel: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.textSecondary,
    fontWeight: theme.fonts.weight.medium,
    flex: 1,
  },
  detailValue: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.text,
    flex: 2,
    textAlign: 'right',
  },
  locationFooter: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: theme.spacing.medium,
  },
  formattedAddress: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.small,
    lineHeight: 20,
  },
  createdDate: {
    fontSize: theme.fonts.size.small,
    color: theme.colors.textSecondary,
  },
  footer: {
    padding: theme.spacing.medium,
    backgroundColor: theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  refreshButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: 'white',
    fontSize: theme.fonts.size.medium,
    fontWeight: theme.fonts.weight.medium,
  },
  // Selection styles
  selectedLocationCard: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: '#f8f9ff',
  },
  selectedLocationName: {
    color: theme.colors.primary,
    fontWeight: theme.fonts.weight.bold,
  },
  selectedBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.small,
    paddingVertical: theme.spacing.small,
    borderRadius: theme.borderRadius.small,
    marginLeft: theme.spacing.small,
  },
  selectedBadgeText: {
    color: 'white',
    fontSize: theme.fonts.size.small,
    fontWeight: theme.fonts.weight.bold,
  },
  // Header selected location styles
  selectedLocationInfo: {
    marginTop: theme.spacing.small,
    padding: theme.spacing.medium,
    backgroundColor: theme.colors.rice,
    borderRadius: theme.borderRadius.medium,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  selectedLocationLabel: {
    fontSize: theme.fonts.size.small,
    color: theme.colors.textSecondary,
    fontWeight: theme.fonts.weight.medium,
    marginBottom: theme.spacing.small,
  },
  selectedLocationValue: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.text,
    fontWeight: theme.fonts.weight.medium,
    lineHeight: 18,
  },
  clearSelectionButton: {
    backgroundColor: theme.colors.error,
    paddingVertical: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
    marginTop: theme.spacing.small,
  },
  clearSelectionButtonText: {
    color: 'white',
    fontSize: theme.fonts.size.medium,
    fontWeight: theme.fonts.weight.medium,
  },
});