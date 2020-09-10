<?php
/**
 * Sets up the Connection REST API endpoints.
 *
 * @package automattic/jetpack-connection
 */

namespace Automattic\Jetpack\Connection;

use Automattic\Jetpack\Status;
use Automattic\Jetpack\Tracking;
use Jetpack_XMLRPC_Server;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

/**
 * Registers the REST routes for Connections.
 */
class REST_Connector {
	/**
	 * The Connection Manager.
	 *
	 * @var Manager
	 */
	private $connection;

	/**
	 * This property stores the localized "Insufficient Permissions" error message.
	 *
	 * @var string Generic error message when user is not allowed to perform an action.
	 */
	private static $user_permissions_error_msg;

	/**
	 * Constructor.
	 *
	 * @param Manager $connection The Connection Manager.
	 */
	public function __construct( Manager $connection ) {
		$this->connection = $connection;

		self::$user_permissions_error_msg = esc_html__(
			'You do not have the correct user permissions to perform this action.
			Please contact your site admin if you think this is a mistake.',
			'jetpack'
		);

		if ( ! $this->connection->is_active() ) {
			// Register a site.
			register_rest_route(
				'jetpack/v4',
				'/verify_registration',
				array(
					'methods'             => WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'verify_registration' ),
					'permission_callback' => '__return_true',
				)
			);
		}

