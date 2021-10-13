/**
 * Internal dependencies
 */
import getJetpackExtensionAvailability from '../../../../shared/get-jetpack-extension-availability';
import { isUpgradable } from '../../../../shared/plan-utils';

const republicizeFeatureName = 'republicize';

export default function usePublicizeConfig() {
	const { available } = getJetpackExtensionAvailability( republicizeFeatureName );

	return {
		isRePublicizeFeatureEnabled: !! window?.Jetpack_Editor_Initial_State.jetpack
			?.republicize_enabled,
		isRePublicizeFeatureAvailable: available,
		isRePublicizeFeatureUpgradable: isUpgradable( republicizeFeatureName ),
	};
}
