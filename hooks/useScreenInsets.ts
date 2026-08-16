import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Spacing } from "@/constants/theme";

export function useScreenInsets() {
    const insets = useSafeAreaInsets();
    const headerHeight = useHeaderHeight();

    let tabBarHeight = 0;
    try {
        // This hook throws if used outside a Bottom Tab Navigator
        tabBarHeight = useBottomTabBarHeight();
    } catch {
        // Fallback for screens that are not inside a bottom tab navigator (e.g. modals)
        tabBarHeight = 0;
    }

    return {
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: tabBarHeight + Spacing.xl,
        scrollInsetBottom: insets.bottom + 16,
    };
}
