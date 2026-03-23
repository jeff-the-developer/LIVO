import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

function safeRun(fn: () => void): void {
    if (Platform.OS === 'web') return;
    try {
        fn();
    } catch {
        // Simulator or unsupported device
    }
}

/** Primary buttons, selectors, small taps */
export function hapticLight(): void {
    safeRun(() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    });
}

/** Slide-to-confirm threshold reached */
export function hapticMedium(): void {
    safeRun(() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    });
}

/** Money action succeeded (API) */
export function hapticSuccess(): void {
    safeRun(() => {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    });
}

/** Validation errors, failed API calls */
export function hapticWarning(): void {
    safeRun(() => {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    });
}
