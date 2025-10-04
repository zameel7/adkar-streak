import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';
import { Dimensions } from 'react-native';

export type Adkar = {
    title: string;
    adkar: string[];
    translation: string[];
    repeat: string;
    repeatCount: number;
};

export const useAdkarLogic = (adkarData: any, type: 'morning' | 'evening') => {
    const width = Dimensions.get("window").width;

    const [adkars, setAdkars] = useState<Adkar[]>([]);
    const [counter, setCounter] = useState(1);
    const [index, setIndex] = useState<number>(0);
    const [height, setHeight] = useState<number>(width * 3);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const carouselRef = useRef(null);
    const scrollViewRef = useRef(null);

    // Load adkar data from JSON
    useEffect(() => {
        const adkarsArray: Adkar[] = Object.keys(adkarData).map((key) => {
            const data = adkarData[key as keyof typeof adkarData];
            return {
                title: data.title,
                adkar: data.adkar,
                translation: data.translation,
                repeat: data.repeat,
                repeatCount: data.repeatCount,
            };
        });

        let firstAdkarHeight = 800;
        if (adkarsArray[0]) {
            for (const adkar of adkarsArray[0].adkar) {
                firstAdkarHeight += Math.max(adkar.length * 1.2, 100);
            }
            for (const translation of adkarsArray[0].translation) {
                firstAdkarHeight += Math.max(translation.length * 0.8, 80);
            }
        }
        const calculatedHeight = Math.max(firstAdkarHeight + 300, 900);
        setHeight(calculatedHeight);
        setAdkars(adkarsArray);
    }, []);

    // Update counter and height when index changes
    useEffect(() => {
        if (adkars && typeof index === 'number' && adkars[index]) {
            setCounter(adkars[index].repeatCount);
        }

        let height = 800;
        if (adkars && typeof index === 'number' && adkars[index]) {
            for (const adkar of adkars[index].adkar) {
                height += Math.max(adkar.length * 1.2, 100);
            }
            for (const translation of adkars[index].translation) {
                height += Math.max(translation.length * 0.8, 80);
            }
            const newHeight = Math.max(height + 300, 900);
            setHeight(newHeight);
        }
    }, [index, adkars.length]);

    // Navigation handlers
    const handleNext = () => {
        if (carouselRef.current) {
            // @ts-ignore
            carouselRef.current.next();
            if (scrollViewRef.current) {
                // @ts-ignore
                scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: true });
            }
        }
    };

    const handlePrev = () => {
        if (carouselRef.current) {
            // @ts-ignore
            carouselRef.current.prev();
            if (scrollViewRef.current) {
                // @ts-ignore
                scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: true });
            }
        }
    };

    // Auto-completion handler
    const handleAdkarCompleted = async () => {
        setTimeout(() => {
            handleNext();
        }, 500);
    };

    // Counter button handler
    const handleCounterPress = async () => {
        if (counter === 1) {
            try {
                const streakData = await AsyncStorage.getItem("streakData");
                if (streakData) {
                    const data = JSON.parse(streakData);
                    data[type] = {
                        ...data[type],
                        [index]: true,
                    };
                    await AsyncStorage.setItem("streakData", JSON.stringify(data));
                    setRefreshTrigger(prev => prev + 1);
                }
            } catch (error) {
                console.error(`Error auto-marking ${type} as read`, error);
            }
            handleNext();
        } else {
            setCounter(counter - 1);
        }
    };

    // Carousel snap handler
    const handleSnapToItem = (newIndex: number) => {
        setIndex(newIndex);
    };

    return {
        // State
        adkars,
        counter,
        index,
        height,
        refreshTrigger,

        // Refs
        carouselRef,
        scrollViewRef,

        // Handlers
        handleNext,
        handlePrev,
        handleAdkarCompleted,
        handleCounterPress,
        handleSnapToItem,
        setIndex,
    };
};