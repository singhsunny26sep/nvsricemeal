import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LocationPermissionLog {
  id: string;
  timestamp: string;
  eventType: 'permission_requested' | 'permission_granted' | 'permission_denied' | 'permission_blocked' | 'location_saved' | 'location_save_failed' | 'location_retrieved';
  platform: 'ios' | 'android';
  permissionType?: 'LOCATION_WHEN_IN_USE' | 'ACCESS_FINE_LOCATION';
  result?: 'granted' | 'denied' | 'blocked' | 'unavailable';
  coordinates?: [number, number];
  address?: string;
  errorMessage?: string;
  userAction?: 'manual' | 'automatic';
  context?: string;
}

class LocationLogger {
  private readonly LOG_STORAGE_KEY = '@nvs_location_permission_logs';
  private readonly MAX_LOGS = 50;

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private getCurrentTimestamp(): string {
    return new Date().toISOString();
  }

  private getPlatform(): 'ios' | 'android' {
    return require('react-native').Platform.OS as 'ios' | 'android';
  }

  async logPermissionRequested(context: string = 'general', userAction: 'manual' | 'automatic' = 'manual'): Promise<void> {
    const log: LocationPermissionLog = {
      id: this.generateId(),
      timestamp: this.getCurrentTimestamp(),
      eventType: 'permission_requested',
      platform: this.getPlatform(),
      permissionType: this.getPlatform() === 'ios' ? 'LOCATION_WHEN_IN_USE' : 'ACCESS_FINE_LOCATION',
      userAction,
      context,
    };

    await this.saveLog(log);
    console.log('📍 [Location Permission] Permission requested:', log);
  }

  async logPermissionResult(result: 'granted' | 'denied' | 'blocked' | 'unavailable', context: string = 'general'): Promise<void> {
    const log: LocationPermissionLog = {
      id: this.generateId(),
      timestamp: this.getCurrentTimestamp(),
      eventType: result === 'granted' ? 'permission_granted' : 
                 result === 'denied' ? 'permission_denied' : 'permission_blocked',
      platform: this.getPlatform(),
      permissionType: this.getPlatform() === 'ios' ? 'LOCATION_WHEN_IN_USE' : 'ACCESS_FINE_LOCATION',
      result,
      context,
    };

    await this.saveLog(log);
    
    const emoji = result === 'granted' ? '✅' : result === 'denied' ? '❌' : '🚫';
    console.log(`📍 [Location Permission] ${emoji} Permission ${result}:`, log);
  }

  async logLocationSaved(coordinates: [number, number], address?: string, context: string = 'general'): Promise<void> {
    const log: LocationPermissionLog = {
      id: this.generateId(),
      timestamp: this.getCurrentTimestamp(),
      eventType: 'location_saved',
      platform: this.getPlatform(),
      coordinates,
      address,
      context,
    };

    await this.saveLog(log);
    console.log('💾 [Location Save] Location saved:', {
      coordinates,
      address,
      timestamp: log.timestamp,
      context,
    });
  }

  async logLocationSaveFailed(errorMessage: string, context: string = 'general'): Promise<void> {
    const log: LocationPermissionLog = {
      id: this.generateId(),
      timestamp: this.getCurrentTimestamp(),
      eventType: 'location_save_failed',
      platform: this.getPlatform(),
      errorMessage,
      context,
    };

    await this.saveLog(log);
    console.error('💾 [Location Save] Location save failed:', {
      error: errorMessage,
      timestamp: log.timestamp,
      context,
    });
  }

  async logLocationRetrieved(coordinates: [number, number], context: string = 'general'): Promise<void> {
    const log: LocationPermissionLog = {
      id: this.generateId(),
      timestamp: this.getCurrentTimestamp(),
      eventType: 'location_retrieved',
      platform: this.getPlatform(),
      coordinates,
      context,
    };

    await this.saveLog(log);
    console.log('📍 [Location Retrieved] Current location:', {
      coordinates,
      timestamp: log.timestamp,
      context,
    });
  }

  private async saveLog(log: LocationPermissionLog): Promise<void> {
    try {
      const existingLogs = await this.getAllLogs();
      const updatedLogs = [log, ...existingLogs].slice(0, this.MAX_LOGS);
      await AsyncStorage.setItem(this.LOG_STORAGE_KEY, JSON.stringify(updatedLogs));
    } catch (error) {
      console.error('Failed to save location log:', error);
    }
  }

  async getAllLogs(): Promise<LocationPermissionLog[]> {
    try {
      const logsString = await AsyncStorage.getItem(this.LOG_STORAGE_KEY);
      return logsString ? JSON.parse(logsString) : [];
    } catch (error) {
      console.error('Failed to get location logs:', error);
      return [];
    }
  }

  async clearLogs(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.LOG_STORAGE_KEY);
      console.log('📍 [Location Logger] All logs cleared');
    } catch (error) {
      console.error('Failed to clear location logs:', error);
    }
  }

  async getLogsByType(eventType: LocationPermissionLog['eventType']): Promise<LocationPermissionLog[]> {
    const allLogs = await this.getAllLogs();
    return allLogs.filter(log => log.eventType === eventType);
  }

  async getRecentLogs(count: number = 10): Promise<LocationPermissionLog[]> {
    const allLogs = await this.getAllLogs();
    return allLogs.slice(0, count);
  }

  async getPermissionStats(): Promise<{
    total: number;
    granted: number;
    denied: number;
    blocked: number;
    successRate: number;
  }> {
    const allLogs = await this.getAllLogs();
    const permissionLogs = allLogs.filter(log => 
      ['permission_granted', 'permission_denied', 'permission_blocked'].includes(log.eventType)
    );

    const granted = permissionLogs.filter(log => log.eventType === 'permission_granted').length;
    const denied = permissionLogs.filter(log => log.eventType === 'permission_denied').length;
    const blocked = permissionLogs.filter(log => log.eventType === 'permission_blocked').length;
    const total = permissionLogs.length;

    return {
      total,
      granted,
      denied,
      blocked,
      successRate: total > 0 ? (granted / total) * 100 : 0,
    };
  }

  async exportLogs(): Promise<string> {
    const logs = await this.getAllLogs();
    const csvHeader = 'ID,Timestamp,Event Type,Platform,Permission Type,Result,Coordinates,Address,Error,User Action,Context\n';
    const csvRows = logs.map(log => {
      const coords = log.coordinates ? `${log.coordinates[0]},${log.coordinates[1]}` : '';
      const escapeCsv = (value: string | undefined) => `"${value || ''}"`;
      
      return [
        log.id,
        log.timestamp,
        log.eventType,
        log.platform,
        log.permissionType || '',
        log.result || '',
        coords,
        log.address || '',
        log.errorMessage || '',
        log.userAction || '',
        log.context || '',
      ].map(escapeCsv).join(',');
    }).join('\n');

    return csvHeader + csvRows;
  }
}

export const locationLogger = new LocationLogger();
export default locationLogger;