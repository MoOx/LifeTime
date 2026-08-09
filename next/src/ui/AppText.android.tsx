/**
 * Android: a real Jetpack Compose `Text`, styled with a Material 3 type-scale token.
 *
 * `typography` resolves against `MaterialTheme.typography`, so the font, its weight and
 * the device font-scale setting all come from the platform — which is precisely what v1
 * could not do while replaying the iOS ramp through a hand-maintained
 * `sans-serif-*`-per-OEM mapping table.
 *
 * Colours come from `useMaterialColors()`, which on Android 12+ returns the user's
 * wallpaper-derived Material You palette.
 *
 * Must be rendered inside a `<Section>` (an `@expo/ui` `Host`).
 */

import { Text, useMaterialColors } from '@expo/ui/jetpack-compose'

import type { AppTextProps } from './AppText.types'
import { TYPE_SCALE } from './theme/type'

export function AppText({
  role = 'body',
  tone = 'primary',
  numberOfLines,
  children,
}: AppTextProps) {
  const materialColors = useMaterialColors()
  const color =
    tone === 'primary' ? materialColors.onSurface : materialColors.onSurfaceVariant

  return (
    <Text
      color={color}
      style={{ typography: TYPE_SCALE[role].android }}
      maxLines={numberOfLines}
      overflow={numberOfLines === undefined ? undefined : 'ellipsis'}>
      {children}
    </Text>
  )
}