		// Authorize a remote user.
		register_rest_route(
			'jetpack/v4',
			'/remote_authorize',
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => __CLASS__ . '::remote_authorize',
				'permission_callback' => '__return_true',
			)
		);

		// Get current connection status of Jetpack.
		register_rest_route(
			'jetpack/v4',
			'/connection',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => __CLASS__ . '::connection_status',
				'permission_callback' => '__return_true',
			)
		);

		// Get list of plugins that use the Jetpack connection.
		register_rest_route(
			'jetpack/v4',
			'/connection/plugins',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_connection_plugins' ),
				'permission_callback' => __CLASS__ . '::activate_plugins_permission_check',
			)
		);

		// Full or partial reconnect in case of connection issues.
		register_rest_route(
			'jetpack/v4',
			'/connection/reconnect',
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'connection_reconnect' ),
				'permission_callback' => __CLASS__ . '::jetpack_reconnect_permission_check',
			)
		);

		// Set the connection owner.
		register_rest_route(
			'jetpack/v4',
			'/connection/owner',
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'set_connection_owner' ),
				'permission_callback' => array( $this, 'set_connection_owner_permission_callback' ),
			)
		);
	}

	/**
	 * Handles verification that a site is registered.
	 *
	 * @since 5.4.0
	 *
	 * @param WP_REST_Request $request The request sent to the WP REST API.
	 *
	 * @return string|WP_Error
	 */
	public function verify_registration( WP_REST_Request $request ) {
		$registration_data = array( $request['secret_1'], $request['state'] );

		return $this->connection->handle_registration( $registration_data );
	}

	/**
	 * Handles verification that a site is registered
	 *
	 * @since 5.4.0
	 *
	 * @param WP_REST_Request $request The request sent to the WP REST API.
	 *
	 * @return array|wp-error
	 */
	public static function remote_authorize( $request ) {
		$xmlrpc_server = new Jetpack_XMLRPC_Server();
		$result        = $xmlrpc_server->remote_authorize( $request );

		if ( is_a( $result, 'IXR_Error' ) ) {
			$result = new WP_Error( $result->code, $result->message );
		}

		return $result;
	}

	/**
	 * Get connection status for this Jetpack site.
	 *
	 * @since 4.3.0
	 *
	 * @param bool $rest_response Should we return a rest response or a simple array. Default to rest response.
	 *
	 * @return WP_REST_Response|array Connection information.
	 */
	public static function connection_status( $rest_response = true ) {
		$status     = new Status();
		$connection = new Manager();

		$connection_status = array(
			'isActive'     => $connection->is_active(),
			'isStaging'    => $status->is_staging_site(),
			'isRegistered' => $connection->is_registered(),
			'offlineMode'  => array(
				'isActive'        => $status->is_offline_mode(),
				'constant'        => defined( 'JETPACK_DEV_DEBUG' ) && JETPACK_DEV_DEBUG,
				'url'             => $status->is_local_site(),
				/** This filter is documented in packages/status/src/class-status.php */
				'filter'          => ( apply_filters( 'jetpack_development_mode', false ) || apply_filters( 'jetpack_offline_mode', false ) ), // jetpack_development_mode is deprecated.
				'wpLocalConstant' => defined( 'WP_LOCAL_DEV' ) && WP_LOCAL_DEV,
			),
			'isPublic'     => '1' == get_option( 'blog_public' ), // phpcs:ignore WordPress.PHP.StrictComparisons.LooseComparison
		);

		if ( $rest_response ) {
			return rest_ensure_response(
				$connection_status
			);
		} else {
			return $connection_status;
		}
	}


	/**
	 * Get plugins connected to the Jetpack.
	 *
	 * @since 8.6.0
	 *
	 * @return WP_REST_Response|WP_Error Response or error object, depending on the request result.
	 */
	public function get_connection_plugins() {
		$plugins = $this->connection->get_connected_plugins();

		if ( is_wp_error( $plugins ) ) {
			return $plugins;
		}

		array_walk(
			$plugins,
			function( &$data, $slug ) {
				$data['slug'] = $slug;
			}
		);

		return rest_ensure_response( array_values( $plugins ) );
	}

	/**
	 * Verify that user can view Jetpack admin page and can activate plugins.
	 *
	 * @since 8.8.0
	 *
	 * @return bool|WP_Error Whether user has the capability 'activate_plugins'.
	 */
	public static function activate_plugins_permission_check() {
		if ( current_user_can( 'activate_plugins' ) ) {
			return true;
		}

		return new WP_Error( 'invalid_user_permission_activate_plugins', self::get_user_permissions_error_msg(), array( 'status' => rest_authorization_required_code() ) );
	}

	/**
	 * Verify that user is allowed to disconnect Jetpack.
	 *
	 * @since 8.8.0
	 *
	 * @return bool|WP_Error Whether user has the capability 'jetpack_disconnect'.
	 */
	public static function jetpack_reconnect_permission_check() {
		if ( current_user_can( 'jetpack_reconnect' ) ) {
			return true;
		}

		return new WP_Error( 'invalid_user_permission_jetpack_disconnect', self::get_user_permissions_error_msg(), array( 'status' => rest_authorization_required_code() ) );
	}

	/**
	 * Returns generic error message when user is not allowed to perform an action.
	 *
	 * @return string The error message.
	 */
	public static function get_user_permissions_error_msg() {
		return self::$user_permissions_error_msg;
	}

	/**
	 * The endpoint tried to partially or fully reconnect the website to WP.com.
	 *
	 * @since 8.8.0
	 *
	 * @return \WP_REST_Response|WP_Error
	 */
	public function connection_reconnect() {
		$response = array();

		$next = null;

		$result = $this->connection->restore();

		if ( is_wp_error( $result ) ) {
			$response = $result;
		} elseif ( is_string( $result ) ) {
			$next = $result;
		} else {
			$next = true === $result ? 'completed' : 'failed';
		}

		switch ( $next ) {
			case 'authorize':
				$response['status']       = 'in_progress';
				$response['authorizeUrl'] = $this->connection->get_authorization_url();
				break;
			case 'completed':
				$response['status'] = 'completed';
				break;
			case 'failed':
				$response = new WP_Error( 'Reconnect failed' );
				break;
		}

		return rest_ensure_response( $response );
	}

	/**
	 * Check that user has permission to change the master user.
	 *
	 * @since 6.2.0
	 * @since 7.7.0 Update so that any user with jetpack_disconnect privs can set owner.
	 *
	 * @return bool|WP_Error True if user is able to change master user.
	 */
	public function set_connection_owner_permission_callback() {
		if ( current_user_can( 'jetpack_disconnect' ) ) {
			return true;
		}

		return new WP_Error( 'invalid_user_permission_set_connection_owner', self::$user_permissions_error_msg, array( 'status' => rest_authorization_required_code() ) );
	}

	/**
	 * Change the connection owner.
	 *
	 * @since 6.2.0
	 *
	 * @param WP_REST_Request $request The request sent to the WP REST API.
	 *
	 * @return bool|WP_Error True if owner successfully changed.
	 */
	public function set_connection_owner( $request ) {
		if ( ! isset( $request['owner'] ) ) {
			return new WP_Error(
				'invalid_param',
				esc_html__( 'Invalid Parameter', 'jetpack' ),
				array( 'status' => 400 )
			);
		}

		$new_owner_id = $request['owner'];
		if ( ! user_can( $new_owner_id, 'administrator' ) ) {
			return new WP_Error(
				'new_owner_not_admin',
				esc_html__( 'New owner is not admin', 'jetpack' ),
				array( 'status' => 400 )
			);
		}

		if ( get_current_user_id() === $new_owner_id ) {
			return new WP_Error(
				'new_owner_is_current_user',
				esc_html__( 'New owner is same as current user', 'jetpack' ),
				array( 'status' => 400 )
			);
		}

		if ( ! $this->connection->is_user_connected( $new_owner_id ) ) {
			return new WP_Error(
				'new_owner_not_connected',
				esc_html__( 'New owner is not connected', 'jetpack' ),
				array( 'status' => 400 )
			);
		}

		// Update the master user in Jetpack.
		$updated = \Jetpack_Options::update_option( 'master_user', $new_owner_id );

		// Notify WPCOM about the master user change.
		$xml = new \Jetpack_IXR_Client(
			array(
				'user_id' => get_current_user_id(),
			)
		);
		$xml->query(
			'jetpack.switchBlogOwner',
			array(
				'new_blog_owner' => $new_owner_id,
			)
		);

		if ( $updated && ! $xml->isError() ) {

			// Track it.
			if ( class_exists( 'Automattic\Jetpack\Tracking' ) ) {
				$tracking = new Tracking();
				$tracking->record_user_event( 'set_connection_owner_success' );
			}

			return rest_ensure_response(
				array(
					'code' => 'success',
				)
			);
		}

		return new WP_Error(
			'error_setting_new_owner',
			esc_html__( 'Could not confirm new owner.', 'jetpack' ),
			array( 'status' => 500 )
		);
	}

}
