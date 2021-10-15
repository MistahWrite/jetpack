/**
 * Publicize sharing form component.
 *
 * Displays text area and connection list to allow user
 * to select connections to share to and write a custom
 * sharing message.
 */

/**
 * External dependencies
 */
import { useEffect, useState } from 'react';

/**
 * WordPress dependencies
 */
import { PanelRow } from '@wordpress/components';
import { Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import PublicizeConnection from '../connection';
import PublicizeSettingsButton from '../settings-button';
import MessageBoxControl from '../message-box-control';
import useSocialMediaConnections from '../../hooks/use-social-media-connections';
import useSocialMediaMessage from '../../hooks/use-social-media-message';

<<<<<<< HEAD
export default function PublicizeForm( { isPublicizeEnabled, isRePublicizeFeatureEnabled } ) {
	const { connections, toggleById, hasConnections } = useSocialMediaConnections();
=======
export default function PublicizeForm() {
<<<<<<< HEAD
	const { connections, toggleById, refresh } = useSocialMediaConnections();
>>>>>>> d28ddc734c ([not verified] Refresh connections on change)
=======
	const { connections, toggleById } = useSocialMediaConnections();
>>>>>>> eca1ee6b47 ([not verified] Trigger state change when connections change)
	const { message, updateMessage, maxLength } = useSocialMediaMessage();
	const [ activeConnections, setActiveConnections ] = useState( {} );

	function isDisabled() {
		return connections.every( connection => ! connection.toggleable );
	}

	useEffect( () => {
		setActiveConnections( connections );
	}, [ connections ] );

	return (
		<Fragment>
<<<<<<< HEAD
			{ hasConnections && (
				<PanelRow>
					<ul className="jetpack-publicize__connections-list">
						{ connections.map(
							( { display_name, enabled, id, service_name, toggleable, profile_picture } ) => (
								<PublicizeConnection
									disabled={ isRePublicizeFeatureEnabled ? ! isPublicizeEnabled : ! toggleable }
=======
			<PanelRow>
				<ul className="jetpack-publicize__connections-list">
					{ activeConnections.length > 0 &&
						activeConnections.map(
							( { display_name, enabled, id, service_name, toggleable, profile_picture } ) => (
								<PublicizeConnection
									disabled={ ! toggleable }
>>>>>>> eca1ee6b47 ([not verified] Trigger state change when connections change)
									enabled={ enabled }
									key={ id }
									id={ id }
									label={ display_name }
									name={ service_name }
									toggleConnection={ toggleById }
									profilePicture={ profile_picture }
								/>
							)
						) }
<<<<<<< HEAD
					</ul>
				</PanelRow>
			) }
=======
				</ul>
			</PanelRow>
>>>>>>> eca1ee6b47 ([not verified] Trigger state change when connections change)

			<PublicizeSettingsButton />

			{ connections.some( connection => connection.enabled ) && (
				<MessageBoxControl
					disabled={ isDisabled() }
					maxLength={ maxLength }
					onChange={ updateMessage }
					message={ message }
				/>
			) }
		</Fragment>
	);
}
