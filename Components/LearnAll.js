import React from 'react';
import { View, Text, StyleSheet, FlatList, Alert, Modal } from 'react-native';
import {
	collection,
	doc,
	getDoc,
	getDocs,
	increment,
} from 'firebase/firestore';
import { db } from '../Database/firebase';
import { userEmailGlobal } from '../App';
import { updateDoc } from 'firebase/firestore';
import LearnCard from './LearnCard';
import { languageGlobal } from '../App';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useIsFocused } from '@react-navigation/native';
import Loading from './Loading';
const getRandomInt = (max) => {
	return Math.floor(Math.random() * max);
};
var cardsGlobal = [];
const newCards = [];
var decksProcessed = 0;
const LearnAll = (props) => {
	const route = props.route;
	const navigation = props.navigation;
	const decks = props.decks;
	const [cards, setCards] = React.useState();
	const [curCard, setCurCard] = React.useState();
	React.useLayoutEffect(() => {
		navigation.setOptions({
			headerTitle: languageGlobal,
			gestureEnabled: false,
			headerLeft: () => (
				<TouchableOpacity onPress={Save}>
					<Text style={styles.saveButton}>Save</Text>
				</TouchableOpacity>
			),
		});
	}, [navigation]);
	const Save = async () => {
		if (!cardsGlobal) {
			console.log('nocards');
			navigation.goBack();
		}
		const newDecks = decks;
		var deckMastery = 0;
		var cardsProcessed = 0;
		cardsGlobal.forEach(async (card) => {
			if (card.weight != card.oldWeight) {
				await updateDoc(
					doc(
						db,
						'users/' +
							userEmailGlobal +
							'/languages/' +
							languageGlobal +
							'/decks/' +
							card.deckName +
							'/cards/' +
							card.id
					),
					{ weight: card.weight }
				);
				var masteryChange = 0;
				const cardDeck = newDecks.find((x) => x.deckName == card.deckName);
				if (card.oldWeight != 0) masteryChange = card.weight - card.oldWeight;
				else masteryChange = card.weight - 1;
				cardDeck.mastery += masteryChange;
				if (masteryChange != 0) cardDeck.hasChanged = true;
			}
			cardsProcessed += 1;
			// not elegant indeed but works
			// TODO: make it nice and async
			if (cardsProcessed == cardsGlobal.length) {
				newDecks.forEach(async (newDeck) => {
					if (newDeck.hasChanged) {
						await updateDoc(
							doc(
								db,
								'users/' +
									userEmailGlobal +
									'/languages/' +
									languageGlobal +
									'/decks/' +
									newDeck.id
							),
							{ mastery: newDeck.mastery }
						);
					}
				});
				props.setDecks(newDecks);
				navigation.goBack();
			}
		});
	};
	const GetCardsFromDeck = async (deck) => {
		const snap = await getDocs(
			collection(
				db,
				'users/' +
					userEmailGlobal +
					'/languages/' +
					languageGlobal +
					'/decks/' +
					deck.id +
					'/cards'
			)
		);
		snap.forEach((doc) => {
			const data = doc.data();
			data.id = doc.id;
			data.oldWeight = data.weight;
			data.deckName = deck.id;
			newCards.push(data);
		});
		decksProcessed++;
		if (Number.isInteger(decksProcessed % decks.length)) {
			setCards(newCards);
		}
	};
	React.useEffect(async () => {
		//getting cards from the server
		decks.forEach((deck) => {
			console.log(deck.id);
			GetCardsFromDeck(deck);
		});
	}, []);
	React.useEffect(() => {
		RandomCard();
	}, [cards]);
	const RandomCard = () => {
		cardsGlobal = cards;
		var randomCard;
		var restrictedWeights = [];
		var success = false;
		var isCurCard = false;
		while (success == false) {
			//choosing random card
			if (!cards) {
				break;
			}
			const key = getRandomInt(40);
			var cardWeight = 0;
			if (key == 0) cardWeight = 3;
			else if (0 < key && key < 4) cardWeight = 2;
			else if (3 < key && key < 13) cardWeight = 1;
			if (!restrictedWeights.includes(cardWeight)) {
				const chooseFrom = [];
				cards.forEach((card) => {
					if (card.weight == cardWeight && card != curCard)
						chooseFrom.push(card);
				});
				if (chooseFrom.length != 0) {
					randomCard =
						chooseFrom[Math.floor(Math.random() * chooseFrom.length)];
					success = true;
				} else restrictedWeights.push(cardWeight);
			}
		}
		if (randomCard) {
			setCurCard(randomCard);
		}
	};
	const Output = () => {
		if (curCard) {
			return (
				<LearnCard
					curCard={curCard}
					cards={cards}
					setCards={(newCards) => setCards(newCards)}
					RandomCard={() => RandomCard()}
				/>
			);
		} else {
			return <Loading />;
		}
	};
	return <Output />;
};
const styles = StyleSheet.create({
	saveButton: {
		color: '#ffffff',
		fontSize: 20,
	},
});
export default LearnAll;