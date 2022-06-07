import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import ehPrimo from '../../functions/ehPrimo';
import colors from '../../colors';

import Button from '../../components/Button';

export default function GameScreen() {
    const navigation = useNavigation();

    const [gameOn, setGameOn] = useState(false);
    const [number, setNumber] = useState(0);
    const [result, setResult] = useState(false);
    const [points, setPoints] = useState(0);
    const [record, setRecord] = useState(0);

    function generateNewNum(min, max) {
        let num;
        if (min < 0) min = 0;

        do {
            num = Math.floor(Math.random() * (Number(max) + 1 - Number(min)) + Number(min));
        } while (num % 2 == 0 || num % 5 == 0);

        setNumber(num);
        if (ehPrimo(num)) setResult(true);
        else setResult(false);
    }

    function verify(answer) {
        if (answer == result) {
            setPoints(points + 1);
            generateNewNum(10, 500);
        } else {
            if (points > record) {
                Alert.alert(
                    "Parabéns! 🤩",
                    "Você tem um novo recorde."
                );
                updateRecord(points);
            } else {
                Alert.alert(
                    "Você errou 🥺",
                    "Tente novamente!"
                );
            }
            setPoints(0);
            setGameOn(false);
        }
    }

    function resetRecord() {
        Alert.alert(
            'Modo reset',
            'Deseja apagar seu recorde atual?',
            [
                {
                    text: 'Sim',
                    onPress: () => {
                        updateRecord(0);
                        console.log('Recorde resetado');
                        Alert.alert(
                            "Reset executado",
                            "Você zerou seu recorde"
                        );
                    }
                },
                {
                    text: 'Não',
                    onPress: () => console.log('Reset cancelado'),
                    style: 'destructive'
                },
            ]
        );
    }

    async function updateRecord(newRecord) {
        try {
            await AsyncStorage.setItem('@Game_Record', newRecord.toString());
        } catch (error) {
            console.log("Erro ao gravar recorde com AsyncStorage");
        }
        setRecord(newRecord);
    }

    async function readRecord() {
        try {
            let response = await AsyncStorage.getItem('@Game_Record');
            if (response == null) response = 0;
            setRecord(Number(response));
        } catch (error) {
            console.log("Erro ao recuperar recorde com AsyncStorage");
        }
    }
    
    useEffect(() => {
        readRecord();
    }, []);

    return (
        <View style={styles.container}>
            {
                gameOn ? (
                    <>
                        <Text style={[styles.text, { fontSize: 40 }]}>{number} eh primo?</Text>
                        <Text style={styles.text}>
                            {points == 0 ? "Você ainda não fez pontos" : `Você fez ${points} ${points == 1 ? "ponto": "pontos"}`}
                        </Text>

                        <View style={styles.answerGroup}>
                            <Button
                                style={[styles.answerButton, { backgroundColor: colors.lightPurple }]}
                                textStyle={{ color: colors.darkPurple }}
                                onPressOut={() => verify(false)}
                            >Não</Button>

                            <Button
                                style={[styles.answerButton, { backgroundColor: colors.darkPurple }]}
                                textStyle={{ color: colors.white }}
                                onPressOut={() => verify(true)}
                            >Sim</Button>
                        </View>
                    </>
                ) : (
                    <>
                        {
                            record == 0 ?
                                <Text style={[styles.text, { fontSize: 40 }]}>
                                    EhPrimo Play
                                </Text>
                                :
                                <>
                                    <Text style={styles.text}>Seu record atual é de</Text>
                                    <Text style={[styles.text, { fontSize: 40 }]}>{record} pontos</Text>
                                </>
                        }
                        <Text style={[styles.text, { fontSize: 16, marginBottom: 20, color: colors.purple }]}>
                            👇 Clique para jogar 👇
                        </Text>

                        <Button
                            style={{ marginTop: 10 }}
                            onLongPress={resetRecord}
                            delayLongPress={4000}
                            onPress={() => {
                                generateNewNum(10, 500);
                                setGameOn(true);
                            }}
                        >Jogar</Button>

                        <Button
                            style={{ backgroundColor: colors.lightPurple, marginTop: 10 }}
                            textStyle={{ color: colors.darkPurple }}
                            onPressOut={() => navigation.goBack()}
                        >Voltar</Button>
                    </>
                )
            }
        </View >
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
        padding: 30,
        justifyContent: 'center',
        alignItems: 'stretch',
    },

    text: {
        color: colors.darkPurple,
        fontSize: 20,
        textAlign: 'center',
    },

    answerGroup: {
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    answerButton: {
        width: '48%',
    },
});