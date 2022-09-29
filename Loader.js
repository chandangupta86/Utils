import React from 'react';


import * as Colors from '@constants/Colors';
import * as Images from '@constants/Images';
import { ActivityIndicator, Image, Modal, StyleSheet, Text, View } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { useSelector } from 'react-redux';

const ActivityModal = () => {
	const appState = useSelector((state) => state.appState.appData);
	const activityModalState = useSelector((state) => state.appState.appData.ActivityModal);
	const { visible = false, loadingText = false, initialLoad = false, fullscreen = false, loadingLocations = false } = activityModalState;
	const { totalVenuesToLoad = 0, currentloadedVenues = 0 } = appState;
	let modalStyle = loadingText ? { minWidth: 250 } : { minWidth: 150 };

	if (initialLoad || fullscreen) {
		modalStyle = { width: '150%', height: '150%' };
	}

	return (
		<Modal animationType={'none'} presentationStyle={'overFullScreen'} transparent={true} visible={visible}>
			<View style={Styles.mainContainer}>
				<View style={[Styles.contentContainer, modalStyle]}>
					{initialLoad && <Image style={Styles.logo} source={Images.Logo} />}
					<ActivityIndicator size={'large'} color={Colors.primaryBlue} animating={visible} hidesWhenStopped={true} />
					{loadingText && !loadingLocations ? <Text style={[Styles.loadingTextLabel]}>{loadingText}</Text> : null}

					{/*Loading Text for Live Locations*/}
					{loadingLocations ? (
						<Text style={[Styles.loadingTextLabel]}>
							{loadingText} ({currentloadedVenues}/{totalVenuesToLoad})
						</Text>
					) : null}
				</View>
			</View>
		</Modal>
	);
};

const Styles = StyleSheet.create({
	mainContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(0, 0, 0, 0.6)'
	},
	contentContainer: {
		justifyContent: 'center',
		alignItems: 'center',
		minHeight: 80,
		margin: 24,
		padding: 10,
		backgroundColor: 'rgba(242, 243, 245, 1)'
	},
	logo: {
		resizeMode: 'contain',
		marginBottom: '10%',
		width: DeviceInfo.isTablet() ? '80%' : '50%'
	},
	loadingTextLabel: {
		marginBottom: 20,
		color: 'black',
		fontSize: 16
	}
});

export default ActivityModal;
