import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as Location from 'expo-location';
import axios from 'axios';

const LOCAL_IP = '192.168.1.3';
const API_URL = `http://${LOCAL_IP}:5000/api/markers`;

const AddMarker = ({ navigation }) => {
    const [markerData, setMarkerData] = useState({
        name: '',
        size: 'M',
        threat: 'Med',
        lat: null,
        lng: null,
    });
    const [loading, setLoading] = useState(false);
    const [locationError, setLocationError] = useState(null);

    useEffect(() => {
        getLocation();
    }, []);

    const getLocation = async () => {
        setLoading(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setLocationError('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });

            setMarkerData(prev => ({
                ...prev,
                lat: location.coords.latitude,
                lng: location.coords.longitude
            }));
            setLocationError(null);
        } catch (error) {
            setLocationError('Error getting location');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!markerData.name.trim()) {
            Alert.alert('Error', 'Please enter a name');
            return;
        }

        if (!markerData.lat || !markerData.lng) {
            Alert.alert('Error', 'Location data not available');
            return;
        }

        setLoading(true);
        try {
            const date = new Date();
            const istDate = new Date(date.getTime() + (5.5 * 60 * 60 * 1000));
            const formattedDate = istDate.toISOString().slice(0, 10);

            console.log({
                ...markerData,
                date_added: formattedDate
            })

            const response = await axios.post(API_URL, {
                ...markerData,
                date_added: formattedDate
            });

            Alert.alert(
                'Success',
                'Marker added successfully',
                [
                    {
                        text: 'OK',
                    }
                ]
            );
        } catch (error) {
            console.error('Error adding marker:', error);
            Alert.alert('Error', 'Failed to add marker');
        } finally {
            setLoading(false);
        }

    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="Name"
                value={markerData.name}
                onChangeText={(text) => setMarkerData(prev => ({ ...prev, name: text }))}
            />

            <View style={styles.pickerContainer}>
                <Text style={styles.label}>Size:</Text>
                <Picker
                    selectedValue={markerData.size}
                    style={styles.picker}
                    onValueChange={(value) => setMarkerData(prev => ({ ...prev, size: value }))}
                >
                    <Picker.Item label="Large" value="L" />
                    <Picker.Item label="Medium" value="M" />
                    <Picker.Item label="Small" value="S" />
                </Picker>
            </View>

            <View style={styles.pickerContainer}>
                <Text style={styles.label}>Threat Level:</Text>
                <Picker
                    selectedValue={markerData.threat}
                    style={styles.picker}
                    onValueChange={(value) => setMarkerData(prev => ({ ...prev, threat: value }))}
                >
                    <Picker.Item label="High" value="High" />
                    <Picker.Item label="Medium" value="Med" />
                    <Picker.Item label="Low" value="Low" />
                </Picker>
            </View>

            {locationError ? (
                <View style={styles.locationError}>
                    <Text style={styles.errorText}>{locationError}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={getLocation}>
                        <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.locationInfo}>
                    <Text style={styles.locationText}>
                        Location: {markerData.lat?.toFixed(6)}, {markerData.lng?.toFixed(6)}
                    </Text>
                    <TouchableOpacity style={styles.refreshButton} onPress={getLocation}>
                        <Text style={styles.refreshText}>Refresh Location</Text>
                    </TouchableOpacity>
                </View>
            )}

            <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
                disabled={loading}
            >
                <Text style={styles.submitText}>Add Marker</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 20,
        fontSize: 16,
    },
    pickerContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
        color: '#333',
    },
    picker: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
    },
    locationInfo: {
        marginBottom: 20,
        padding: 15,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
    },
    locationText: {
        fontSize: 14,
        color: '#333',
        marginBottom: 10,
    },
    locationError: {
        marginBottom: 20,
        padding: 15,
        backgroundColor: '#fee',
        borderRadius: 8,
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
    },
    submitButton: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    submitText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    refreshButton: {
        padding: 10,
        backgroundColor: '#eee',
        borderRadius: 6,
        alignItems: 'center',
    },
    refreshText: {
        color: '#666',
    },
    retryButton: {
        padding: 10,
        backgroundColor: '#ff6b6b',
        borderRadius: 6,
        alignItems: 'center',
    },
    retryText: {
        color: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
});

export default AddMarker;