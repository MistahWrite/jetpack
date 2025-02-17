/**
 * External dependencies
 */
import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Button, Dashicon } from '@wordpress/components';
import { compose } from '@wordpress/compose';
import { withSelect, withDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { Spinner } from '@automattic/jetpack-components';

/**
 * Internal dependencies
 */
import { STORE_ID } from '../../state/store';
import extractHostname from '../../tools/extract-hostname';

/**
 * The "migrate" card.
 *
 * @param {object} props - The properties.
 * @param {string} props.wpcomHomeUrl - The original site URL.
 * @param {string} props.currentUrl - The current site URL.
 * @param {boolean} props.isActionInProgress - Whether there's already an action in progress.
 * @param {Function} props.setIsActionInProgress - Function to set the "action in progress" flag.
 * @returns {React.Component} The `ConnectScreen` component.
 */
const CardFresh = props => {
	const wpcomHostName = extractHostname( props.wpcomHomeUrl );
	const currentHostName = extractHostname( props.currentUrl );
	const { isActionInProgress, setIsActionInProgress } = props;

	const buttonLabel = __( 'Create a fresh connection', 'jetpack' );

	const [ isStartingFresh, setIsStartingFresh ] = useState( false );

	/**
	 * Initiate the migration.
	 * Placeholder for now.
	 *
	 * @todo Add the actual migration functionality.
	 */
	const doStartFresh = useCallback( () => {
		if ( ! isActionInProgress ) {
			setIsActionInProgress( true );
			setIsStartingFresh( true );

			setTimeout( () => {
				setIsActionInProgress( false );
				setIsStartingFresh( false );
			}, 3000 );
		}
	}, [ setIsStartingFresh, isActionInProgress, setIsActionInProgress ] );

	return (
		<div className="jp-idc-card-action-base">
			<div className="jp-idc-card-action-top">
				<h4>{ __( 'Treat each site as independent sites', 'jetpack' ) }</h4>

				<p>
					{ createInterpolateElement(
						sprintf(
							/* translators: %1$s: The current site domain name. %2$s: The original site domain name. */
							__(
								'<hostname>%1$s</hostname> settings, stats, and subscribers will start fresh. <hostname>%2$s</hostname> will keep its data as is.',
								'jetpack'
							),
							currentHostName,
							wpcomHostName
						),
						{
							hostname: <strong />,
						}
					) }
				</p>
			</div>

			<div className="jp-idc-card-action-bottom">
				<div className="jp-idc-card-action-sitename">{ wpcomHostName }</div>
				<Dashicon icon="minus" className="jp-idc-card-action-separator" />
				<div className="jp-idc-card-action-sitename">{ currentHostName }</div>

				<Button
					className="jp-idc-card-action-button"
					label={ buttonLabel }
					onClick={ doStartFresh }
					disabled={ isActionInProgress }
				>
					{ isStartingFresh ? <Spinner /> : buttonLabel }
				</Button>
			</div>
		</div>
	);
};

CardFresh.propTypes = {
	wpcomHomeUrl: PropTypes.string.isRequired,
	currentUrl: PropTypes.string.isRequired,
	isActionInProgress: PropTypes.bool,
	setIsActionInProgress: PropTypes.func.isRequired,
};

export default compose( [
	withSelect( select => {
		return {
			isActionInProgress: select( STORE_ID ).getIsActionInProgress(),
		};
	} ),
	withDispatch( dispatch => {
		return {
			setIsActionInProgress: dispatch( STORE_ID ).setIsActionInProgress,
		};
	} ),
] )( CardFresh );
