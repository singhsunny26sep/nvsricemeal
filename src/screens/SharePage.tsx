import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Alert,
  StatusBar,
  Linking,
  Animated,
  Dimensions,
  ScrollView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../constants/theme';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

export default function SharePage() {
  const navigation = useNavigation();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
    
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleShareApp = async () => {
    try {
      const result = await Share.share({
        message: `✨ Experience Luxury Rice Like Never Before ✨\n\nNVS Rice Mart - Where Quality Meets Elegance\n\n🌟 Premium Rice Selection\n🚀 Lightning Fast Delivery\n💎 5-Star Customer Experience\n\nDownload Now: https://play.google.com/store/apps/details?id=com.nvsricemart\n\nJoin the Elite Rice Community Today! 🍚`,
        title: 'Share NVS Rice Mart',
      });
      
      if (result.action === Share.sharedAction) {
        Alert.alert('✨ Shared Successfully!', 'Thank you for spreading the luxury experience!');
      }
    } catch (error) {
      Alert.alert('Unable to share', 'Please try again later');
    }
  };

  const handleRateOnPlayStore = () => {
    Linking.openURL('https://play.google.com/store/apps/details?id=com.nvsricemart');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A1A" />
      
      {/* Premium Dark Background */}
      <View style={styles.background}>
        <View style={[styles.orb, styles.orb1]} />
        <View style={[styles.orb, styles.orb2]} />
        <View style={[styles.orb, styles.orb3]} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Icon name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Invite & Earn</Text>
            <View style={styles.headerRight} />
          </View>

          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.logoContainer}>
              <View style={styles.logoBorder}>
                <View style={styles.logoInner}>
                  <Icon name="workspace-premium" size={60} color="#FFD700" />
                </View>
              </View>
            </View>
            <Text style={styles.heroTitle}>Share Luxury Rice</Text>
            <Text style={styles.heroSubtitle}>
              Invite friends & earn premium rewards
            </Text>
            
            <View style={styles.premiumBadge}>
              <Icon name="verified" size={16} color="#FFD700" />
              <Text style={styles.premiumText}>Premium Member Benefits</Text>
            </View>
          </View>

          {/* Referral Card */}
          <View style={styles.glassCard}>
            <View style={styles.referralHeader}>
              <Icon name="card-giftcard" size={28} color="#FFD700" />
              <Text style={styles.referralTitle}>Your Exclusive Code</Text>
            </View>
            <View style={styles.codeContainer}>
              <Text style={styles.referralCode}>RICE2024</Text>
              <TouchableOpacity style={styles.copyButton}>
                <Icon name="content-copy" size={20} color="#FFD700" />
              </TouchableOpacity>
            </View>
            <Text style={styles.referralDescription}>
              Share this code and earn ₹100 on every successful referral
            </Text>
          </View>

          {/* Main CTA Button */}
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity activeOpacity={0.9} onPress={handleShareApp} style={styles.ctaButton}>
              <Icon name="ios-share" size={28} color="#1A1A1A" />
              <Text style={styles.ctaText}>Share Now & Earn Rewards</Text>
              <Icon name="arrow-forward" size={28} color="#1A1A1A" />
            </TouchableOpacity>
          </Animated.View>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Icon name="people" size={32} color="#FFD700" />
              <Text style={styles.statNumber}>50K+</Text>
              <Text style={styles.statLabel}>Active Members</Text>
            </View>
            <View style={styles.statCard}>
              <Icon name="star" size={32} color="#FFD700" />
              <Text style={styles.statNumber}>4.9</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statCard}>
              <Icon name="local-shipping" size={32} color="#FFD700" />
              <Text style={styles.statNumber}>24/7</Text>
              <Text style={styles.statLabel}>Delivery</Text>
            </View>
          </View>

          {/* Rewards Section */}
          <View style={styles.rewardsSection}>
            <Text style={styles.sectionTitle}>✨ Premium Rewards</Text>
            <View style={styles.rewardsGrid}>
              <View style={styles.rewardCard}>
                <Icon name="attach-money" size={36} color="#FFD700" />
                <Text style={styles.rewardValue}>₹100</Text>
                <Text style={styles.rewardLabel}>Per Referral</Text>
              </View>
              <View style={styles.rewardCard}>
                <Icon name="local-offer" size={36} color="#FFD700" />
                <Text style={styles.rewardValue}>15%</Text>
                <Text style={styles.rewardLabel}>Friend Discount</Text>
              </View>
              <View style={styles.rewardCard}>
                <Icon name="emoji-events" size={36} color="#FFD700" />
                <Text style={styles.rewardValue}>Unlimited</Text>
                <Text style={styles.rewardLabel}>Earning Potential</Text>
              </View>
            </View>
          </View>

          {/* Premium Features */}
          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>💎 Premium Features</Text>
            <View style={styles.featuresCard}>
              {[
                'Exclusive Rice Varieties',
                'Priority Customer Support',
                'Free Express Delivery',
                'Premium Packaging',
                'Loyalty Rewards Program',
                'Early Access to Offers'
              ].map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <View style={styles.featureDot} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Bottom CTA */}
          <TouchableOpacity onPress={handleRateOnPlayStore} style={styles.bottomCTA}>
            <Text style={styles.bottomCTAText}>Rate us 5 stars on Play Store</Text>
            <View style={styles.starsRow}>
              <Icon name="star" size={20} color="#FFD700" />
              <Icon name="star" size={20} color="#FFD700" />
              <Icon name="star" size={20} color="#FFD700" />
              <Icon name="star" size={20} color="#FFD700" />
              <Icon name="star" size={20} color="#FFD700" />
            </View>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  background: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.3,
  },
  orb1: {
    width: width * 0.6,
    height: width * 0.6,
    backgroundColor: '#FFD700',
    top: -width * 0.3,
    right: -width * 0.2,
    borderRadius: width * 0.3,
  },
  orb2: {
    width: width * 0.4,
    height: width * 0.4,
    backgroundColor: '#FFA500',
    bottom: -width * 0.2,
    left: -width * 0.2,
    borderRadius: width * 0.2,
  },
  orb3: {
    width: width * 0.5,
    height: width * 0.5,
    backgroundColor: '#FF8C00',
    top: height * 0.5,
    right: -width * 0.3,
    borderRadius: width * 0.25,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Platform.OS === 'ios' ? 50 : 40,
    marginBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  headerRight: {
    width: 44,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoBorder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#FFD700',
    padding: 3,
  },
  logoInner: {
    width: '100%',
    height: '100%',
    borderRadius: 52,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 15,
    textAlign: 'center',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,215,0,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  premiumText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '600',
  },
  glassCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24,
    padding: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  referralHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 15,
  },
  referralTitle: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '500',
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 16,
    marginBottom: 12,
  },
  referralCode: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFD700',
    letterSpacing: 2,
  },
  copyButton: {
    padding: 8,
  },
  referralDescription: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 18,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD700',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 12,
    marginBottom: 30,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  ctaText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 8,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFD700',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  rewardsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 15,
  },
  rewardsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  rewardCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 10,
  },
  rewardValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  rewardLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  featuresSection: {
    marginBottom: 30,
  },
  featuresCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFD700',
  },
  featureText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  bottomCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,215,0,0.1)',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
  },
  bottomCTAText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFD700',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 4,
  },
});