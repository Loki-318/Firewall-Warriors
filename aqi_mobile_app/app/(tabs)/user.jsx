import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// User class
class User {
  constructor(userId, name) {
    this.userId = userId;
    this.name = name;
    this.points = 0;
    this.streak = 0;
    this.last_contribution = null;
    this.vouchers = [];
  }

  contributeData() {
    // Creating date objects in the proper format
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of day for proper comparison
    
    // Check if the contribution is on a new day
    if (this.last_contribution && 
        this.last_contribution.getTime() === today.getTime()) {
      return {
        success: false,
        message: "You've already contributed today!"
      };
    }
    
    // Streak logic
    let yesterdayDate = new Date(today);
    yesterdayDate.setDate(today.getDate() - 1);
    
    if (this.last_contribution && 
        this.last_contribution.getTime() === yesterdayDate.getTime()) {
      this.streak += 1;
    } else {
      this.streak = 1;
    }
    
    this.last_contribution = today;
    const pointsEarned = 10 + (this.streak * 2); // Base 10 points + streak bonus
    this.points += pointsEarned;
    
    return {
      success: true,
      message: `You earned ${pointsEarned} points!`,
      details: {
        points: this.points,
        streak: this.streak,
        earned: pointsEarned
      }
    };
  }
  
  redeemVoucher(voucher) {
    if (this.points >= voucher.pointsRequired) {
      this.points -= voucher.pointsRequired;
      this.vouchers.push(voucher);
      return {
        success: true,
        message: `Successfully redeemed ${voucher.name}!`,
        remainingPoints: this.points
      };
    } else {
      return {
        success: false,
        message: `Not enough points to redeem this voucher. You need ${voucher.pointsRequired - this.points} more points.`
      };
    }
  }
  
  getStatus() {
    return {
      name: this.name,
      points: this.points,
      streak: this.streak,
      vouchers: this.vouchers.map(v => v.name)
    };
  }
}

// Voucher class
class Voucher {
  constructor(name, pointsRequired, description, icon) {
    this.name = name;
    this.pointsRequired = pointsRequired;
    this.description = description;
    this.icon = icon;
  }
}

// Sample vouchers
const AVAILABLE_VOUCHERS = [
  new Voucher('5% Discount', 50, 'Get 5% off your next purchase', 'pricetag'),
  new Voucher('10% Discount', 100, 'Get 10% off your next purchase', 'cart'),
  new Voucher('Free Shipping', 75, 'Free shipping on your next order', 'airplane'),
  new Voucher('Premium Feature', 150, 'Access premium features for a month', 'star'),
];

const App = () => {
  const [user, setUser] = useState(new User(1, 'Alex'));
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Force refresh the UI
  const refreshUI = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  
  // Handle contribution
  const handleContribute = () => {
    const result = user.contributeData();
    if (result.success) {
      Alert.alert('Success', result.message, [
        { 
          text: 'OK', 
          onPress: () => refreshUI() 
        }
      ]);
    } else {
      Alert.alert('Notice', result.message);
    }
  };
  
  // Handle voucher redemption
  const handleRedeemVoucher = (voucher) => {
    const result = user.redeemVoucher(voucher);
    if (result.success) {
      Alert.alert('Success', result.message, [
        { 
          text: 'OK', 
          onPress: () => refreshUI() 
        }
      ]);
    } else {
      Alert.alert('Notice', result.message);
    }
  };
  
  // Simulate a past contribution for testing
  useEffect(() => {
    // Simulate a contribution from yesterday to test streak
    if (user.streak === 0) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      user.last_contribution = yesterday;
      user.streak = 1;
      user.points = 15; // Initial points to start with
      refreshUI();
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#4c669f', '#3b5998', '#192f6a']}
        style={styles.header}
      >
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
          </View>
          <View>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userPoints}>{user.points} Points</Text>
          </View>
        </View>
        
        <View style={styles.streakContainer}>
          <Ionicons name="flame" size={24} color="#FF9500" />
          <Text style={styles.streakText}>
            {user.streak} Day{user.streak !== 1 ? 's' : ''} Streak
          </Text>
        </View>
      </LinearGradient>
      
      {/* Contribute Button */}
      <View style={styles.contributeContainer}>
        <TouchableOpacity
          style={styles.contributeButton}
          onPress={handleContribute}
        >
          <LinearGradient
            colors={['#00c6ff', '#0072ff']}
            style={styles.contributeGradient}
          >
            <Ionicons name="add-circle" size={24} color="white" />
            <Text style={styles.contributeText}>Contribute Data</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color="#4c669f" />
          <Text style={styles.infoText}>
            Contribute once daily to earn points and build your streak!
          </Text>
        </View>
      </View>
      
      {/* Available Vouchers */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Available Rewards</Text>
      </View>
      
      <ScrollView style={styles.vouchersContainer}>
        {AVAILABLE_VOUCHERS.map((voucher, index) => (
          <View key={index} style={styles.voucherCard}>
            <View style={styles.voucherInfo}>
              <View style={styles.voucherIconContainer}>
                <Ionicons name={voucher.icon} size={28} color="#4c669f" />
              </View>
              <View style={styles.voucherDetails}>
                <Text style={styles.voucherName}>{voucher.name}</Text>
                <Text style={styles.voucherDescription}>{voucher.description}</Text>
                <Text style={styles.voucherPoints}>{voucher.pointsRequired} Points</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[
                styles.redeemButton,
                user.points < voucher.pointsRequired && styles.disabledButton
              ]}
              onPress={() => handleRedeemVoucher(voucher)}
              disabled={user.points < voucher.pointsRequired}
            >
              <Text style={styles.redeemButtonText}>Redeem</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
      
      {/* My Vouchers */}
      {user.vouchers.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Rewards</Text>
          </View>
          
          <ScrollView style={styles.myVouchersContainer} horizontal>
            {user.vouchers.map((voucher, index) => (
              <View key={index} style={styles.myVoucherCard}>
                <Ionicons name={
                  AVAILABLE_VOUCHERS.find(v => v.name === voucher.name)?.icon || 'gift'
                } size={32} color="#4c669f" />
                <Text style={styles.myVoucherName}>{voucher.name}</Text>
              </View>
            ))}
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  userName: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userPoints: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  streakText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: '600',
  },
  contributeContainer: {
    padding: 20,
  },
  contributeButton: {
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contributeGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
  },
  contributeText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 102, 159, 0.1)',
    padding: 12,
    borderRadius: 10,
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    color: '#4a4a4a',
    fontSize: 14,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  vouchersContainer: {
    paddingHorizontal: 20,
  },
  voucherCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  voucherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  voucherIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(76, 102, 159, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  voucherDetails: {
    flex: 1,
  },
  voucherName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  voucherDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  voucherPoints: {
    fontSize: 14,
    color: '#4c669f',
    fontWeight: '600',
  },
  redeemButton: {
    backgroundColor: '#4c669f',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  redeemButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#c4c4c4',
  },
  myVouchersContainer: {
    paddingLeft: 20,
    paddingRight: 5,
    marginBottom: 20,
  },
  myVoucherCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginRight: 15,
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  myVoucherName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default App;