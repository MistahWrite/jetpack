/**
 * Publicize sharing panel component.
 *
 * Displays Publicize notifications if no
 * services are connected or displays form if
 * services are connected.
 */

/**
 * External dependencies
 */
import classNames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { PanelBody, PanelRow, ToggleControl, Button } from '@wordpress/components';
import { useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import PublicizeConnectionVerify from '../connection-verify';
import PublicizeForm from '../form';
import PublicizeTwitterOptions from '../twitter/options';
import useSelectSocialMediaConnections from '../../hooks/use-social-media-connections';
import { usePostJustPublished } from '../../hooks/use-saving-post';
import usePublicizeConfig from '../../hooks/use-publicize-config';
import { getRequiredPlan } from '../../../../shared/plan-utils';
import useUpgradeFlow from '../../../../shared/use-upgrade-flow';

const PublicizePanel = ( { prePublish } ) => {
	const { refresh, hasConnections, hasEnabledConnections } = useSelectSocialMediaConnections();

	// Store the enable/disable state of the sharing feature.
	const [ isSharingEnabled, setIsSharingEnabled ] = useState( false );

	/*
	 * Check whether the Republicize feature is enabled.
	 * it can be defined via the `jetpack_block_editor_republicize_feature` backend filter.
	 */
	const { isRePublicizeFeatureEnabled, isRePublicizeFeatureUpgradable } = usePublicizeConfig();

	// Refresh connections when the post is just published.
	usePostJustPublished(
		function () {
			if ( ! hasEnabledConnections ) {
				return;
			}

			refresh();
		},
		[ hasEnabledConnections, refresh ]
	);

	const requiredPlan = getRequiredPlan( 'republicize' );

	const [ checkoutUrl, goToCheckoutPage, isRedirecting ] = useUpgradeFlow( requiredPlan );

	return (
		<PanelBody title={ __( 'Share this post', 'jetpack' ) }>
			<div>
				{ __( "Connect and select the accounts where you'd like to share your post.", 'jetpack' ) }
			</div>

			{ isRePublicizeFeatureEnabled && isRePublicizeFeatureUpgradable && (
				<div className="jetpack-publicize__upsell">
					<div className="jetpack-publicize__upsell-description">
						{ __(
							'To re-publicize and schedule a post, you need to upgrade to the Personal Plan',
							'jetpack'
						) }
					</div>

					<Button
						href={ isRedirecting ? null : checkoutUrl } // Only for server-side rendering, since onClick doesn't work there.
						onClick={ goToCheckoutPage }
						target="_top"
						className={ classNames( 'jetpack-publicize__upsell-button is-primary', {
							'jetpack-upgrade-plan__hidden': ! checkoutUrl,
						} ) }
						isBusy={ isRedirecting }
					>
						{ isRedirecting ? __( 'Redirecting…', 'jetpack' ) : __( 'Upgrade now', 'jetpack' ) }
					</Button>
				</div>
			) }

			{ isRePublicizeFeatureEnabled && (
				<PanelRow>
					<ToggleControl
						label={
							isSharingEnabled
								? __( 'Sharing is enabled', 'jetpack' )
								: __( 'Sharing is disabled', 'jetpack' )
						}
						onChange={ setIsSharingEnabled }
						checked={ isSharingEnabled }
						disabled={ ! hasConnections }
					/>
				</PanelRow>
			) }

			<PublicizeConnectionVerify />
			<PublicizeForm />
			<PublicizeTwitterOptions prePublish={ prePublish } />
		</PanelBody>
	);
};

export default PublicizePanel;
