import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '../Database/firebase';
import { userEmailGlobal } from '../App';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/Feather';
var borderColor = '#3D475E';
const LearnCard = (props) => {
	const Rate = (rate) => {
		const newCards = props.cards;
		for (const card of newCards) {
			if (card == props.curCard) {
				card.weight = rate;
				break;
			}
		}
		props.setCards(newCards);
		props.RandomCard();
		ChangeBorderColor();
	};
	const [cardState, setCardState] = React.useState(false);
	const ChangeBorderColor = () => {
		switch (props.curCard.weight) {
			case 1:
				borderColor = '#FFFD98';
				break;
			case 2:
				borderColor = '#C6EBBE';
				break;
			case 3:
				borderColor = '#FF8DA1';
				break;
		}
		console.log('');
	};
	const Front = () => {
		return (
			<View style={styles.container}>
				<View style={[styles.frontCard, { borderColor: borderColor }]}>
					<TouchableOpacity
						onPress={() => setCardState(true)}
						style={styles.frontButton}>
						<Text style={styles.frontText}>{props.curCard.front}</Text>
					</TouchableOpacity>
				</View>
			</View>
		);
	};
	React.useEffect(() => {
		ChangeBorderColor();
	}, []);
	const Back = () => {
		return (
			<View style={styles.container}>
				<View style={[styles.backCard, { borderColor: borderColor }]}>
					<View>
						<TouchableOpacity
							onPress={() => setCardState(false)}
							style={styles.backButton}>
							<Text style={styles.backText}>{props.curCard.back}</Text>
						</TouchableOpacity>
						<View style={styles.rating}>
							<View style={styles.but1}>
								<TouchableOpacity onPress={() => Rate(1)} style={styles.button}>
									<Icon name='frown' color={'000000'} size={26} />
								</TouchableOpacity>
							</View>
							<View style={styles.but2}>
								<TouchableOpacity onPress={() => Rate(2)} style={styles.button}>
									<Icon name='meh' color={'#000000'} size={26} />
								</TouchableOpacity>
							</View>
							<View style={styles.but3}>
								<TouchableOpacity onPress={() => Rate(3)} style={styles.button}>
									<Icon name='smile' color={'#000000'} size={26} />
								</TouchableOpacity>
							</View>
						</View>
					</View>
				</View>
			</View>
		);
	};
	if (cardState) return <Back />;
	else return <Front />;
};

export default LearnCard;
const styles = StyleSheet.create({
	container: {
		width: '100%',
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		padding: 20,
	},
	frontCard: {
		width: '100%',
		height: '100%',
		alignContent: 'center',
		justifyContent: 'center',
		borderRadius: 10,
		borderWidth: 4,
		backgroundColor: '#d3d3d3',
	},
	frontButton: {
		width: '100%',
		height: '100%',
		alignItems: 'center',
		justifyContent: 'center',
	},
	frontText: {
		textAlign: 'center',
		fontSize: 30,
	},
	backCard: {
		width: '100%',
		height: '100%',
		alignContent: 'center',
		justifyContent: 'center',
		borderRadius: 10,
		borderWidth: 4,
		backgroundColor: '#67B7D1',
	},
	backButton: {
		width: '100%',
		height: '85%',
		alignItems: 'center',
		justifyContent: 'center',
	},
	backText: {
		textAlign: 'center',
		fontSize: 30,
		color: 'white',
	},
	rating: {
		flexDirection: 'row',
		height: '15%',
		alignItems: 'center',
		justifyContent: 'center',
	},
	but1: {
		flex: 1,
		backgroundColor: '#FFFD98',
	},
	but2: {
		flex: 1,
		backgroundColor: '#C6EBBE',
	},
	but3: {
		flex: 1,
		backgroundColor: '#FF8DA1',
	},
	button: {
		height: '100%',
		width: '100%',
		justifyContent: 'center',
		alignItems: 'center',
	},
});