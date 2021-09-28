/**
 * External Dependencies
 */
import { View } from 'react-native';
import { concat } from 'lodash';

/**
 * WordPress dependencies
 */
import {
	store as blockEditorStore,
	BlockIcon,
	MediaPlaceholder,
	useBlockProps,
	__experimentalUseInnerBlocksProps as useInnerBlocksProps,
} from '@wordpress/block-editor';
import { createBlock } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { useState, useEffect, useMemo } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import { useResizeObserver } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import { ALLOWED_MEDIA_TYPES } from './constants';
import { icon } from '.';
import styles from './styles.scss';
import TiledGallerySettings from './settings';

const TILE_SPACING = 8;
const DEFAULT_COLUMNS = 1;

export function defaultColumnsNumber( images ) {
	return Math.min( 3, images.length );
}

const TiledGalleryEdit = props => {
	const [ resizeObserver, sizes ] = useResizeObserver();
	const [ maxWidth, setMaxWidth ] = useState( 0 );

	const { className, clientId, noticeUI, onFocus, setAttributes, attributes: { linkTo, columns, roundedCorners } } = props;

	const { replaceInnerBlocks, updateBlockAttributes } = useDispatch( blockEditorStore );

	useEffect( () => {
		const { width } = sizes || {};
		if ( width ) {
			setMaxWidth( width );

			if ( columns ) {
				const columnWidths = new Array( columns ).fill( Math.floor( width / columns ) );
				setAttributes({ columnWidths });
			} else {
				setAttributes({ columnWidths: [] })
			}
		}
	}, [ sizes, columns ] );

	const innerBlockImages = useSelect(
		select => {
			return select( blockEditorStore ).getBlock( clientId )?.innerBlocks;
		},
		[ clientId ]
	);

	const images = useMemo(
		() =>
			innerBlockImages?.map( block => ( {
				clientId: block.clientId,
				id: block.attributes.id,
				url: block.attributes.url,
				attributes: block.attributes,
				fromSavedContent: Boolean( block.originalContent ),
			} ) ),
		[ innerBlockImages ]
	);

	useEffect( () => {
		images?.forEach( newImage => {
			updateBlockAttributes( newImage.clientId, {
				...newImage.attributes,
				id: newImage.id,
			} );
		} );
		
		const newIds = images?.map(image => image.id);
		setAttributes({ ids: newIds });
	}, [ images ] );

	useEffect( () => {
		if ( ! columns ) {
			setAttributes( { columns: DEFAULT_COLUMNS });
		}
	}, [ images ] );

	const onSelectImages = imgs => {
		const newBlocks = imgs.map( image => {
			return createBlock( 'core/image', {
				id: image.id,
				url: image.url,
				caption: image.caption,
				alt: image.alt,
			} );
		} );

		replaceInnerBlocks( clientId, concat( innerBlockImages, newBlocks ) );
	};

	const innerBlocksProps = useInnerBlocksProps(
		{},
		{
			contentResizeMode: 'stretch',
			allowedBlocks: [ 'core/image' ],
			orientation: 'horizontal',
			renderAppender: false,
			numColumns: 3,
			marginHorizontal: TILE_SPACING,
			marginVertical: TILE_SPACING,
			__experimentalLayout: { type: 'default', alignments: [] },
			gridProperties: {
				numColumns: 3,
			},
			parentWidth: maxWidth + 2 * TILE_SPACING,
		}
	);

	const mediaPlaceholder = (
		<MediaPlaceholder
			isAppender={ images.length > 0 }
			icon={ <BlockIcon icon={ icon } /> }
			className={ className }
			labels={ {
				title: __( 'Tiled Gallery', 'jetpack' ),
				name: __( 'images', 'jetpack' ),
			} }
			onSelect={ onSelectImages }
			accept="image/*"
			allowedTypes={ ALLOWED_MEDIA_TYPES }
			multiple
			notices={ noticeUI }
			onFocus={ onFocus }
			onError={ '' }
		/>
	);

	const blockProps = useBlockProps( {
		className: className,
	} );

	return (
		<View blockProps={ blockProps }>
			{ resizeObserver }
			<TiledGallerySettings
				setAttributes={ props.setAttributes }
				linkTo={ linkTo }
				columns={ columns }
				roundedCorners={ roundedCorners }
			/>
			<View { ...innerBlocksProps } />
			<View style={ [ styles.galleryAppender ] }>{ mediaPlaceholder }</View>
		</View>
	);
};

export default TiledGalleryEdit;
