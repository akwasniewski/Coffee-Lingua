import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import {
	collection,
	doc,
	getDoc,
	getDocs,
	updateDoc,
} from 'firebase/firestore';
import { db } from '../Database/firebase';
import { userEmailGlobal } from '../App';
import { languageGlobal } from '../App';
import {
	RefreshControl,
	View,
	StyleSheet,
	Text,
	FlatList,
	TouchableOpacity,
	Alert,
	Modal,
	Image,
} from 'react-native';
import flags from '../assets/flags/getFlags';
import Icon from 'react-native-vector-icons/Feather';
import Stats from './Stats';
const wait = (timeout) => {
	return new Promise((resolve) => setTimeout(resolve, timeout));
};
const Item = ({ deckName, cardCount, mastery, navigation }) => (
	<TouchableOpacity
		onPress={() => {
			navigation.navigate('DeckOverview', {
				deckName: deckName,
				cardCount: cardCount,
				mastery: mastery,
			});
		}}>
		<View style={styles.item}>
			<View style={styles.info}>
				<Text style={styles.title}>{deckName}</Text>
				<Text>Cards: {cardCount}</Text>
			</View>
			<View style={styles.controls}>
				<TouchableOpacity
					style={styles.learnButton}
					onPress={() => {
						if (cardCount > 1) {
							navigation.navigate('Learn', {
								deckName: deckName,
							});
						} else {
							Alert.alert(
								'Not enough cards',
								'Your deck has to have at least 2 cards to use learn functionality',
								[
									{
										text: 'Ok',
										style: 'cancel',
									},
								]
							);
						}
					}}>
					<Text style={styles.learn}>Learn</Text>
					<Icon name='play' size={30} color='white' />
				</TouchableOpacity>
			</View>
		</View>
	</TouchableOpacity>
);

const Scrollable = (props) => {
	const [languageSelectModal, setLanguageSelectModal] = React.useState(false);
	const navigation = props.navigation;
	const [refreshing, setRefreshing] = React.useState(false);
	React.useLayoutEffect(() => {
		navigation.setOptions({
			headerRight: () => (
				<TouchableOpacity onPress={() => navigation.navigate('Settings')}>
					<Icon name='settings' size={30} color='white' />
				</TouchableOpacity>
			),
		});
	}, [navigation]);
	const Refresh = () => {
		setRefreshing(true);
		props.FetchData();
		wait(1000).then(() => setRefreshing(false));
	};
	const renderItem = ({ item }) => (
		<Item
			deckName={item.deckName}
			cardCount={item.cardCount}
			mastery={item.mastery}
			navigation={navigation}
		/>
	);
	const RenderLanguage = ({ item }) => {
		return (
			<TouchableOpacity
				onPress={async () => {
					await updateDoc(doc(db, 'users/' + userEmailGlobal), {
						lastLanguage: item.name,
					});
					props.setLanguage(item.name);
				}}>
				<View style={styles.langItem}>
					<View style={styles.bannerShadow}>
						<Image style={styles.flag} source={flags[item.flagId].src} />
					</View>

					<Text style={styles.learn}>{item.name}</Text>
				</View>
			</TouchableOpacity>
		);
	};
	const AddLangButton = () => {
		return (
			<TouchableOpacity
				style={styles.learnButton}
				onPress={() => {
					navigation.navigate('AddAnotherLanguage');
				}}>
				<View style={styles.modalContainer}>
					<Text style={styles.learn}>Add Another Language</Text>
				</View>
			</TouchableOpacity>
		);
	};
	const CallStats = () => {
		return (
			<Stats
				flagId={props.flagId}
				bannerMode={props.bannerMode}
				cardCount={props.cardCount}
				mastery={props.mastery}
				navigation={navigation}
				setLanguageSelectModal={() => setLanguageSelectModal(true)}
			/>
		);
	};
	const LanguageSelect = () => {
		return (
			<View>
				<View style={styles.modalUtil}>
					{/*currently it is juest invisible x for better spacing, fix it */}
					<TouchableOpacity onPress={() => setLanguageSelectModal(false)}>
						<Icon name='x-circle' size={30} color='#FF8DA1' />
					</TouchableOpacity>
					<Text>Choose Language</Text>
					<Icon name='x-circle' size={30} color='white' />
				</View>
				<View style={styles.langList}>
					<FlatList
						data={props.langs}
						renderItem={RenderLanguage}
						keyExtractor={(item) => item.id}
					/>
				</View>
				<AddLangButton />
			</View>
		);
	};
	return (
		<View style={styles.container}>
			<Modal
				animationType='fade'
				transparent={true}
				visible={languageSelectModal}
				onRequestClose={() => {
					Alert.alert('Modal has been closed.');
					setLanguageSelectModal(!languageSelectModal);
				}}>
				<View style={styles.modalContainer}>
					<View style={styles.modalView}>
						<LanguageSelect />
					</View>
				</View>
			</Modal>
			<FlatList
				ListHeaderComponent={CallStats}
				data={props.decks}
				renderItem={renderItem}
				keyExtractor={(item) => item.id}
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={Refresh} />
				}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	modalContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	langList: {
		maxHeight: 400,
	},
	langItem: {
		backgroundColor: '#3d475e',
		padding: 20,
		marginVertical: 8,
		marginHorizontal: 16,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		borderRadius: 10,
	},
	item: {
		backgroundColor: '#d3d3d3',
		padding: 20,
		marginVertical: 8,
		marginHorizontal: 16,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		borderRadius: 10,
	},

	info: {
		width: '50%',
	},
	learnButton: {
		flexDirection: 'row',
		padding: 10,
		backgroundColor: '#FF8DA1',
		marginTop: 15,
		alignItems: 'center',
		borderRadius: 10,
	},
	modalView: {
		width: '90%',
		margin: 20,
		backgroundColor: 'white',
		borderRadius: 20,
		padding: 10,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
	},
	learn: {
		color: 'white',
		fontSize: 25,
		textAlign: 'center',
	},
	flag: {
		height: 73,
		width: 110,
	},
	bannerShadow: {
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 4,
	},
	title: {
		fontSize: 25,
	},
	controls: {
		padding: 10,
		alignItems: 'center',
		width: '50%',
	},
	modalUtil: {
		borderBottomWidth: 3,
		paddingBottom: 5,
		borderBottomColor: '#f2f2f2',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
});

export default Scrollable;
