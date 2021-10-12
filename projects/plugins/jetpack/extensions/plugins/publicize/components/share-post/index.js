/**
 * WordPress dependencies
 */
import { Button, PanelRow } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { useDispatch, useSelect } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
import { store as editorStore } from '@wordpress/editor';

/**
 * Internal dependencies
 */
import { useSharePost } from '../../hooks/use-share-post';
import useSocialMediaConnections from '../../hooks/use-social-media-connections';
import usePublicizeConfig from '../../hooks/use-publicize-config';

export function SharePostButton( { isSharingEnabled } ) {
	const { createErrorNotice, removeNotice, createSuccessNotice } = useDispatch( noticesStore );
	const { savePost } = useDispatch( editorStore );
	const [ isSharing, setIsSharing ] = useState( false );
	const { hasEnabledConnections } = useSocialMediaConnections();
	const isPostPublished = useSelect( select => select( editorStore ).isCurrentPostPublished(), [] );
	const shouldSavePost = useSelect( select => select( editorStore ).isEditedPostDirty(), [] );

	const onPostShareHander = useSharePost( function ( error, results ) {
		if ( error ) {
			createErrorNotice( error.message, {
				id: 'publicize-post-share-message',
			} );
		} else if ( results.shared?.length ) {
			createSuccessNotice( __( 'Post shared', 'jetpack' ), {
				id: 'publicize-post-share-message',
				type: 'snackbar',
				actions: results.shared.map( ( { url } ) => ( { url, label: 'View' } ) ),
			} );
		}

		setIsSharing( false );
	} );

	/*
	 * Disabled button when
	 * - sharing is disabled
	 * - no enabled connections
	 * - post is not published
	 * - is sharing post
	 */
	const isButtonDisabled =
		! isSharingEnabled || ! hasEnabledConnections || ! isPostPublished || isSharing;

	return (
		<Button
			isSecondary
			onClick={ function () {
				if ( ! isPostPublished ) {
					return createErrorNotice(
						__( 'You must publish your post before you can share it.', 'jetpack' )
					);
				}

				setIsSharing( true );
				removeNotice( 'publicize-post-share-message' );

				// Should save post before sharing?
				if ( ! shouldSavePost ) {
					return onPostShareHander();
				}

				// Save post before sharing.
				savePost()
					.then( function () {
						onPostShareHander();
					} )
					.catch( function () {
						setIsSharing( false );
					} );
			} }
			disabled={ isButtonDisabled }
			isBusy={ isSharing }
		>
			{ __( 'Share post', 'jetpack' ) }
		</Button>
	);
}

export function SharePostRow( { isSharingEnabled } ) {
	const { isRePublicizeFeatureEnabled } = usePublicizeConfig();

	if ( ! isRePublicizeFeatureEnabled ) {
		return null;
	}

	return (
		<PanelRow>
			<SharePostButton isSharingEnabled={ isSharingEnabled } />
		</PanelRow>
	);
}
